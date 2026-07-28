import React from 'react';
import { FaUsers, FaUserGraduate, FaFileAlt, FaCheckDouble, FaStar } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportCSV = () => {
    if (!stats?.ranking_mentores) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ranking,Mentor,Promedio,Total Evaluaciones\n";
    
    stats.ranking_mentores.forEach((mentor, idx) => {
      const prom = mentor.promedio > 0 ? mentor.promedio.toFixed(1) : "N/A";
      csvContent += `${idx + 1},"${mentor.nombre}",${prom},${mentor.total_calificaciones}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_mentores_utmach.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!stats?.ranking_mentores) return;
    
    const doc = new jsPDF();
    doc.text("Reporte de Rendimiento de Mentores - UTMACH", 14, 20);
    
    const tableColumn = ["Ranking", "Mentor", "Promedio", "Evaluaciones"];
    const tableRows = [];
    
    stats.ranking_mentores.forEach((mentor, idx) => {
      const prom = mentor.promedio > 0 ? mentor.promedio.toFixed(1) : "N/A";
      tableRows.push([idx + 1, mentor.nombre, prom, mentor.total_calificaciones]);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    
    doc.save("reporte_mentores_utmach.pdf");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Panel de Administración</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={exportCSV} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            Descargar CSV
          </button>
          <button className="btn-primary" onClick={exportPDF} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            Descargar PDF
          </button>
        </div>
      </div>

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

      {/* Rendimiento de Mentores */}
      {stats.ranking_mentores && stats.ranking_mentores.length > 0 && (
        <div className="card-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Rendimiento de Mentores (Ranking)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '12px 16px' }}>Mentor</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Promedio (Estrellas)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total Evaluaciones</th>
              </tr>
            </thead>
            <tbody>
              {stats.ranking_mentores.map((mentor, idx) => (
                <tr key={mentor.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {idx + 1}
                    </div>
                    {mentor.nombre}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '1.1rem', color: mentor.promedio >= 4 ? 'var(--success)' : mentor.promedio >= 3 ? 'var(--warning)' : 'var(--danger)' }}>
                      {mentor.promedio > 0 ? mentor.promedio.toFixed(1) : 'N/A'} <FaStar style={{ color: 'var(--warning)' }} />
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {mentor.total_calificaciones}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
