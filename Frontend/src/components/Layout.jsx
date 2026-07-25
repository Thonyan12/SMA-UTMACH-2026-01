import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserGraduate, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/', label: 'Inicio', icon: <FaHome /> },
    { path: '/solicitudes', label: 'Solicitudes', icon: <FaUserGraduate /> },
    { path: '/agenda', label: 'Agenda', icon: <FaCalendarAlt /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Sobrio e Institucional */}
      <aside style={{ 
        width: '250px', 
        backgroundColor: 'var(--bg-primary)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', margin: 0 }}>
            UTMACH SMA
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mentorías Académicas
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
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '70px', 
          backgroundColor: 'var(--bg-primary)', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          justifyContent: 'flex-end'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {user ? user.correo : 'Usuario UTMACH'}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cuenta Activa</p>
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
              {user && user.correo ? user.correo.charAt(0) : 'U'}
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
