import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaPaperPlane, FaLink, FaExclamationTriangle, FaTimes, FaExternalLinkAlt, FaUsers, FaVideo } from 'react-icons/fa';

const SalaSesion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [sesion, setSesion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [recursoNombre, setRecursoNombre] = useState('');
  const [recursoUrl, setRecursoUrl] = useState('');
  
  // Reporte
  const [showReport, setShowReport] = useState(false);
  const [reporteDesc, setReporteDesc] = useState('');

  const ws = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    connectWebSocket();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const fetchData = async () => {
    try {
      // Usaremos un endpoint para obtener los mensajes anteriores
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resMsgs, resRecursos, resSesion] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/processes/sesiones/${id}/mensajes`, { headers }),
        fetch(`http://127.0.0.1:8000/api/processes/sesiones/${id}/recursos`, { headers }),
        fetch(`http://127.0.0.1:8000/api/processes/sesiones-mentoria/${id}`, { headers })
      ]);
      
      if (resMsgs.ok) setMensajes(await resMsgs.json());
      if (resRecursos.ok) setRecursos(await resRecursos.json());
      if (resSesion.ok) setSesion(await resSesion.json());
    } catch (error) {
      console.error(error);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/${user.id}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMensajes((prev) => [...prev, data]);
    };
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (nuevoMensaje.trim() && ws.current) {
      ws.current.send(nuevoMensaje);
      setNuevoMensaje('');
    }
  };

  const subirRecurso = async (e) => {
    e.preventDefault();
    if (!recursoNombre || !recursoUrl) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/processes/sesiones/${id}/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sesion_id: parseInt(id),
          subido_por: user.id,
          nombre_archivo: recursoNombre,
          url_archivo: recursoUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRecursos([data, ...recursos]);
        setRecursoNombre('');
        setRecursoUrl('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const enviarReporte = async () => {
    if (!reporteDesc.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/processes/sesiones/${id}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sesion_id: parseInt(id),
          reportador_id: user.id,
          descripcion: reporteDesc
        })
      });
      if (res.ok) {
        alert("Reporte enviado con éxito. Un administrador lo revisará.");
        setShowReport(false);
        setReporteDesc('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Sala de Mentoría</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {sesion && sesion.enlace_teams && (
            <a 
              href={sesion.enlace_teams} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', backgroundColor: '#5a5eb9' }}
              title={`Unirse a la reunión programada para ${new Date(sesion.inicio).toLocaleString()}`}
            >
              <FaVideo /> Unirse a la Videollamada
            </a>
          )}
          <button 
            onClick={() => setShowReport(true)}
            className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaExclamationTriangle /> Reportar Problema
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* CHAT PANEL */}
        <div className="card" style={{ flex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          
          {/* Header Chat */}
          <div style={{ backgroundColor: '#f0f2f5', padding: '15px 20px', borderBottom: '1px solid #d1d7db', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dfe5e7', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#54656f' }}>
              <FaUsers size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#111b21', fontSize: '1.1rem' }}>Chat de la Sesión</h4>
              <span style={{ fontSize: '0.8rem', color: '#667781' }}>Comunicación en tiempo real</span>
            </div>
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', backgroundColor: '#efeae2', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px', backgroundBlendMode: 'overlay', opacity: 0.95 }}>
            {mensajes.length === 0 ? (
              <div style={{ alignSelf: 'center', backgroundColor: '#ffeecd', color: '#54656f', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', marginTop: '20px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
                🔒 Los mensajes están cifrados de extremo a extremo (simulado). ¡Sé el primero en saludar!
              </div>
            ) : (
              mensajes.map((msg, idx) => {
                const isMe = msg.remitente_id === user.id;
                // Parse time to HH:MM format
                const msgTime = new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column' }}>
                    {!isMe && (
                      <span style={{ fontSize: '0.75rem', color: '#1fa855', fontWeight: 'bold', marginLeft: '5px', marginBottom: '2px' }}>
                        {msg.remitente_nombre}
                      </span>
                    )}
                    <div style={{ 
                      backgroundColor: isMe ? '#d9fdd3' : '#ffffff', 
                      color: '#111b21',
                      padding: '8px 12px 6px 12px', 
                      borderRadius: isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                      boxShadow: '0 1px 1px rgba(11,20,26,0.13)',
                      wordBreak: 'break-word',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.mensaje}</span>
                      <span style={{ fontSize: '0.65rem', color: '#667781', alignSelf: 'flex-end', marginTop: '4px', marginLeft: '20px' }}>
                        {msgTime} {isMe && <span style={{color: '#53bdeb'}}>✓✓</span>}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input WhatsApp Style */}
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', padding: '10px 20px', backgroundColor: '#f0f2f5', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Escribe un mensaje" 
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              style={{ flexGrow: 1, padding: '12px 20px', borderRadius: '24px', border: 'none', outline: 'none', backgroundColor: '#ffffff', color: '#111b21', fontSize: '0.95rem', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}
            />
            <button type="submit" disabled={!nuevoMensaje.trim()} style={{ padding: '12px', borderRadius: '50%', backgroundColor: nuevoMensaje.trim() ? '#00a884' : '#e9edef', color: 'white', border: 'none', cursor: nuevoMensaje.trim() ? 'pointer' : 'default', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', width: '45px', height: '45px' }}>
              <FaPaperPlane size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>

        {/* RECURSOS PANEL */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Recursos Compartidos</h4>
          
          <form onSubmit={subirRecurso} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nombre del recurso (ej. Taller PDF)"
              value={recursoNombre}
              onChange={(e) => setRecursoNombre(e.target.value)}
              required
            />
            <input 
              type="url" 
              className="form-control" 
              placeholder="Enlace URL (ej. Google Drive)"
              value={recursoUrl}
              onChange={(e) => setRecursoUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
              <FaLink /> Compartir Enlace
            </button>
          </form>

          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {recursos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay recursos compartidos.</p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recursos.map((r, idx) => (
                  <li key={idx} style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{r.nombre_archivo}</strong>
                      <a href={r.url_archivo} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }} title="Abrir enlace">
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                    <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Por: {r.subido_por_nombre}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Reporte */}
      {showReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '450px', padding: '35px', position: 'relative', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setShowReport(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-secondary)', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-muted)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffe5e5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              <FaTimes />
            </button>
            <h3 style={{ marginTop: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <FaExclamationTriangle /> Reportar Incidencia
            </h3>
            <p style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Por favor detalla el problema ocurrido durante esta sesión. Un administrador revisará este reporte y tomará las acciones necesarias.
            </p>
            <textarea 
              placeholder="Describe lo sucedido aquí... (ej. El mentor no asistió, mal comportamiento, etc.)"
              value={reporteDesc}
              onChange={(e) => setReporteDesc(e.target.value)}
              style={{ width: '100%', marginBottom: '25px', resize: 'vertical', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', color: '#1e293b' }}
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowReport(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                Cancelar
              </button>
              <button onClick={enviarReporte} disabled={!reporteDesc.trim()} style={{ padding: '10px 20px', backgroundColor: reporteDesc.trim() ? 'var(--danger)' : '#f1f5f9', color: reporteDesc.trim() ? 'white' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: reporteDesc.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPaperPlane /> Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaSesion;
