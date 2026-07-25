import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaEnvelope, FaCalendarAlt, FaIdBadge } from 'react-icons/fa';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  // Generar iniciales para el avatar
  const getInitials = (nombres, apellidos) => {
    const n = nombres ? nombres.charAt(0).toUpperCase() : '';
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return `${n}${a}` || user.correo.charAt(0).toUpperCase();
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'estudiante': return <FaUserGraduate />;
      case 'mentor': return <FaChalkboardTeacher />;
      case 'administrador': return <FaUserShield />;
      default: return <FaIdBadge />;
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'estudiante': return 'var(--primary)';
      case 'mentor': return 'var(--success)';
      case 'administrador': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mi Perfil</h1>
        <p className="page-subtitle">Información detallada de tu cuenta y roles en el sistema.</p>
      </div>

      <div style={styles.profileContainer}>
        {/* Tarjeta Principal - Avatar y Datos Básicos */}
        <div className="card" style={styles.mainCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {getInitials(user.nombres, user.apellidos)}
            </div>
            <h2 style={styles.userName}>{user.nombres} {user.apellidos}</h2>
            <p style={styles.userEmail}>
              <FaEnvelope style={{ marginRight: '8px' }} />
              {user.correo}
            </p>
          </div>

          <div style={styles.rolesSection}>
            <h3 style={styles.sectionTitle}>Roles Asignados</h3>
            <div style={styles.rolesList}>
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, idx) => (
                  <span key={idx} style={{ ...styles.roleBadge, backgroundColor: `${getRoleColor(role)}15`, color: getRoleColor(role), border: `1px solid ${getRoleColor(role)}30` }}>
                    {getRoleIcon(role)}
                    <span style={{ marginLeft: '6px' }}>{role.toUpperCase()}</span>
                  </span>
                ))
              ) : (
                <span style={styles.noRoles}>Sin roles asignados</span>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta Secundaria - Detalles de Cuenta */}
        <div className="card" style={styles.detailsCard}>
          <h3 style={styles.sectionTitle}>Información Adicional</h3>
          
          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <FaUserGraduate />
            </div>
            <div style={styles.detailInfo}>
              <span style={styles.detailLabel}>Carrera</span>
              <span style={styles.detailValue}>{user.carrera_nombre || 'No asignada'}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <FaUserGraduate />
            </div>
            <div style={styles.detailInfo}>
              <span style={styles.detailLabel}>Semestre Actual</span>
              <span style={styles.detailValue}>{user.semestre ? `${user.semestre}° Semestre` : 'No asignado'}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <FaCalendarAlt />
            </div>
            <div style={styles.detailInfo}>
              <span style={styles.detailLabel}>Con nosotros desde</span>
              <span style={styles.detailValue}>{formatDate(user.fecha_creacion)}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <FaCalendarAlt />
            </div>
            <div style={styles.detailInfo}>
              <span style={styles.detailLabel}>Última vez que entraste</span>
              <span style={styles.detailValue}>{formatDate(user.ultimo_acceso)}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <div style={{ ...styles.statusDot, backgroundColor: user.estado === 1 ? 'var(--success)' : 'var(--danger)' }}></div>
            </div>
            <div style={styles.detailInfo}>
              <span style={styles.detailLabel}>Estado de tu cuenta</span>
              <span style={{ ...styles.detailValue, color: user.estado === 1 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                {user.estado === 1 ? '¡Activa y lista para usar!' : 'Inactiva (Contacta a soporte)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  profileContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '24px',
    alignItems: 'start'
  },
  mainCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px',
    textAlign: 'center'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px'
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    boxShadow: '0 8px 16px rgba(0, 102, 204, 0.2)',
    border: '4px solid white'
  },
  userName: {
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    fontWeight: '700'
  },
  userEmail: {
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem'
  },
  rolesSection: {
    width: '100%',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    fontWeight: '600',
    textAlign: 'left'
  },
  rolesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center'
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  noRoles: {
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    fontSize: '0.9rem'
  },
  detailsCard: {
    padding: '24px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  detailIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    marginRight: '16px',
    flexShrink: 0
  },
  detailInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    wordBreak: 'break-all'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  }
};

export default Profile;
