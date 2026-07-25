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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/MARCA_UTMACH_BLANCO-Hor-300x99%20(1).png" alt="UTMACH Logo" style={{ height: '45px' }} />
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
        padding: '20px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0, 56, 147, 0.05) 0%, rgba(204, 30, 60, 0.05) 100%)'
      }}>
        
        <img 
          src="/logo-horizontal-300x99.png" 
          alt="UTMACH Logo Oficial" 
          style={{ display: 'block', margin: '0 auto 24px auto', width: '100%', maxWidth: '280px' }} 
        />

        <h1 style={{ 
          fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
          fontWeight: '800', 
          color: 'var(--primary-color)',
          maxWidth: '800px',
          lineHeight: '1.2',
          margin: '0 0 16px 0'
        }}>
          Sistema de Mentorías Académicas
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', 
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 0 30px 0',
          lineHeight: '1.5'
        }}>
          Conecta con mentores especializados, organiza tus sesiones de estudio y alcanza la excelencia académica. Una plataforma diseñada para el éxito estudiantil.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{
            padding: '18px 40px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(204, 30, 60, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s, filter 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(204, 30, 60, 0.5)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(204, 30, 60, 0.4)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
          >
            Acceder al Sistema <FaChevronRight style={{ fontSize: '1rem' }} />
          </Link>
        </div>

        {/* Features Preview */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '50px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
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
