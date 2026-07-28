import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/axios';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'hoy', 'semana', 'mes'
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchNotificaciones = async () => {
    try {
      const res = await api.get(`/processes/notificaciones/cuenta/${user.id}`);
      setNotificaciones(res.data);
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const marcarLeido = async (id) => {
    try {
      await api.put(`/processes/notificaciones/${id}`, { leido: 1 });
      fetchNotificaciones();
    } catch (error) {
      console.error('Error marking notificacion as read:', error);
    }
  };

  const getFilteredNotificaciones = () => {
    if (filtro === 'todas') return notificaciones;

    const hoy = new Date();
    return notificaciones.filter(n => {
      const fechaNotif = new Date(n.fecha_creacion);
      const diffTime = Math.abs(hoy - fechaNotif);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filtro === 'hoy') return diffDays <= 1;
      if (filtro === 'semana') return diffDays <= 7;
      if (filtro === 'mes') return diffDays <= 30;
      return true;
    });
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const opciones = { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  const filteredNotifs = getFilteredNotificaciones();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 'bold', color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center' }}>
          <FaBell style={{ color: 'var(--primary-color)', marginRight: '12px' }} /> 
          Tus Notificaciones
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['todas', 'hoy', 'semana', 'mes'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filtro === f ? 'none' : '1px solid var(--border-color)',
              backgroundColor: filtro === f ? 'var(--primary-color)' : 'transparent',
              color: filtro === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: filtro === f ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {f === 'todas' ? 'Todas' : f === 'hoy' ? 'Hoy' : f === 'semana' ? 'Esta Semana' : 'Este Mes'}
          </button>
        ))}
      </div>

      <div>
        {filteredNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
            <FaBell size={50} color="#ccc" style={{ marginBottom: '15px' }} />
            <h5 style={{ color: 'var(--text-muted)', margin: 0 }}>No tienes notificaciones para este filtro.</h5>
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div 
              key={n.id} 
              className="notification-card"
              style={{ 
                padding: '20px',
                marginBottom: '16px',
                borderRadius: '15px', 
                backgroundColor: n.leido === 0 ? '#f0f8ff' : '#fff',
                borderLeft: n.leido === 0 ? '5px solid var(--primary-color)' : '5px solid transparent',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginRight: '16px', marginTop: '4px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: n.leido === 0 ? 'var(--primary-color)' : '#e9ecef',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.leido === 0 ? 'white' : '#6c757d'
                }}>
                  <FaInfoCircle size={20} />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h6 style={{ margin: 0, fontSize: '1.1rem', fontWeight: n.leido === 0 ? 'bold' : '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                    {n.titulo}
                    {n.leido === 0 && (
                      <span style={{ marginLeft: '10px', backgroundColor: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        Nueva
                      </span>
                    )}
                  </h6>
                  <small style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                    <FaCalendarAlt style={{ marginRight: '6px' }} />
                    {formatFecha(n.fecha_creacion)}
                  </small>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: n.mensaje }}></p>
              </div>
              
              {n.leido === 0 && (
                <div style={{ marginLeft: '16px', alignSelf: 'center' }}>
                  <button 
                    title="Marcar como leída"
                    onClick={() => marcarLeido(n.id)}
                    style={{ 
                      borderRadius: '50%', width: '35px', height: '35px', padding: '0',
                      border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <FaCheck color="green" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <style>{`
        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Notificaciones;
