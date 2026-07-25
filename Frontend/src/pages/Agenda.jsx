import React, { useState, useEffect } from 'react';
import { FaVideo, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import api from '../api/axios';

const Agenda = () => {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSesiones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/processes/sesiones-mentoria/');
      // Ordenar cronológicamente ascendente (próximas primero), e ignorar canceladas
      const activas = response.data.filter(s => s.estado_sesion !== 'cancelada');
      setSesiones(activas.sort((a, b) => new Date(a.inicio) - new Date(b.inicio)));
    } catch (error) {
      console.error('Error fetching sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSesiones();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta sesión?')) return;
    try {
      await api.delete(`/processes/sesiones-mentoria/${id}`);
      fetchSesiones();
    } catch (error) {
      console.error('Error cancelando sesión:', error);
      alert('Error al cancelar la sesión.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Agenda de Mentorías</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tus sesiones programadas y accesos a reuniones.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Cargando agenda...
          </div>
        ) : sesiones.length === 0 ? (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tienes sesiones programadas en tu agenda.
          </div>
        ) : (
          sesiones.map((ses) => (
            <div key={ses.id} className="card-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-primary)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>{formatDate(ses.inicio)}</h3>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {formatTime(ses.inicio)} - {formatTime(ses.fin)}
                  </div>
                </div>
                <span style={{ 
                  color: 'var(--accent-primary)', backgroundColor: 'var(--bg-secondary)', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' 
                }}>
                  {ses.estado_sesion}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Solicitud Asociada:</strong> #{ses.solicitud_id}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                {ses.enlace_teams ? (
                  <a href={ses.enlace_teams} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                    <FaVideo /> Unirse a la Sala
                  </a>
                ) : (
                  <button className="btn-secondary" style={{ flex: 1 }} disabled>
                    Sin Enlace
                  </button>
                )}
                <button 
                  className="btn-secondary" 
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '10px' }}
                  title="Cancelar Sesión"
                  onClick={() => handleCancel(ses.id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Agenda;
