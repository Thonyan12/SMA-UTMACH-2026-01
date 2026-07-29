import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaFlag, FaCheckCircle, FaSearch, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7', icon: <FaClock /> },
  revisado:  { label: 'Revisado',  color: '#3b82f6', bg: '#dbeafe', icon: <FaSearch /> },
  resuelto:  { label: 'Resuelto',  color: '#10b981', bg: '#d1fae5', icon: <FaCheckCircle /> },
};

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/processes/reportes/');
      setReportes(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const actualizarEstado = async (id, nuevoEstado) => {
    setUpdatingId(id);
    try {
      await api.put(`/processes/reportes/${id}/estado`, { estado: nuevoEstado });
      setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      toast.success(`Reporte marcado como "${estadoConfig[nuevoEstado].label}"`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const reportesFiltrados = filtroEstado === 'todos'
    ? reportes
    : reportes.filter(r => r.estado === filtroEstado);

  const conteos = {
    todos: reportes.length,
    pendiente: reportes.filter(r => r.estado === 'pendiente').length,
    revisado: reportes.filter(r => r.estado === 'revisado').length,
    resuelto: reportes.filter(r => r.estado === 'resuelto').length,
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaFlag /> Reportes de Incidencias
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Gestiona los reportes enviados por los usuarios desde las salas de sesión.
        </p>
      </header>

      {/* Filtros / Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['todos', 'pendiente', 'revisado', 'resuelto'].map(estado => {
          const cfg = estado === 'todos' ? { label: 'Todos', color: '#6366f1', bg: '#ede9fe' } : estadoConfig[estado];
          const isActive = filtroEstado === estado;
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: `2px solid ${isActive ? cfg.color : 'var(--border-color)'}`,
                backgroundColor: isActive ? cfg.bg : 'transparent',
                color: isActive ? cfg.color : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
              }}
            >
              {cfg.label}
              <span style={{
                backgroundColor: isActive ? cfg.color : 'var(--border-color)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                borderRadius: '999px',
                padding: '1px 8px',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}>
                {conteos[estado]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Reportes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Cargando reportes...
        </div>
      ) : reportesFiltrados.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FaCheckCircle size={40} style={{ marginBottom: '12px', color: '#10b981' }} />
          <p style={{ fontSize: '1.1rem' }}>No hay reportes {filtroEstado !== 'todos' ? `con estado "${estadoConfig[filtroEstado]?.label}"` : ''}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reportesFiltrados.map(reporte => {
            const cfg = estadoConfig[reporte.estado] || estadoConfig.pendiente;
            return (
              <div key={reporte.id} className="card" style={{ padding: '20px', borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        padding: '3px 12px',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        #{reporte.id} · {formatDate(reporte.fecha_creacion)}
                      </span>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>
                        {reporte.sesion_titulo}
                      </strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
                        (Sesión #{reporte.sesion_id})
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <strong>Reportado por:</strong> {reporte.reportador_nombre}
                    </p>

                    <div style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      marginTop: '8px'
                    }}>
                      <FaExclamationTriangle style={{ color: '#f59e0b', marginRight: '8px' }} />
                      {reporte.descripcion}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                    {['pendiente', 'revisado', 'resuelto'].map(estado => (
                      <button
                        key={estado}
                        onClick={() => actualizarEstado(reporte.id, estado)}
                        disabled={reporte.estado === estado || updatingId === reporte.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${estadoConfig[estado].color}`,
                          backgroundColor: reporte.estado === estado ? estadoConfig[estado].bg : 'transparent',
                          color: estadoConfig[estado].color,
                          fontWeight: reporte.estado === estado ? '700' : '500',
                          cursor: reporte.estado === estado ? 'default' : 'pointer',
                          opacity: updatingId === reporte.id ? 0.6 : 1,
                          fontSize: '0.82rem',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {estadoConfig[estado].icon}
                        {reporte.estado === estado ? '✓ ' : ''}{estadoConfig[estado].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reportes;
