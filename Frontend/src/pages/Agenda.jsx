import React, { useState, useEffect, useContext } from 'react';
import { FaVideo, FaTrashAlt, FaSpinner, FaCheck, FaStar } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Agenda = () => {
  const { user } = useContext(AuthContext);
  const [sesiones, setSesiones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [perfilesAcademicos, setPerfilesAcademicos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [ratingData, setRatingData] = useState({
    puntualidad: 0,
    claridad: 0,
    dominio_tema: 0,
    comentario: ''
  });
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sesRes, solRes, estRes, paRes, perfRes, matRes, calRes] = await Promise.all([
        api.get('/processes/sesiones-mentoria/'),
        api.get('/processes/solicitudes-mentoria/'),
        api.get('/actors/estudiantes/'),
        api.get('/academic/perfiles-academicos/'),
        api.get('/users/perfiles/'),
        api.get('/academic/materias/'),
        api.get('/processes/calificaciones/')
      ]);
      
      let activas = sesRes.data.filter(s => s.estado_sesion !== 'cancelada');
      let solicitudesData = solRes.data;

      const isEstudiante = user?.roles?.includes('estudiante');
      const isMentor = user?.roles?.includes('mentor');

      if (isEstudiante && user?.estudiante_id) {
        solicitudesData = solicitudesData.filter(s => s.estudiante_id === user.estudiante_id);
        activas = activas.filter(s => solicitudesData.some(sol => sol.id === s.solicitud_id));
      } else if (isMentor && user?.mentor_id) {
        solicitudesData = solicitudesData.filter(s => s.mentor_id === user.mentor_id);
        activas = activas.filter(s => solicitudesData.some(sol => sol.id === s.solicitud_id));
      }

      setSesiones(activas.sort((a, b) => new Date(a.inicio) - new Date(b.inicio)));
      
      setSolicitudes(solicitudesData);
      setEstudiantes(estRes.data);
      setPerfilesAcademicos(paRes.data);
      setPerfiles(perfRes.data);
      setMaterias(matRes.data);
      setCalificaciones(calRes.data);
    } catch (error) {
      console.error('Error fetching agenda data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta sesión?')) return;
    try {
      await api.put(`/processes/sesiones-mentoria/${id}`, { estado_sesion: 'cancelada' });
      toast.success('Sesión cancelada');
      fetchData();
    } catch (error) {
      console.error('Error cancelando sesión:', error);
      toast.error('Error al cancelar la sesión.');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('¿Marcar esta sesión como completada?')) return;
    try {
      await api.put(`/processes/sesiones-mentoria/${id}`, { estado_sesion: 'completada' });
      toast.success('Sesión marcada como completada');
      fetchData();
    } catch (error) {
      console.error('Error completando sesión:', error);
      toast.error('Error al actualizar el estado de la sesión.');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (ratingData.puntualidad === 0 || ratingData.claridad === 0 || ratingData.dominio_tema === 0) {
      toast.error('Por favor, califica todos los rubros con estrellas.');
      return;
    }
    setSubmittingRating(true);
    try {
      await api.post('/processes/calificaciones/', {
        sesion_id: selectedSession.id,
        ...ratingData
      });
      toast.success('¡Gracias por tu calificación!');
      setShowRatingModal(false);
      setRatingData({ puntualidad: 0, claridad: 0, dominio_tema: 0, comentario: '' });
      fetchData();
    } catch (error) {
      console.error('Error enviando calificación:', error);
      toast.error('Error al guardar tu calificación.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (field, currentValue) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            onClick={() => setRatingData({ ...ratingData, [field]: star })}
            style={{ 
              cursor: 'pointer', 
              fontSize: '1.5rem', 
              color: star <= currentValue ? 'var(--warning)' : 'var(--text-muted)' 
            }}
          />
        ))}
      </div>
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getSolicitudDetails = (solicitud_id) => {
    const sol = solicitudes.find(s => s.id === solicitud_id);
    if (!sol) return { estudiante: 'Desconocido', materia: 'Desconocida' };
    
    const mat = materias.find(m => m.id === sol.materia_id);
    const materiaName = mat ? mat.nombre : 'Materia Desconocida';

    const est = estudiantes.find(e => e.id === sol.estudiante_id);
    if (!est) return { estudiante: 'Estudiante Desconocido', materia: materiaName };

    const pa = perfilesAcademicos.find(pa => pa.id === est.academico_id);
    if (!pa) return { estudiante: 'Perfil Académico Desconocido', materia: materiaName };

    const perf = perfiles.find(p => p.id === pa.perfil_id);
    const estudianteName = perf ? `${perf.nombres} ${perf.apellidos}` : 'Perfil Desconocido';

    return { estudiante: estudianteName, materia: materiaName };
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Agenda de Mentorías</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tus sesiones programadas y accesos a reuniones.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          </div>
        ) : sesiones.length === 0 ? (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tienes sesiones programadas en tu agenda.
          </div>
        ) : (
          sesiones.map((ses) => (
            <div key={ses.id} className="card-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-primary)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>{formatDate(ses.inicio)}</h3>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {formatTime(ses.inicio)} - {formatTime(ses.fin)}
                  </div>
                </div>
                <span style={{ 
                  color: 'var(--accent-primary)', backgroundColor: 'var(--bg-secondary)', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' 
                }}>
                  {ses.estado_sesion}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{getSolicitudDetails(ses.solicitud_id).estudiante}</div>
                <div>{getSolicitudDetails(ses.solicitud_id).materia}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                {ses.estado_sesion !== 'completada' && (
                  <>
                    {ses.enlace_teams ? (
                      <a href={ses.enlace_teams} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' }}>
                        <FaVideo /> Unirse
                      </a>
                    ) : (
                      <button className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }} disabled>
                        Sin Enlace
                      </button>
                    )}
                    
                    {user?.roles?.includes('mentor') && (
                      <button 
                        className="btn-primary" 
                        style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: 'white', padding: '10px' }}
                        title="Marcar como Completada"
                        onClick={() => handleComplete(ses.id)}
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      className="btn-secondary" 
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '10px' }}
                      title="Cancelar Sesión"
                      onClick={() => handleCancel(ses.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </>
                )}

                {ses.estado_sesion === 'completada' && user?.roles?.includes('estudiante') && (
                  calificaciones.some(c => c.sesion_id === ses.id) ? (
                    <span style={{ 
                      flex: 1, textAlign: 'center', backgroundColor: 'var(--bg-secondary)', 
                      color: 'var(--success)', padding: '8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' 
                    }}>
                      <FaStar style={{ color: 'var(--warning)', marginRight: '4px' }}/> Sesión Calificada
                    </span>
                  ) : (
                    <button 
                      className="btn-primary" 
                      style={{ flex: 1, backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: 'black' }}
                      onClick={() => { setSelectedSession(ses); setShowRatingModal(true); }}
                    >
                      <FaStar /> Calificar Mentoría
                    </button>
                  )
                )}

                {ses.estado_sesion === 'completada' && user?.roles?.includes('mentor') && (
                  <span style={{ 
                    flex: 1, textAlign: 'center', backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--text-secondary)', padding: '8px', borderRadius: '4px', fontSize: '0.9rem' 
                  }}>
                    Sesión Finalizada
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Calificación */}
      {showRatingModal && selectedSession && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px' }}>Calificar Mentoría</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Evalúa tu experiencia con {getSolicitudDetails(selectedSession.solicitud_id).estudiante} 
              (Materia: {getSolicitudDetails(selectedSession.solicitud_id).materia})
            </p>

            <form onSubmit={handleSubmitRating} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Puntualidad</label>
                {renderStars('puntualidad', ratingData.puntualidad)}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Claridad en la Explicación</label>
                {renderStars('claridad', ratingData.claridad)}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Dominio del Tema</label>
                {renderStars('dominio_tema', ratingData.dominio_tema)}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Comentarios adicionales (Opcional)</label>
                <textarea 
                  rows={3}
                  value={ratingData.comentario}
                  onChange={(e) => setRatingData({...ratingData, comentario: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none' }}
                  placeholder="¿Qué tal te pareció la sesión?"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowRatingModal(false)} disabled={submittingRating}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submittingRating}>
                  {submittingRating ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Enviar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
