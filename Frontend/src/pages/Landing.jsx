import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaRocket, FaChevronRight } from 'react-icons/fa';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar Minimalista */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/vite.svg" alt="UTMACH Logo" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>UTMACH SMA</span>
        </div>
        <div>
          <Link to="/login" style={{
            padding: '10px 24px',
            backgroundColor: '#ffffff',
            color: 'var(--primary-color)',
            textDecoration: 'none',
            borderRadius: '24px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0, 56, 147, 0.05) 0%, rgba(204, 30, 60, 0.05) 100%)'
      }}>
        <div style={{
          backgroundColor: 'rgba(204, 30, 60, 0.1)',
          color: 'var(--accent-primary)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '0.9rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaRocket /> Plataforma Oficial 2026
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: '800', 
          color: 'var(--primary-color)',
          maxWidth: '800px',
          lineHeight: '1.2',
          margin: '0 0 24px 0'
        }}>
          Sistema de Mentorías Académicas de la <span style={{ color: 'var(--accent-primary)' }}>UTMACH</span>
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 0 40px 0',
          lineHeight: '1.6'
        }}>
          Conecta con mentores especializados, organiza tus sesiones de estudio y alcanza la excelencia académica. Una plataforma diseñada para el éxito estudiantil.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{
            padding: '16px 32px',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 56, 147, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 56, 147, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 56, 147, 0.3)';
          }}
          >
            Acceder al Sistema <FaChevronRight style={{ fontSize: '0.9rem' }} />
          </Link>
        </div>

        {/* Features Preview */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '250px' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '1.8rem', marginBottom: '16px'
            }}>
              <FaUserGraduate />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Para Estudiantes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Solicita ayuda en las materias que más se te dificultan y agenda sesiones personalizadas.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '250px' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              backgroundColor: 'var(--bg-secondary)', color: 'var(--success)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '1.8rem', marginBottom: '16px'
            }}>
              <FaChalkboardTeacher />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Para Mentores</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Comparte tu conocimiento, gestiona tus solicitudes y organiza tu disponibilidad fácilmente.
            </p>
          </div>

        </div>
      </main>
      
      <footer style={{ 
        padding: '24px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        © 2026 Universidad Técnica de Machala - Sistema de Mentorías Académicas
      </footer>
    </div>
  );
};

export default Landing;
