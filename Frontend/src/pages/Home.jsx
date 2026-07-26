import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Home = () => {
  const { user } = useContext(AuthContext);
  
  const isAdmin = user?.roles?.includes('administrador');
  const isEstudiante = user?.roles?.includes('estudiante');
  const isMentor = user?.roles?.includes('mentor');

  const [stats, setStats] = useState({ mentores: 0, sesiones: 0, solicitudes: 0 });
  const [actividad, setActividad] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [perfilesAcademicos, setPerfilesAcademicos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Para el admin dashboard
  const [dashboardStats, setDashboardStats] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const promises = [
        api.get('/actors/mentores/'),
        api.get('/processes/sesiones-mentoria/'),
        api.get('/processes/solicitudes-mentoria/'),
        api.get('/academic/materias/'),
        api.get('/actors/estudiantes/'),
        api.get('/academic/perfiles-academicos/'),
        api.get('/users/perfiles/'),
        api.get('/academic/carreras/')
      ];
      
      if (isAdmin) {
        promises.push(api.get('/processes/estadisticas/'));
      }

      const res = await Promise.all(promises);
      
      const mentoresRes = res[0];
      const sesionesRes = res[1];
      const solicitudesRes = res[2];
      const matRes = res[3];
      const estRes = res[4];
      const paRes = res[5];
      const perfRes = res[6];
      const carRes = res[7];

      if (isAdmin && res[8]) {
        setDashboardStats(res[8].data);
      }

      const mentores = mentoresRes.data;
      let sesiones = sesionesRes.data;
      let solicitudes = solicitudesRes.data;

      if (isEstudiante && user?.estudiante_id) {
        solicitudes = solicitudes.filter(s => s.estudiante_id === user.estudiante_id);
        sesiones = sesiones.filter(s => solicitudes.some(sol => sol.id === s.solicitud_id));
      } else if (isMentor && user?.mentor_id) {
        solicitudes = solicitudes.filter(s => s.mentor_id === user.mentor_id);
        sesiones = sesiones.filter(s => solicitudes.some(sol => sol.id === s.solicitud_id));
      }

      setMaterias(matRes.data);
      setEstudiantes(estRes.data);
      setPerfilesAcademicos(paRes.data);
      setPerfiles(perfRes.data);
      setCarreras(carRes.data);

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
  }, [isAdmin, isEstudiante, isMentor, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const getStudentInfo = () => {
    if (!isEstudiante || !user?.estudiante_id) return null;
    const est = estudiantes.find(e => e.id === user.estudiante_id);
    if (!est) return null;
    
    const pa = perfilesAcademicos.find(pa => pa.id === est.academico_id);
    if (!pa) return null;

    const carrera = carreras.find(c => c.id === pa.carrera_id);
    const semestre = est.semestre || 'Desconocido';
    const nombreCarrera = carrera ? carrera.nombre : 'Carrera Desconocida';

    return { semestre, nombreCarrera };
  };

  const studentInfo = getStudentInfo();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Bienvenido {isAdmin ? 'Administrador' : isMentor ? 'Mentor' : 'Estudiante'}: {user?.nombres ? `${user.nombres} ${user.apellidos}` : 'Usuario'}
        </h1>
        {isEstudiante && studentInfo && (
          <div style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: '500', marginBottom: '8px' }}>
            Cursando el {studentInfo.semestre} Semestre en {studentInfo.nombreCarrera}
          </div>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Aquí tienes un resumen de la actividad reciente.
        </p>
      </div>

      {/* Tarjetas de Resumen (Dashboard) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        <div className="card-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '1.5rem' }}>
            <FaUserGraduate />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Mentores Activos</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '3px' }}></span> : stats.mentores}
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
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '3px' }}></span> : stats.sesiones}
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
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '3px' }}></span> : stats.solicitudes}
            </p>
          </div>
        </div>

      </div>

      {/* ADMIN DASHBOARD CHARTS */}
      {isAdmin && dashboardStats && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Panel Estadístico del Sistema</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            
            {/* Gráfico de Pastel - Solicitudes por Estado */}
            <div className="card-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Distribución de Solicitudes por Estado
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardStats.solicitudes_por_estado}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {dashboardStats.solicitudes_por_estado.map((entry, index) => {
                        const COLORS = {
                          'pendiente': '#f39c12',
                          'aceptada': '#27ae60',
                          'rechazada': '#e74c3c',
                          'cancelada': '#95a5a6',
                          'completada': '#3498db'
                        };
                        return <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Barras - Solicitudes por Materia */}
            <div className="card-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Top Materias Solicitadas
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={dashboardStats.solicitudes_por_materia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sección de Actividad Reciente */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
        {isEstudiante ? 'Mis actividades recientes' : 'Actividad Reciente'}
      </h2>
      <div className="card-panel table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              {isAdmin && <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Solicitud ID</th>}
              {!isEstudiante && <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estudiante</th>}
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tutoría (Materia)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha Creada</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha Aceptada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner-container">
                    <div className="spinner"></div>
                  </div>
                </td>
              </tr>
            ) : actividad.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay actividad reciente.</td>
              </tr>
            ) : (
              actividad.map((act) => {
                const materia = materias.find(m => m.id === act.materia_id);
                return (
                  <tr key={act.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {isAdmin && <td style={{ padding: '16px 24px', fontWeight: '500' }}>{act.id}</td>}
                    {!isEstudiante && <td style={{ padding: '16px 24px' }}>{getEstudianteName(act.estudiante_id)}</td>}
                    <td style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {materia ? materia.nombre : 'Materia Desconocida'}
                    </td>
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
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                      {act.estado_solicitud === 'aceptada' ? formatDate(act.fecha_actualizacion) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
