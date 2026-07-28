import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import EstudianteDashboard from '../components/dashboards/EstudianteDashboard';
import MentorDashboard from '../components/dashboards/MentorDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Home = () => {
  const { user } = useContext(AuthContext);
  
  const isAdmin = user?.roles?.includes('administrador');
  const isEstudiante = user?.roles?.includes('estudiante');
  const isMentor = user?.roles?.includes('mentor');

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await api.get('/processes/estadisticas/');
        setDashboardData(res.data);
      } else if (isMentor && user?.mentor_id) {
        const res = await api.get(`/processes/dashboard/mentor/${user.mentor_id}`);
        setDashboardData(res.data);
      } else if (isEstudiante && user?.estudiante_id) {
        const res = await api.get(`/processes/dashboard/estudiante/${user.estudiante_id}`);
        setDashboardData(res.data);
      }
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

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '24px' }}>
          Mi Panel
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <Skeleton height="120px" borderRadius="12px" />
          <Skeleton height="120px" borderRadius="12px" />
          <Skeleton height="120px" borderRadius="12px" />
        </div>
        <Skeleton height="300px" borderRadius="12px" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
          ¡Hola, {user?.nombres?.split(' ')[0] || 'Usuario'}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
          Aquí tienes un resumen de tu actividad en el sistema de mentorías.
        </p>
      </header>

      {isAdmin && <AdminDashboard stats={dashboardData} />}
      {!isAdmin && isMentor && <MentorDashboard stats={dashboardData} formatDate={formatDate} />}
      {!isAdmin && !isMentor && isEstudiante && <EstudianteDashboard stats={dashboardData} formatDate={formatDate} />}
      {!isAdmin && !isMentor && !isEstudiante && (
        <div className="card-panel" style={{ padding: '40px', textAlign: 'center' }}>
          No tienes un rol asignado que permita visualizar un panel de control.
        </div>
      )}
    </div>
  );
};

export default Home;
