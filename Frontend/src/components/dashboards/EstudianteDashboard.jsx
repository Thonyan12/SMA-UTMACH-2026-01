import React from 'react';
import { FaBook, FaCalendarCheck, FaClock, FaCheckCircle, FaVideo } from 'react-icons/fa';
import CalendarioHibrido from './CalendarioHibrido';

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

const EstudianteDashboard = ({ stats, formatDate, navigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon={<FaBook />} label="Total Solicitudes" value={stats.total_solicitudes} color="var(--accent-primary)" />
        <StatCard icon={<FaClock />} label="Pendientes" value={stats.solicitudes_pendientes} color="var(--warning)" />
        <StatCard icon={<FaCheckCircle />} label="Aceptadas" value={stats.mentorias_aceptadas} color="var(--success)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Calendario Híbrido (Próximas Sesiones) */}
        <div className="card-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCalendarCheck style={{ color: 'var(--accent-primary)' }} /> Mi Agenda
            </h3>
          </div>
          <CalendarioHibrido sesiones={stats.proximas_sesiones} formatDate={formatDate} tipoUsuario="estudiante" />
        </div>

        {/* Historial Reciente */}
        <div className="card-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Historial de Solicitudes</h3>
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
              Aún no has realizado ninguna solicitud.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstudianteDashboard;
