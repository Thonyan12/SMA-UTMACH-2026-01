import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaAngleDown, FaAngleUp, FaFileCsv, FaChartPie, FaChartBar } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Auditoria = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [accionFiltro, setAccionFiltro] = useState('');
  const [tablaFiltro, setTablaFiltro] = useState('');
  const [tablasOptions, setTablasOptions] = useState([]);
  
  const [stats, setStats] = useState({ acciones: [], tablas: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Paleta de colores para el PieChart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchOptions();
    fetchStats();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/processes/auditoria/tablas');
      setTablasOptions(res.data);
    } catch (error) {
      console.error("Error al cargar opciones de tablas", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/processes/auditoria/stats');
      setStats(res.data);
    } catch (error) {
      console.error("Error al cargar analíticas", error);
    }
  };

  const fetchAuditoria = async () => {
    setIsLoading(true);
    try {
      let url = `/processes/auditoria?skip=${skip}&limit=${limit}`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) url += `&fecha_fin=${fechaFin}`;
      if (accionFiltro) url += `&accion=${accionFiltro}`;
      if (tablaFiltro) url += `&tabla_nombre=${tablaFiltro}`;
      
      const res = await api.get(url);
      setAuditorias(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Error al cargar la auditoría');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoria();
  }, [skip]); // Refetch cuando cambie la página

  const handleFiltrar = () => {
    setSkip(0);
    fetchAuditoria();
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionColor = (accion) => {
    if (accion.toUpperCase() === 'INSERT') return 'var(--success)';
    if (accion.toUpperCase() === 'UPDATE') return 'var(--warning)';
    if (accion.toUpperCase() === 'DELETE') return 'var(--danger)';
    return 'var(--text-secondary)';
  };

  const exportarCSV = () => {
    if (auditorias.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    const headers = ['ID', 'Fecha', 'Usuario', 'IP', 'Tabla', 'Acción', 'Descripción'];
    const rows = auditorias.map(item => [
      item.id,
      item.fecha,
      item.usuario,
      item.ip || 'Local',
      item.tabla,
      item.accion,
      item.descripcion || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_sma_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Reporte exportado a CSV');
  };

  // Visor Diff Inteligente
  const renderDiffViewer = (anterioresStr, nuevosStr) => {
    try {
      const ant = anterioresStr ? JSON.parse(anterioresStr) : {};
      const nue = nuevosStr ? JSON.parse(nuevosStr) : {};
      
      const todasLasClaves = Array.from(new Set([...Object.keys(ant), ...Object.keys(nue)]));

      return (
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '15px', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.9rem', overflowX: 'auto' }}>
          {todasLasClaves.map(key => {
            const valAnt = ant[key];
            const valNue = nue[key];
            const hasChanged = JSON.stringify(valAnt) !== JSON.stringify(valNue);

            if (!hasChanged) {
              return (
                <div key={key} style={{ padding: '2px 8px', color: '#858585' }}>
                  &nbsp;&nbsp; {key}: {JSON.stringify(valAnt)}
                </div>
              );
            }

            return (
              <React.Fragment key={key}>
                {valAnt !== undefined && (
                  <div style={{ backgroundColor: 'rgba(214, 56, 56, 0.2)', color: '#ff6b6b', padding: '2px 8px' }}>
                    - {key}: {JSON.stringify(valAnt)}
                  </div>
                )}
                {valNue !== undefined && (
                  <div style={{ backgroundColor: 'rgba(35, 209, 96, 0.2)', color: '#2ecc71', padding: '2px 8px' }}>
                    + {key}: {JSON.stringify(valNue)}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    } catch (e) {
      return <span style={{ color: 'var(--danger)' }}>Error procesando el Diff Viewer (Data inválida)</span>;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-primary)' }}>Auditoría del Sistema</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Módulo avanzado de registro, analíticas y trazabilidad</p>
        </div>
        <button 
          onClick={exportarCSV}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          <FaFileCsv size={18} /> Exportar CSV
        </button>
      </div>

      {/* DASHBOARD ANALÍTICO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
        {/* Pie Chart: Acciones */}
        <div className="card-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartPie /> Distribución de Acciones
          </h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.acciones} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                  {stats.acciones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Tablas */}
        <div className="card-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartBar /> Top Tablas Afectadas
          </h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tablas}>
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="card-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Desde:</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Hasta:</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Acción:</label>
          <select value={accionFiltro} onChange={(e) => setAccionFiltro(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
            <option value="">Todas</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Tabla:</label>
          <select value={tablaFiltro} onChange={(e) => setTablaFiltro(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white', minWidth: '150px' }}>
            <option value="">Todas</option>
            {tablasOptions.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={handleFiltrar} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <FaSearch /> Filtrar
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="card-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Fecha</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Usuario</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>IP</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Tabla</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Acción</th>
                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Cargando datos...</td></tr>
              ) : auditorias.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No se encontraron registros.</td></tr>
              ) : (
                auditorias.map(item => (
                  <React.Fragment key={item.id}>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '15px', color: 'var(--text-muted)' }}>#{item.id}</td>
                      <td style={{ padding: '15px', fontWeight: '500' }}>{formatFecha(item.fecha)}</td>
                      <td style={{ padding: '15px' }}>{item.usuario}</td>
                      <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.ip || 'Local'}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{item.tabla}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ backgroundColor: `${getActionColor(item.accion)}20`, color: getActionColor(item.accion), padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {item.accion.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button onClick={() => toggleExpand(item.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Detalles {expandedId === item.id ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr style={{ backgroundColor: '#fdfdfd' }}>
                        <td colSpan="7" style={{ padding: '20px', borderBottom: '2px solid var(--border-color)' }}>
                          <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}><strong>Descripción:</strong> {item.descripcion}</p>
                          
                          {/* Diff Viewer */}
                          {(item.datos_anteriores || item.datos_nuevos) && (
                            <div>
                              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Diff Viewer (Cambios)</h5>
                              {renderDiffViewer(item.datos_anteriores, item.datos_nuevos)}
                            </div>
                          )}
                          
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8f9fa', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Mostrando {auditorias.length > 0 ? skip + 1 : 0} - {Math.min(skip + limit, total)} de {total} registros
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSkip(skip - limit)}
              disabled={skip === 0}
              style={{ padding: '8px 16px', backgroundColor: skip === 0 ? '#e9ecef' : 'white', color: skip === 0 ? '#6c757d' : 'var(--accent-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: skip === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              <FaChevronLeft /> Anterior
            </button>
            <button 
              onClick={() => setSkip(skip + limit)}
              disabled={skip + limit >= total}
              style={{ padding: '8px 16px', backgroundColor: skip + limit >= total ? '#e9ecef' : 'white', color: skip + limit >= total ? '#6c757d' : 'var(--accent-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: skip + limit >= total ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              Siguiente <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
