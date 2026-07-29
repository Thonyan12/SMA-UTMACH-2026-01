import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaChevronRight, FaStar, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Particles from "@tsparticles/react";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const Landing = () => {
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}>

      {/* Header Institucional */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 5%',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/sma.png" alt="SMA Logo" style={{ height: '40px' }} />
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ height: '40px', borderLeft: '2px solid #eaeaea', paddingLeft: '15px' }} />
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/login" style={styles.loginBtn}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(8, 76, 132, 0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Iniciar Sesión
          </Link>
          <Link to="/register" style={styles.registerBtn}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(8, 76, 132, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Regístrate
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Banner Superior */}
        <section style={{ 
          position: 'relative', 
          padding: '100px 5%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)'
        }}>
          
          {/* Fondo de Partículas (Constelaciones) */}
          {init && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0
            }}>
              <Particles
                id="tsparticles"
                options={{
                  fullScreen: { enable: false },
              background: { color: "transparent" },
              particles: {
                color: { value: "#084c84" },
                links: {
                  color: "#084c84",
                  distance: 150,
                  enable: true,
                  opacity: 0.2,
                  width: 1
                },
                move: { enable: true, speed: 1 },
                number: { value: 60, density: { enable: true, area: 800 } },
                opacity: { value: 0.4 },
                size: { value: { min: 1, max: 3 } }
              },
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                  onClick: { enable: true, mode: "push" }
                },
                modes: {
                  grab: { distance: 180, links: { opacity: 0.5 } },
                  push: { quantity: 3 }
                }
              }
            }}
            />
            </div>
          )}

          {/* Formas Decorativas */}
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(8, 76, 132, 0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(204, 30, 60, 0.03) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '900px', zIndex: 1 }}
          >
            <motion.h1 variants={itemVariants} style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: '900',
              color: '#1a1f36',
              lineHeight: '1.1',
              letterSpacing: '-1px',
              margin: '0 0 24px 0'
            }}>
              Sistema de Mentorías <span style={{ color: 'var(--accent-primary)' }}>Académicas</span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
              color: '#4f566b',
              maxWidth: '700px',
              margin: '0 auto 40px auto',
              lineHeight: '1.6'
            }}>
              Conecta con mentores especializados de la UTMACH, organiza tus sesiones de estudio y alcanza la excelencia académica en un entorno diseñado para tu éxito.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/login" style={styles.primaryBtn}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(8, 76, 132, 0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(8, 76, 132, 0.2)' }}
              >
                Acceder al Sistema <FaChevronRight style={{ fontSize: '0.9rem' }} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 5%', backgroundColor: '#ffffff' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', maxWidth: '1100px', margin: '0 auto' }}
          >
            {/* Feature 1 */}
            <div style={styles.featureCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.iconBoxPrimary}><FaUserGraduate /></div>
              <h3 style={styles.featureTitle}>Para Estudiantes</h3>
              <p style={styles.featureDesc}>Solicita ayuda específica en materias críticas, agenda sesiones personalizadas y mejora tu rendimiento con apoyo continuo.</p>
            </div>

            {/* Feature 2 */}
            <div style={styles.featureCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.iconBoxSuccess}><FaChalkboardTeacher /></div>
              <h3 style={styles.featureTitle}>Para Mentores</h3>
              <p style={styles.featureDesc}>Desarrolla tus habilidades docentes, comparte tu conocimiento, organiza tu disponibilidad y gana insignias por tu excelente labor.</p>
            </div>

            {/* Feature 3 */}
            <div style={styles.featureCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.iconBoxWarning}><FaStar /></div>
              <h3 style={styles.featureTitle}>Gamificación</h3>
              <p style={styles.featureDesc}>Sistema interactivo con medallas, puntajes y rankings. Tu esfuerzo y dedicación académica son reconocidos oficialmente por el sistema.</p>
            </div>
          </motion.div>
        </section>

      </main>

      <footer style={{
        padding: '30px 5%',
        backgroundColor: '#f8faff',
        borderTop: '1px solid #eaeaea',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <img src="/sma.png" alt="SMA Logo" style={{ height: '35px', opacity: 0.8, filter: 'grayscale(100%)' }} />
        <p style={{ margin: 0, color: '#8898aa', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} Universidad Técnica de Machala. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

const styles = {
  loginBtn: {
    padding: '10px 20px',
    color: '#555',
    textDecoration: 'none',
    fontWeight: '600',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem'
  },
  registerBtn: {
    padding: '10px 24px',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem'
  },
  primaryBtn: {
    padding: '16px 36px',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1.15rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 15px rgba(8, 76, 132, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
  },
  featureCard: {
    padding: '40px 30px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #f1f3f5',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: '12px'
  },
  featureDesc: {
    color: '#4f566b',
    lineHeight: '1.6',
    fontSize: '1rem',
    margin: 0
  },
  iconBoxPrimary: {
    width: '70px', height: '70px', borderRadius: '20px',
    backgroundColor: 'rgba(8, 76, 132, 0.08)', color: 'var(--accent-primary)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontSize: '1.8rem', marginBottom: '24px'
  },
  iconBoxSuccess: {
    width: '70px', height: '70px', borderRadius: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontSize: '1.8rem', marginBottom: '24px'
  },
  iconBoxWarning: {
    width: '70px', height: '70px', borderRadius: '20px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontSize: '1.8rem', marginBottom: '24px'
  }
};

export default Landing;
