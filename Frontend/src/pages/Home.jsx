import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck } from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Panel Principal</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Bienvenido al Sistema de Mentorías Académicas de la UTMACH.
      </p>

      {/* Tarjetas de Resumen (Dashboard) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '1.5rem' }}>
            <FaUserGraduate />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Mentores Activos</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>124</p>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--success)', fontSize: '1.5rem' }}>
            <FaCalendarCheck />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Sesiones de Hoy</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>18</p>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--warning)', fontSize: '1.5rem' }}>
            <FaChalkboardTeacher />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Solicitudes Pendientes</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>5</p>
          </div>
        </div>

      </div>

      {/* Sección de Actividad Reciente */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Actividad Reciente</h2>
      <div className="card-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estudiante</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Materia</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px 24px' }}>Juan Pérez</td>
              <td style={{ padding: '16px 24px' }}>Cálculo Diferencial</td>
              <td style={{ padding: '16px 24px' }}><span style={{ color: 'var(--warning)', fontWeight: '500' }}>Pendiente</span></td>
              <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>24 Oct 2026</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px 24px' }}>María González</td>
              <td style={{ padding: '16px 24px' }}>Física I</td>
              <td style={{ padding: '16px 24px' }}><span style={{ color: 'var(--success)', fontWeight: '500' }}>Aprobada</span></td>
              <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>23 Oct 2026</td>
            </tr>
            <tr>
              <td style={{ padding: '16px 24px' }}>Carlos Ruiz</td>
              <td style={{ padding: '16px 24px' }}>Programación Estructurada</td>
              <td style={{ padding: '16px 24px' }}><span style={{ color: 'var(--success)', fontWeight: '500' }}>Aprobada</span></td>
              <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>22 Oct 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
