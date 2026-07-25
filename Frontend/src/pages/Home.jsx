import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck } from 'react-icons/fa';
import api from '../api/axios';

const Home = () => {
  const [stats, setStats] = useState({ mentores: 0, sesiones: 0, solicitudes: 0 });
  const [actividad, setActividad] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [perfilesAcademicos, setPerfilesAcademicos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [mentoresRes, sesionesRes, solicitudesRes, matRes, estRes, paRes, perfRes] = await Promise.all([
          api.get('/actors/mentores/'),
          api.get('/processes/sesiones-mentoria/'),
          api.get('/processes/solicitudes-mentoria/'),
          api.get('/academic/materias/'),
          api.get('/actors/estudiantes/'),
          api.get('/academic/perfiles-academicos/'),
          api.get('/users/perfiles/')
        ]);

        const mentores = mentoresRes.data;
        const sesiones = sesionesRes.data;
        const solicitudes = solicitudesRes.data;

        setMaterias(matRes.data);
        setEstudiantes(estRes.data);
        setPerfilesAcademicos(paRes.data);
        setPerfiles(perfRes.data);

        setStats({
          mentores: mentores.length,
          sesiones: sesiones.length,
          solicitudes: solicitudes.filter(s => s.estado_solicitud === 'pendiente').length
        });

        // Tomar las últimas 5 solicitudes como "Actividad Reciente"
        setActividad(solicitudes.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'var(--warning)';
      case 'aprobada': return 'var(--success)';
      case 'rechazada': return 'var(--danger)';
      case 'cancelada': return 'var(--text-muted)';
      default: return 'var(--text-primary)';
    }
  };

  // Funciones de mapeo
  const getEstudianteName = (id) => {
    const est = estudiantes.find(e => e.id === id);
    if (!est) return `Estudiante Desconocido`;
    
    const pa = perfilesAcademicos.find(pa => pa.id === est.academico_id);
    if (!pa) return `Perfil Académico Desconocido`;

    const perf = perfiles.find(p => p.id === pa.perfil_id);
    return perf ? `${perf.nombres} ${perf.apellidos}` : `Perfil Desconocido`;
  };

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
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              {loading ? '...' : stats.mentores}
            </p>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--success)', fontSize: '1.5rem' }}>
            <FaCalendarCheck />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Total de Sesiones</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              {loading ? '...' : stats.sesiones}
            </p>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--warning)', fontSize: '1.5rem' }}>
            <FaChalkboardTeacher />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Solicitudes Pendientes</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              {loading ? '...' : stats.solicitudes}
            </p>
          </div>
        </div>

      </div>

      {/* Sección de Actividad Reciente */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Actividad Reciente</h2>
      <div className="card-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Solicitud ID</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estudiante</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha Creada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando actividad...</td>
              </tr>
            ) : actividad.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay actividad reciente.</td>
              </tr>
            ) : (
              actividad.map((act) => (
                <tr key={act.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{act.id}</td>
                  <td style={{ padding: '16px 24px' }}>{getEstudianteName(act.estudiante_id)}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      color: getStatusColor(act.estado_solicitud), 
                      fontWeight: '500', 
                      textTransform: 'capitalize',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {act.estado_solicitud}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                    {formatDate(act.fecha_creacion)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
