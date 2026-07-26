import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaClock, FaCalendarDay } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DisponibilidadMentor = () => {
  const { user } = useContext(AuthContext);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    dia_semana: 'Lunes',
    hora_inicio: '14:00',
    hora_fin: '16:00'
  });
  const [submitting, setSubmitting] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const diasMap = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Domingo': 7
  };

  useEffect(() => {
    if (user?.mentor_id) {
      fetchDisponibilidad();
    }
  }, [user]);

  const fetchDisponibilidad = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/actors/disponibilidad-mentor/mentor/${user.mentor_id}`);
      setDisponibilidades(response.data);
    } catch (error) {
      console.error('Error fetching disponibilidad:', error);
      toast.error('Error al cargar tus horarios');
    } finally {
      setLoading(false);
    }
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  const minutesToTime = (minutesTotal) => {
    const hours = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    const minInicio = timeToMinutes(form.hora_inicio);
    const minFin = timeToMinutes(form.hora_fin);

    if (minInicio >= minFin) {
      toast.error("La hora de inicio debe ser menor a la hora de fin.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/actors/disponibilidad-mentor/', {
        mentor_id: user.mentor_id,
        dia_id: diasMap[form.dia_semana],
        hora_inicio_min: minInicio,
        hora_fin_min: minFin
      });
      toast.success("Horario añadido correctamente");
      fetchDisponibilidad();
    } catch (error) {
      console.error('Error adding disponibilidad:', error);
      toast.error('Ocurrió un error al guardar el horario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este horario?")) return;
    try {
      await api.delete(`/actors/disponibilidad-mentor/${id}`);
      toast.success("Horario eliminado");
      fetchDisponibilidad();
    } catch (error) {
      console.error("Error deleting disponibilidad:", error);
      toast.error("Error al eliminar horario");
    }
  };

  if (!user?.roles?.includes('mentor')) {
    return <div className="page-container"><p>Acceso denegado. Solo para mentores.</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mi Disponibilidad</h1>
        <p className="page-subtitle">Configura los días y horas en los que estás disponible para dar mentorías.</p>
      </div>

      <div style={styles.content}>
        {/* Formulario */}
        <div className="card-panel" style={styles.formContainer}>
          <h2 style={styles.sectionTitle}>Añadir Nuevo Horario</h2>
          <form onSubmit={handleAdd} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}><FaCalendarDay style={{marginRight: '6px'}}/>Día de la semana</label>
              <select 
                value={form.dia_semana}
                onChange={(e) => setForm({...form, dia_semana: e.target.value})}
                style={styles.input}
              >
                {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}><FaClock style={{marginRight: '6px'}}/>Hora Inicio</label>
                <input 
                  type="time" 
                  required
                  value={form.hora_inicio}
                  onChange={(e) => setForm({...form, hora_inicio: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}><FaClock style={{marginRight: '6px'}}/>Hora Fin</label>
                <input 
                  type="time" 
                  required
                  value={form.hora_fin}
                  onChange={(e) => setForm({...form, hora_fin: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={styles.submitBtn}>
              <FaPlus /> {submitting ? 'Guardando...' : 'Añadir Horario'}
            </button>
          </form>
        </div>

        {/* Lista de Horarios */}
        <div className="card-panel" style={styles.listContainer}>
          <h2 style={styles.sectionTitle}>Horarios Configurados</h2>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : disponibilidades.length === 0 ? (
            <div style={styles.emptyState}>
              No tienes ningún horario configurado. Añade uno para que el sistema te pueda asignar mentorías.
            </div>
          ) : (
            <div style={styles.grid}>
              {diasSemana.map(dia => {
                const diaId = diasMap[dia];
                const horariosDia = disponibilidades.filter(d => d.dia_id === diaId);
                if (horariosDia.length === 0) return null;
                
                return (
                  <div key={dia} style={styles.dayCard}>
                    <h3 style={styles.dayTitle}>{dia}</h3>
                    <div style={styles.timeSlots}>
                      {horariosDia.map(horario => (
                        <div key={horario.id} style={styles.timeSlot}>
                          <span>{minutesToTime(horario.hora_inicio_min)} - {minutesToTime(horario.hora_fin_min)}</span>
                          <button 
                            onClick={() => handleDelete(horario.id)}
                            style={styles.deleteBtn}
                            title="Eliminar Horario"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  content: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  formContainer: {
    flex: '1 1 300px',
    padding: '24px',
  },
  listContainer: {
    flex: '2 1 500px',
    padding: '24px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.25rem',
    color: 'var(--text-primary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.95rem'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '1rem',
    fontFamily: 'inherit'
  },
  submitBtn: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  dayCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  dayTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.1rem',
    color: 'var(--accent-primary)',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '8px'
  },
  timeSlots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  timeSlot: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default DisponibilidadMentor;
