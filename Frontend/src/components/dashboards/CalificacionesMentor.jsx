import React from 'react';
import { FaStar, FaRegStar, FaUserGraduate } from 'react-icons/fa';

const CalificacionesMentor = ({ calificaciones, formatDate }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} style={{ color: 'var(--warning)', marginRight: '2px' }} />);
      } else {
        stars.push(<FaRegStar key={i} style={{ color: 'var(--text-muted)', marginRight: '2px' }} />);
      }
    }
    return stars;
  };

  return (
    <div className="card-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaStar style={{ color: 'var(--warning)' }} /> Mis Calificaciones y Retroalimentación
      </h3>
      
      {(!calificaciones || calificaciones.length === 0) ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Aún no tienes calificaciones registradas. Completa sesiones de mentoría para recibir feedback.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {calificaciones.map((cal) => (
            <div key={cal.id} style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cal.materia}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(cal.fecha)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <FaStar style={{ color: 'var(--warning)', marginRight: '4px' }} />
                  {cal.puntaje_total}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Puntualidad</span>
                  <span>{renderStars(cal.puntualidad)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Claridad</span>
                  <span>{renderStars(cal.claridad)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Dominio del Tema</span>
                  <span>{renderStars(cal.dominio_tema)}</span>
                </div>
              </div>

              {cal.comentario && (
                <div style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  borderLeft: '3px solid var(--accent-primary)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  color: 'var(--text-primary)'
                }}>
                  "{cal.comentario}"
                </div>
              )}
              
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaUserGraduate /> Evaluación Anónima
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalificacionesMentor;
