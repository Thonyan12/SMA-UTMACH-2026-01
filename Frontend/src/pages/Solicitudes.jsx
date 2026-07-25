import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api/axios';

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: 1, // Por defecto para esta iteración
    materia_id: 1,
    descripcion: '',
    fecha_hora_deseada: '',
    prioridad: 'media'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/processes/solicitudes-mentoria/');
      // Ordenar por ID descendente para ver las nuevas primero
      setSolicitudes(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // El formato que espera PKG_MENTORIAS.sp_crear_solicitud (FastAPI):
      // estudiante_id, materia_id, descripcion, fecha_hora_deseada, prioridad
      const payload = {
        ...formData,
        fecha_hora_deseada: new Date(formData.fecha_hora_deseada).toISOString()
      };
      await api.post('/processes/solicitudes-mentoria/', payload);
      setShowModal(false);
      fetchSolicitudes(); // Recargar lista
    } catch (error) {
      console.error('Error creating solicitud:', error);
      alert('Error al crear la solicitud. Revisa la consola.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateState = async (id, nuevoEstado) => {
    try {
      await api.put(`/processes/solicitudes-mentoria/${id}`, { estado_solicitud: nuevoEstado });
      fetchSolicitudes();
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      alert('Error al actualizar el estado de la solicitud.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Gestión de Solicitudes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administra las solicitudes de mentoría de los estudiantes.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Nueva Solicitud
        </button>
      </div>

      <div className="card-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estudiante / Materia</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Descripción</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Cargando solicitudes...
                </td>
              </tr>
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron solicitudes registradas.</td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                <tr key={sol.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 24px' }}>#{sol.id}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500' }}>EST-{sol.estudiante_id}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MAT-{sol.materia_id}</div>
                  </td>
                  <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sol.descripcion}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Para: {formatDate(sol.fecha_hora_deseada)} (Prioridad: {sol.prioridad})
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      color: getStatusColor(sol.estado_solicitud), 
                      fontWeight: '500', 
                      textTransform: 'capitalize',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {sol.estado_solicitud}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {sol.estado_solicitud === 'pendiente' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={{ background: 'transparent', border: 'none', color: 'var(--success)', cursor: 'pointer', padding: '4px' }}
                          title="Aprobar"
                          onClick={() => handleUpdateState(sol.id, 'aprobada')}
                        >
                          <FaCheck size={18} />
                        </button>
                        <button 
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                          title="Rechazar"
                          onClick={() => handleUpdateState(sol.id, 'rechazada')}
                        >
                          <FaTimes size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Minimalista para Nueva Solicitud */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Crear Nueva Solicitud</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Descripción del problema</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none' }}
                  placeholder="Temas a revisar, dudas específicas..."
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Estudiante ID</label>
                  <input 
                    type="number" required
                    value={formData.estudiante_id}
                    onChange={(e) => setFormData({...formData, estudiante_id: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Materia ID</label>
                  <input 
                    type="number" required
                    value={formData.materia_id}
                    onChange={(e) => setFormData({...formData, materia_id: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Fecha/Hora Deseada</label>
                  <input 
                    type="datetime-local" required
                    value={formData.fecha_hora_deseada}
                    onChange={(e) => setFormData({...formData, fecha_hora_deseada: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Prioridad</label>
                  <select 
                    value={formData.prioridad}
                    onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Crear Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Solicitudes;
