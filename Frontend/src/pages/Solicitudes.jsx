import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FaPlus, FaCheck, FaTimes, FaUserCircle } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Solicitudes = () => {
  const { user } = useContext(AuthContext);
  const [solicitudes, setSolicitudes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [mentores, setMentores] = useState([]);
  const [perfilesAcademicos, setPerfilesAcademicos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreraMaterias, setCarreraMaterias] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null); // Para el modal de perfil

  const [formData, setFormData] = useState({
    materia_id: '',
    descripcion: '',
    fecha_hora_deseada: '',
    prioridad: 'media'
  });
  const [submitting, setSubmitting] = useState(false);
  const [obscenityError, setObscenityError] = useState('');
  const [datetimeError, setDatetimeError] = useState('');
  
  const BAD_WORDS = ['puta', 'mierda', 'pendejo', 'idiota', 'estupido', 'cojudo', 'verga', 'cabron', 'maricon', 'perra'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, matRes, estRes, mentRes, paRes, perfRes, carRes, facRes, cmRes] = await Promise.all([
        api.get('/processes/solicitudes-mentoria/'),
        api.get('/academic/materias/'),
        api.get('/actors/estudiantes/'),
        api.get('/actors/mentores/'),
        api.get('/academic/perfiles-academicos/'),
        api.get('/users/perfiles/'),
        api.get('/academic/carreras/'),
        api.get('/academic/facultades/'),
        api.get('/academic/carrera-materias/')
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
      setMentores(mentRes.data);
      setPerfilesAcademicos(paRes.data);
      setPerfiles(perfRes.data);
      setCarreras(carRes.data);
      setFacultades(facRes.data);
      setCarreraMaterias(cmRes.data);
    } catch (error) {
      console.error('Error fetching data for solicitudes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funciones de mapeo
  const getMateriaName = (id) => {
    const mat = materias.find(m => m.id === id);
    return mat ? mat.nombre : `Materia Desconocida`;
  };

  const getEstudianteName = (id) => {
    const est = estudiantes.find(e => e.id === id);
    if (!est) return `Estudiante Desconocido`;
    
    const pa = perfilesAcademicos.find(pa => pa.id === est.academico_id);
    const perf = perfiles.find(p => p.id === pa?.perfil_id);
    return perf ? `${perf.nombres} ${perf.apellidos}` : `Perfil Desconocido`;
  };

  const getMentorName = (id) => {
    if (!id) return null;
    const men = mentores.find(m => m.id === id);
    if (!men) return 'Mentor Desconocido';
    
    const pa = perfilesAcademicos.find(p => p.id === men.academico_id);
    const perf = perfiles.find(p => p.id === pa?.perfil_id);
    return perf ? `${perf.nombres} ${perf.apellidos}` : 'Perfil Desconocido';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'var(--warning)';
      case 'aceptada': return 'var(--success)';
      case 'rechazada': return 'var(--danger)';
      case 'cancelada': return 'var(--text-muted)';
      case 'completada': return 'var(--accent-primary)';
      default: return 'var(--text-primary)';
    }
  };

  const handleViewProfile = (roleId, roleType) => {
    let academicoId = null;
    let semestre = null;
    
    if (roleType === 'estudiante') {
      const est = estudiantes.find(e => e.id === roleId);
      if (est) {
        academicoId = est.academico_id;
        semestre = est.semestre;
      }
    } else {
      const men = mentores.find(m => m.id === roleId);
      if (men) {
        academicoId = men.academico_id;
      }
    }

    if (!academicoId) return;

    const pa = perfilesAcademicos.find(p => p.id === academicoId);
    if (!pa) return;

    const perf = perfiles.find(p => p.id === pa.perfil_id);
    const car = carreras.find(c => c.id === pa.carrera_id);
    const fac = facultades.find(f => f.id === car?.facultad_id);

    let mentorData = null;
    if (roleType === 'mentor') {
      mentorData = mentores.find(m => m.id === roleId);
    }

    setSelectedProfile({
      role: roleType,
      perfil: perf,
      carrera: car,
      facultad: fac,
      semestre: semestre,
      mentor: mentorData
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (obscenityError || datetimeError) return;
    
    // Doble validación al enviar por si acaso
    if (formData.fecha_hora_deseada < getMinDateTime()) {
      setDatetimeError('La fecha y hora debe ser de al menos 2 horas en el futuro.');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        estudiante_id: user.estudiante_id,
        fecha_hora_deseada: new Date(formData.fecha_hora_deseada).toISOString()
      };
      await api.post('/processes/solicitudes-mentoria/', payload);
      setShowModal(false);
      setFormData({ materia_id: '', descripcion: '', fecha_hora_deseada: '', prioridad: 'media' });
      setDatetimeError('');
      toast.success('Solicitud creada con éxito');
      fetchData();
    } catch (error) {
      console.error('Error creating solicitud:', error);
      toast.error('Error al crear la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateState = async (id, nuevoEstado) => {
    try {
      await api.put(`/processes/solicitudes-mentoria/${id}`, { estado_solicitud: nuevoEstado });
      toast.success('Estado actualizado correctamente');
      fetchData();
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      toast.error('Error al actualizar el estado de la solicitud.');
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    // Formato: YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

      <div className="card-panel table-responsive">
        <table className="formal-table">
          <thead>
            <tr>
              {user?.roles?.includes('administrador') && <th>ID</th>}
              <th>Participantes</th>
              <th>Materia</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={user?.roles?.includes('administrador') ? "6" : "5"} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner-container">
                    <div className="spinner"></div>
                  </div>
                </td>
              </tr>
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan={user?.roles?.includes('administrador') ? "6" : "5"} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron solicitudes registradas.</td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                  <tr key={sol.id}>
                    {user?.roles?.includes('administrador') && (
                      <td style={{ fontWeight: '500' }}>{sol.id}</td>
                    )}
                    
                    <td>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estudiante:</span><br/>
                        <button 
                          onClick={() => handleViewProfile(sol.estudiante_id, 'estudiante')}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                          title="Ver Perfil del Estudiante"
                        >
                          {getEstudianteName(sol.estudiante_id)}
                        </button>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mentor:</span><br/>
                        {sol.mentor_id ? (
                          <button 
                            onClick={() => handleViewProfile(sol.mentor_id, 'mentor')}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            title="Ver Perfil del Mentor"
                          >
                            {getMentorName(sol.mentor_id)}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Por asignar</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{getMateriaName(sol.materia_id)}</div>
                    </td>

                    <td style={{ maxWidth: '250px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sol.descripcion}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Para: {formatDate(sol.fecha_hora_deseada)} (Prioridad: {sol.prioridad})
                      </div>
                    </td>

                    <td>
                      <span className="status-text" style={{ color: getStatusColor(sol.estado_solicitud) }}>
                        {sol.estado_solicitud}
                      </span>
                    </td>

                    <td>
                      {!user?.roles?.includes('estudiante') && sol.estado_solicitud === 'pendiente' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            title="Aceptar"
                            onClick={() => handleUpdateState(sol.id, 'aceptada')}
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

      {/* Modal de Detalles del Perfil */}
      {selectedProfile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '450px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedProfile(null)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <FaTimes />
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              {selectedProfile.perfil?.foto_perfil_url ? (
                <img 
                  src={selectedProfile.perfil.foto_perfil_url} 
                  alt="Foto de perfil" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', border: '3px solid var(--primary-color)' }}
                />
              ) : (
                <FaUserCircle style={{ fontSize: '4rem', color: 'var(--primary-color)', marginBottom: '12px' }} />
              )}
              <h2 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', textAlign: 'center' }}>
                {selectedProfile.perfil?.nombres} {selectedProfile.perfil?.apellidos}
              </h2>
              <span style={{ 
                backgroundColor: selectedProfile.role === 'estudiante' ? 'var(--primary-color)' : 'var(--accent-primary)', 
                color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' 
              }}>
                {selectedProfile.role}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block' }}>FACULTAD</span>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedProfile.facultad?.nombre || 'Información no disponible'}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block' }}>CARRERA</span>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {selectedProfile.carrera?.nombre || 'Información no disponible'}
                </div>
              </div>

              {selectedProfile.role === 'estudiante' && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block' }}>SEMESTRE ACTUAL</span>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedProfile.semestre}</div>
                </div>
              )}

              {selectedProfile.role === 'mentor' && (
                <>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block' }}>BIOGRAFÍA</span>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>
                      {selectedProfile.mentor?.biografia || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin biografía registrada.</span>}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block' }}>EXPERIENCIA</span>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>
                      {selectedProfile.mentor?.experiencia || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin experiencia registrada.</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button className="btn-primary" onClick={() => setSelectedProfile(null)} style={{ width: '100%', marginTop: '24px', padding: '12px' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Minimalista para Nueva Solicitud */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          {(() => {
            let materiasDisponibles = materias;
            if (user?.roles?.includes('estudiante') && user?.estudiante_id) {
              const est = estudiantes.find(e => e.id === user.estudiante_id);
              if (est) {
                const pa = perfilesAcademicos.find(p => p.id === est.academico_id);
                if (pa) {
                  const cm = carreraMaterias.filter(c => c.carrera_id === pa.carrera_id);
                  const validMateriaIds = cm.map(c => c.materia_id);
                  materiasDisponibles = materias.filter(m => validMateriaIds.includes(m.id));
                }
              }
            }
            return (
              <div className="card-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                <h2 style={{ marginBottom: '24px' }}>Crear Nueva Solicitud</h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Descripción del problema</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => {
                    const text = e.target.value;
                    setFormData({...formData, descripcion: text});
                    const hasBadWords = BAD_WORDS.some(word => text.toLowerCase().includes(word));
                    if (hasBadWords) {
                      setObscenityError('¡Ey! No puedes escribir eso. Borra o serás reportado al administrador.');
                    } else {
                      setObscenityError('');
                    }
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: obscenityError ? '1px solid var(--danger)' : '1px solid var(--border-color)', resize: 'none' }}
                  placeholder="Temas a revisar, dudas específicas..."
                />
                {obscenityError && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    {obscenityError}
                  </span>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Materia</label>
                <select 
                  required
                  value={formData.materia_id}
                  onChange={(e) => setFormData({...formData, materia_id: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value="" disabled>Seleccione una materia...</option>
                  {materiasDisponibles.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Fecha/Hora Deseada</label>
                  <input 
                    type="datetime-local" required
                    min={getMinDateTime()}
                    value={formData.fecha_hora_deseada}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      setFormData({...formData, fecha_hora_deseada: selectedVal});
                      if (selectedVal < getMinDateTime()) {
                        setDatetimeError('Debe ser al menos 2 horas en el futuro.');
                      } else {
                        setDatetimeError('');
                      }
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: datetimeError ? '1px solid var(--danger)' : '1px solid var(--border-color)' }}
                  />
                  {datetimeError && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      {datetimeError}
                    </span>
                  )}
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
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setObscenityError(''); setDatetimeError(''); }} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || obscenityError !== '' || datetimeError !== ''}>
                  {submitting ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Crear Solicitud'}
                </button>
              </div>
              </form>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Solicitudes;
