import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaUserTie, FaBook, FaAward } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DirectorioMentores = () => {
  const [mentores, setMentores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentores();
  }, []);

  const fetchMentores = async () => {
    try {
      const response = await api.get('/processes/directorio/mentores');
      setMentores(response.data);
    } catch (error) {
      console.error('Error fetching directorio:', error);
      toast.error('Error al cargar el directorio de mentores');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nombres, apellidos) => {
    const n = nombres ? nombres.charAt(0).toUpperCase() : '';
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return `${n}${a}`;
  };

  const filteredMentores = mentores.filter((mentor) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = `${mentor.nombres} ${mentor.apellidos}`.toLowerCase().includes(searchLower);
    const matchesMateria = mentor.especialidades.some(e => e.materia_nombre.toLowerCase().includes(searchLower));
    return matchesName || matchesMateria;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Directorio de Mentores</h1>
        <p className="page-subtitle">Explora a nuestros mentores expertos y sus especialidades.</p>
      </div>

      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div style={styles.grid}>
          {filteredMentores.map((mentor) => (
            <div key={mentor.id} className="card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {getInitials(mentor.nombres, mentor.apellidos)}
                </div>
                <div style={styles.headerInfo}>
                  <h3 style={styles.name}>{mentor.nombres} {mentor.apellidos}</h3>
                  <div style={styles.rating}>
                    <FaStar style={{ color: 'var(--warning)', marginRight: '4px' }} />
                    <span style={{ fontWeight: '600' }}>{mentor.promedio_calificacion.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '4px' }}>
                      ({mentor.total_sesiones} sesiones)
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.bioSection}>
                <p style={styles.bioText}>
                  {mentor.biografia || "Este mentor aún no ha añadido una biografía."}
                </p>
              </div>

              <div style={styles.specialtiesSection}>
                <h4 style={styles.sectionTitle}><FaBook style={{marginRight: '6px'}}/> Materias de Especialidad</h4>
                <div style={styles.tagsContainer}>
                  {mentor.especialidades.map((esp, idx) => (
                    <span key={idx} style={styles.tag}>
                      {esp.materia_nombre}
                      <span style={styles.tagLevel}>Nivel {esp.nivel_dominio}</span>
                    </span>
                  ))}
                  {mentor.especialidades.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tiene especialidades registradas.</span>
                  )}
                </div>
              </div>

              {mentor.experiencia && (
                <div style={styles.experienceSection}>
                  <h4 style={styles.sectionTitle}><FaAward style={{marginRight: '6px'}}/> Experiencia</h4>
                  <p style={styles.experienceText}>{mentor.experiencia}</p>
                </div>
              )}
            </div>
          ))}
          
          {filteredMentores.length === 0 && (
            <div style={styles.emptyState}>
              No se encontraron mentores que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  searchContainer: {
    marginBottom: '32px',
    maxWidth: '600px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    fontSize: '1rem',
    backgroundColor: '#ffffff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    height: '100%',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    backgroundColor: '#ffffff'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  headerInfo: {
    flex: 1
  },
  name: {
    margin: '0 0 4px 0',
    fontSize: '1.2rem',
    color: 'var(--text-primary)'
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.95rem'
  },
  bioSection: {
    marginBottom: '20px',
    flex: 1
  },
  bioText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    fontStyle: 'italic'
  },
  specialtiesSection: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 12px 0',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0',
    backgroundColor: 'transparent',
    color: 'var(--accent-primary)',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  tagLevel: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 'normal'
  },
  experienceSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px'
  },
  experienceText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    color: 'var(--text-muted)'
  }
};

export default DirectorioMentores;
