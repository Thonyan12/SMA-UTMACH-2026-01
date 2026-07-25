import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Solicitudes = () => {
  const { user } = useContext(AuthContext);
  const [solicitudes, setSolicitudes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [perfilesAcademicos, setPerfilesAcademicos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, matRes, estRes, paRes, perfRes] = await Promise.all([
        api.get('/processes/solicitudes-mentoria/'),
        api.get('/academic/materias/'),
        api.get('/actors/estudiantes/'),
        api.get('/academic/perfiles-academicos/'),
        api.get('/users/perfiles/') // asumiendo que este es el endpoint para perfiles
      ]);
      
      let solData = solRes.data.sort((a, b) => b.id - a.id);
      
      const isEstudiante = user?.roles?.includes('estudiante');
      const isMentor = user?.roles?.includes('mentor');
      
      if (isEstudiante && user?.estudiante_id) {
        solData = solData.filter(s => s.estudiante_id === user.estudiante_id);
      } else if (isMentor && user?.mentor_id) {
        solData = solData.filter(s => s.mentor_id === user.mentor_id);
      }

      setSolicitudes(solData);
      setMaterias(matRes.data);
      setEstudiantes(estRes.data);
      setPerfilesAcademicos(paRes.data);
      setPerfiles(perfRes.data);
    } catch (error) {
      console.error('Error fetching data for solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Funciones de mapeo
  const getMateriaName = (id) => {
    const mat = materias.find(m => m.id === id);
    return mat ? mat.nombre : `Materia Desconocida`;
  };

  const getEstudianteName = (id) => {
    const est = estudiantes.find(e => e.id === id);
    if (!est) return `Estudiante Desconocido`;
    
    const pa = perfilesAcademicos.find(pa => pa.id === est.academico_id);
    if (!pa) return `Perfil Académico Desconocido`;

    const perf = perfiles.find(p => p.id === pa.perfil_id);
    return perf ? `${perf.nombres} ${perf.apellidos}` : `Perfil Desconocido`;
  };

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
      fetchData(); // Recargar lista completa

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
      fetchData();
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
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Gestión de Solicitudes</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Administra las solicitudes de mentorías académicas.</p>
        </div>
        {user?.roles?.includes('estudiante') && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Nueva Solicitud
          </button>
        )}
      </div>

      <div className="card-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              {user?.roles?.includes('administrador') && <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>ID</th>}
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estudiante / Materia</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Descripción</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={user?.roles?.includes('administrador') ? "5" : "4"} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Cargando solicitudes...
                </td>
              </tr>
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan={user?.roles?.includes('administrador') ? "5" : "4"} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron solicitudes registradas.</td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                <tr key={sol.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {user?.roles?.includes('administrador') && <td style={{ padding: '16px 24px', fontWeight: '500' }}>{sol.id}</td>}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500' }}>{getEstudianteName(sol.estudiante_id)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{getMateriaName(sol.materia_id)}</div>
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
                    {!user?.roles?.includes('estudiante') && sol.estado_solicitud === 'pendiente' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-primary"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          title="Aprobar"
                          onClick={() => handleUpdateState(sol.id, 'aprobada')}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Rechazar"
                          onClick={() => handleUpdateState(sol.id, 'rechazada')}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Sin acciones
                      </span>
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
