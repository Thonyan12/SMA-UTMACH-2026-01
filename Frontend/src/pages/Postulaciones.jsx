import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUserGraduate } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Postulaciones = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechazandoId, setRechazandoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/processes/postulaciones');
      setPostulaciones(res.data);
    } catch (error) {
      toast.error('Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  const handleAprobar = async (id) => {
    try {
      await api.put(`/processes/postulaciones/${id}/resolver`, { accion: 'aprobar' });
      toast.success('Postulación aprobada. Se ha enviado un correo al nuevo mentor.');
      fetchPostulaciones();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al aprobar la postulación');
    }
  };

  const handleRechazar = async (id) => {
    if (!motivoRechazo.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo');
      return;
    }
    try {
      await api.put(`/processes/postulaciones/${id}/resolver`, { 
        accion: 'rechazar',
        motivo_rechazo: motivoRechazo
      });
      toast.success('Postulación rechazada y notificada');
      setRechazandoId(null);
      setMotivoRechazo('');
      fetchPostulaciones();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al rechazar la postulación');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Solicitudes de Mentores</h1>
        <p className="page-subtitle">Revisa y aprueba a los estudiantes que desean ser mentores.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {postulaciones.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <FaClock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No hay postulaciones pendientes</h3>
            <p>Todos los estudiantes han sido evaluados.</p>
          </div>
        ) : (
          postulaciones.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}>
                  <FaUserGraduate />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.estudiante_nombre}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {p.carrera_nombre} • {p.semestre}º Semestre
                  </p>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Motivo de Postulación:</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  "{p.motivo}"
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  Solicitado el: {new Date(p.fecha_solicitud).toLocaleDateString()}
                </p>
              </div>

              {rechazandoId === p.id ? (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea 
                    placeholder="Escribe el motivo del rechazo..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--danger)', minHeight: '60px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleRechazar(p.id)} className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)', padding: '8px' }}>Confirmar</button>
                    <button onClick={() => setRechazandoId(null)} className="btn-secondary" style={{ flex: 1, padding: '8px' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button onClick={() => handleAprobar(p.id)} className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaCheckCircle /> Aprobar
                  </button>
                  <button onClick={() => setRechazandoId(p.id)} className="btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaTimesCircle /> Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Postulaciones;
