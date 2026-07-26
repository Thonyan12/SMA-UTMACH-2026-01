import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaSignOutAlt, FaClipboardList, FaBars, FaTimes, FaBell, FaCheck, FaUserCircle } from 'react-icons/fa';
import api from '../api/axios';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isAdmin = user?.roles?.includes('administrador');
  const isEstudiante = user?.roles?.includes('estudiante');
  const isMentor = user?.roles?.includes('mentor');

  const getMenuItems = () => {
    const items = [
      { path: '/dashboard', label: 'Inicio', icon: <FaHome /> }
    ];

    if (isEstudiante) {
      items.push({ path: '/dashboard/solicitudes', label: 'Mis Solicitudes', icon: <FaClipboardList /> });
      items.push({ path: '/dashboard/agenda', label: 'Mi Agenda', icon: <FaCalendarAlt /> });
    } else if (isMentor) {
      items.push({ path: '/dashboard/solicitudes', label: 'Solicitudes Entrantes', icon: <FaClipboardList /> });
      items.push({ path: '/dashboard/agenda', label: 'Mi Agenda', icon: <FaCalendarAlt /> });
    } else {
      // Default / Admin
      items.push({ path: '/dashboard/solicitudes', label: 'Todas las Solicitudes', icon: <FaClipboardList /> });
      items.push({ path: '/dashboard/agenda', label: 'Agenda Global', icon: <FaCalendarAlt /> });
    }
    
    // Add profile to all
    items.push({ path: '/dashboard/perfil', label: 'Mi Perfil', icon: <FaUserCircle /> });

    return items;
  };

  const menuItems = getMenuItems();

  const fetchNotificaciones = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/processes/notificaciones/cuenta/${user.id}`);
      setNotificaciones(res.data);
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotificaciones();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificaciones]);

  // Click outside listener for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/processes/notificaciones/${id}`, { leido: 1 });
      fetchNotificaciones();
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const unreadCount = notificaciones.filter(n => n.leido === 0).length;

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Toaster position="top-right" />
      
      {/* Sidebar Sobrio e Institucional */}
      <aside className={`sidebar ${!isMobileMenuOpen ? 'hide-on-mobile' : ''}`} style={{ 
        width: '250px', 
        backgroundColor: 'var(--bg-primary)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {isMobileMenuOpen && (
            <button 
              className="hide-on-desktop"
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaTimes />
            </button>
          )}
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ width: '100%', maxWidth: '180px', marginBottom: '8px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Sistema de Mentorías
          </span>
        </div>

        <nav style={{ padding: '24px 16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}><FaSignOutAlt /></span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="header-content" style={{ 
          height: '70px', 
          backgroundColor: 'var(--bg-primary)', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          justifyContent: 'space-between'
        }}>
          <div>
            <button 
              className="hide-on-desktop"
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--accent-primary)', display: 'none' /* Will be overridden by media query if needed, but we can just conditionally render or use CSS */ }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Campanita de Notificaciones */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ 
                  background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', 
                  color: 'var(--text-secondary)', position: 'relative', display: 'flex', alignItems: 'center' 
                }}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--danger)', 
                    color: 'white', borderRadius: '50%', width: '18px', height: '18px', 
                    fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' 
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notificaciones */}
              {isNotifOpen && (
                <div style={{
                  position: 'absolute', top: '40px', right: '-10px', width: '320px', 
                  backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                  border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Notificaciones</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unreadCount} nuevas</span>
                  </div>
                  
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notificaciones.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No tienes notificaciones recientes.
                      </div>
                    ) : (
                      notificaciones.slice(0, 20).map(notif => (
                        <div key={notif.id} style={{ 
                          padding: '16px', borderBottom: '1px solid var(--border-color)', 
                          backgroundColor: notif.leido === 0 ? 'var(--bg-secondary)' : 'white',
                          display: 'flex', gap: '12px', alignItems: 'flex-start',
                          transition: 'background-color 0.2s'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{notif.titulo}</span>
                              {notif.leido === 0 && <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', marginTop: '4px' }}></div>}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{notif.mensaje.replace(/\s*#\d+\s*/g, ' ')}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                              {new Date(notif.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {notif.leido === 0 && (
                            <button 
                              onClick={() => handleMarkAsRead(notif.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                              title="Marcar como leída"
                            >
                              <FaCheck style={{ fontSize: '0.9rem' }} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', height: '40px' }}></div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {user?.nombres ? `${user.nombres} ${user.apellidos}` : 'Usuario UTMACH'}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Administrador' : isMentor ? 'Mentor' : isEstudiante ? 'Estudiante' : 'Cuenta Activa'}
              </p>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {user?.nombres ? user.nombres.charAt(0) : (user?.correo ? user.correo.charAt(0) : 'U')}
            </div>
          </div>
        </header>
        
        <div style={{ padding: '32px', flexGrow: 1, overflowY: 'auto' }}>
          {/* El contenido de la ruta actual se renderiza aquí */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
