import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserGraduate, FaSignOutAlt, FaClipboardList, FaBars, FaTimes } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
    return items;
  };

  const menuItems = getMenuItems();

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
