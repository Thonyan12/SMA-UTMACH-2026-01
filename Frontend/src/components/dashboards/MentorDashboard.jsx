import React from 'react';
import { FaChalkboardTeacher, FaCalendarCheck, FaCheckCircle, FaStar, FaVideo, FaClock } from 'react-icons/fa';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: '1.5rem', color: color, background: `${color}15`, padding: '12px', borderRadius: '10px' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>{value}</div>
    </div>
  </div>
);

const MentorDashboard = ({ stats, formatDate, navigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon={<FaChalkboardTeacher />} label="Pendientes de Atención" value={stats.pendientes_atencion || 0} color="var(--warning)" />
        <StatCard icon={<FaCheckCircle />} label="Sesiones Completadas" value={stats.mentorias_completadas || 0} color="var(--success)" />
        <StatCard icon={<FaStar />} label="Promedio Calificación" value={stats.promedio_calificaciones || "0.0"} color="var(--accent-primary)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Próximas Sesiones */}
        <div className="card-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCalendarCheck style={{ color: 'var(--accent-primary)' }} /> Próximas Sesiones
            </h3>
          </div>
          
          {stats.proximas_sesiones?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.proximas_sesiones.map((sesion, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1.1rem' }}>
                      {sesion.materia}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '500' }}>Estudiante:</span> {sesion.estudiante}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                      "{sesion.descripcion}"
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                        Prioridad: {sesion.prioridad}
                      </span>
                      <span>
                        <FaClock style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {formatDate(sesion.inicio)} • {new Date(sesion.inicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                  </div>
                  {sesion.enlace && (
                    <a href={sesion.enlace} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaVideo /> Unirse
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tienes sesiones programadas próximamente.
            </div>
          )}
        </div>

        {/* Historial Reciente */}
        <div className="card-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Historial Reciente</h3>
          {stats.historial?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.historial.map((hist, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < stats.historial.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{hist.materia}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(hist.fecha)}</div>
                  </div>
                  <span className="status-text" style={{ 
                    color: hist.estado === 'aceptada' || hist.estado === 'completada' ? 'var(--success)' : 
                           hist.estado === 'pendiente' || hist.estado === 'asignada' ? 'var(--warning)' : 
                           hist.estado === 'rechazada' ? 'var(--danger)' : 'var(--text-muted)'
                  }}>
                    {hist.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aún no tienes historial de solicitudes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
