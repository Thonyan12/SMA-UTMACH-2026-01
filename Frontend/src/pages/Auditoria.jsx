import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Auditoria = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAuditoria = async () => {
    setIsLoading(true);
    try {
      let url = `/processes/auditoria?skip=${skip}&limit=${limit}`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) url += `&fecha_fin=${fechaFin}`;
      
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

  const formatJSON = (jsonStr) => {
    if (!jsonStr) return 'N/A';
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  const renderDetallesAmigables = (jsonStr) => {
    if (!jsonStr) return <span style={{ color: 'var(--text-muted)' }}>Sin detalles</span>;
    try {
      const obj = JSON.parse(jsonStr);
      return (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {Object.entries(obj).map(([key, value]) => (
            <li key={key} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <strong style={{ minWidth: '140px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}:
              </strong>
              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                {value === 'N/A' || value === null || value === '' ? <em style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>No aplica</em> : String(value).toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      );
    } catch (e) {
      return <span>{jsonStr}</span>;
    }
  };

  const getActionColor = (accion) => {
    if (accion.toUpperCase() === 'INSERT') return 'var(--success)';
    if (accion.toUpperCase() === 'UPDATE') return 'var(--warning)';
    if (accion.toUpperCase() === 'DELETE') return 'var(--danger)';
    return 'var(--text-secondary)';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-primary)' }}>Auditoría del Sistema</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Registro de eventos y cambios en la base de datos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Desde:</label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Hasta:</label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
        <button 
          onClick={handleFiltrar}
          style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
        >
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
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No se encontraron registros en este periodo.</td></tr>
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
                        <span style={{ 
                          backgroundColor: `${getActionColor(item.accion)}20`, 
                          color: getActionColor(item.accion), 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontWeight: 'bold', 
                          fontSize: '0.8rem' 
                        }}>
                          {item.accion.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          Detalles {expandedId === item.id ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                      </td>
                    </tr>
                    {/* Fila expandida con detalles JSON */}
                    {expandedId === item.id && (
                      <tr style={{ backgroundColor: '#fdfdfd' }}>
                        <td colSpan="7" style={{ padding: '20px', borderBottom: '2px solid var(--border-color)' }}>
                          <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}><strong>Descripción:</strong> {item.descripcion}</p>
                          {item.detalles_json ? (
                            <div>
                              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Detalles del Cambio</h5>
                              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                {renderDetallesAmigables(item.detalles_json)}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div>
                                <h5 style={{ margin: '0 0 10px 0', color: 'var(--danger)', fontSize: '0.9rem' }}>Datos Anteriores</h5>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                  {item.datos_anteriores ? renderDetallesAmigables(item.datos_anteriores) : <span style={{ color: 'var(--text-muted)' }}>Ninguno</span>}
                                </div>
                              </div>
                              <div>
                                <h5 style={{ margin: '0 0 10px 0', color: 'var(--success)', fontSize: '0.9rem' }}>Datos Nuevos</h5>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                  {item.datos_nuevos ? renderDetallesAmigables(item.datos_nuevos) : <span style={{ color: 'var(--text-muted)' }}>Ninguno</span>}
                                </div>
                              </div>
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
              style={{ 
                padding: '8px 16px', backgroundColor: skip === 0 ? '#e9ecef' : 'white', 
                color: skip === 0 ? '#6c757d' : 'var(--accent-primary)', border: '1px solid var(--border-color)', 
                borderRadius: '8px', cursor: skip === 0 ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' 
              }}
            >
              <FaChevronLeft /> Anterior
            </button>
            <button 
              onClick={() => setSkip(skip + limit)}
              disabled={skip + limit >= total}
              style={{ 
                padding: '8px 16px', backgroundColor: skip + limit >= total ? '#e9ecef' : 'white', 
                color: skip + limit >= total ? '#6c757d' : 'var(--accent-primary)', border: '1px solid var(--border-color)', 
                borderRadius: '8px', cursor: skip + limit >= total ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' 
              }}
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
