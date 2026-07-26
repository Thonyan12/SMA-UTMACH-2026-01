import React from 'react';
import { FaUsers, FaUserGraduate, FaFileAlt, FaCheckDouble } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const COLORS = ['#084C84', '#B92C34', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

const AdminDashboard = ({ stats }) => {
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando estadísticas del administrador...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon={<FaUserGraduate />} label="Total Estudiantes" value={stats.total_estudiantes} color="var(--accent-primary)" />
        <StatCard icon={<FaUsers />} label="Total Mentores" value={stats.total_mentores} color="var(--accent-secondary)" />
        <StatCard icon={<FaFileAlt />} label="Solicitudes Creadas" value={stats.total_solicitudes} color="var(--warning)" />
        <StatCard icon={<FaCheckDouble />} label="Mentorías Activas" value={
            (stats.solicitudes_por_estado.find(s => s.name === 'aceptada')?.value || 0) + 
            (stats.solicitudes_por_estado.find(s => s.name === 'asignada')?.value || 0)
        } color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Distribución por Estado (Pie Chart) */}
        <div className="card-panel" style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Estados de Solicitudes</h3>
          <ResponsiveContainer width="100%" height="100%" minHeight={0}>
            <PieChart>
              <Pie
                data={stats.solicitudes_por_estado}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                style={{ outline: 'none' }}
              >
                {stats.solicitudes_por_estado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Materia (Bar Chart) */}
        <div className="card-panel" style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Demanda por Materia</h3>
          <ResponsiveContainer width="100%" height="100%" minHeight={0}>
            <BarChart
              data={stats.solicitudes_por_materia}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                type="category" 
                tick={{fontSize: 11, angle: -45, textAnchor: 'end'}} 
                interval={0} 
              />
              <YAxis type="number" />
              <Tooltip />
              <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]}>
                {stats.solicitudes_por_materia.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
