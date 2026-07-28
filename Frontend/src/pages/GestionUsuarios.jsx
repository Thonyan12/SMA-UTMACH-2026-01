import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaEdit, FaTrashAlt, FaCheck, FaTimes, FaArrowUp } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GestionUsuarios = () => {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filtroRol, setFiltroRol] = useState('todos');
  
  const [formData, setFormData] = useState({
    id: null,
    correo: '',
    password: '',
    codigo_institucional: '',
    nombres: '',
    apellidos: '',
    roles: [],
    carrera_id: '',
    semestre: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usrRes, carRes] = await Promise.all([
        api.get('/users/admin/usuarios'),
        api.get('/academic/carreras/')
      ]);
      setUsuarios(usrRes.data);
      setCarreras(carRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      correo: '',
      password: '',
      codigo_institucional: '',
      nombres: '',
      apellidos: '',
      roles: [],
      carrera_id: '',
      semestre: ''
    });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setIsEditing(true);
    setFormData({
      id: u.id,
      correo: u.correo,
      password: '', // Password is not editable easily here, or left blank
      codigo_institucional: u.codigo_institucional || '',
      nombres: u.nombres || '',
      apellidos: u.apellidos || '',
      roles: u.roles || [],
      carrera_id: u.carrera_id || '',
      semestre: u.semestre || ''
    });
    setShowModal(true);
  };

  const handleRoleChange = (roleName) => {
    if (formData.roles.includes(roleName)) {
      setFormData({ ...formData, roles: formData.roles.filter(r => r !== roleName) });
    } else {
      setFormData({ ...formData, roles: [...formData.roles, roleName] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      toast.error('Debe seleccionar al menos un rol');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.carrera_id === '') payload.carrera_id = null;
      else payload.carrera_id = parseInt(payload.carrera_id);
      
      if (payload.semestre === '') payload.semestre = null;
      else payload.semestre = parseInt(payload.semestre);

      if (isEditing) {
        await api.put(`/users/admin/usuarios/${formData.id}`, {
          nombres: payload.nombres,
          apellidos: payload.apellidos,
          roles: payload.roles,
          carrera_id: payload.carrera_id,
          semestre: payload.semestre
        });
        toast.success('Usuario actualizado con éxito');
      } else {
        if (!payload.password) {
          toast.error('La contraseña es obligatoria para nuevos usuarios');
          setSubmitting(false);
          return;
        }
        await api.post('/users/admin/usuarios', payload);
        toast.success('Usuario creado con éxito');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (u) => {
    const newStatus = u.estado === 1 ? 0 : 1;
    const msg = newStatus === 1 ? '¿Reactivar usuario?' : '¿Desactivar usuario? (No podrá iniciar sesión)';
    if (!window.confirm(msg)) return;
    
    try {
      await api.put(`/users/admin/usuarios/${u.id}`, { estado: newStatus });
      toast.success(`Usuario ${newStatus === 1 ? 'reactivado' : 'desactivado'}`);
      fetchData();
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const handleUpgrade = async (u) => {
    let newRoles = [...u.roles];
    let upgradedTo = '';
    
    if (!newRoles.includes('mentor')) {
      newRoles.push('mentor');
      upgradedTo = 'Mentor';
    } else if (!newRoles.includes('administrador')) {
      newRoles.push('administrador');
      upgradedTo = 'Administrador';
    } else {
      toast.info('El usuario ya tiene el nivel máximo (Administrador)');
      return;
    }

    if (!window.confirm(`¿Estás seguro de promover a este usuario a ${upgradedTo}?`)) return;

    try {
      await api.put(`/users/admin/usuarios/${u.id}`, {
        roles: newRoles
      });
      toast.success(`Usuario promovido a ${upgradedTo}`);
      fetchData();
    } catch (error) {
      toast.error('Error al promover usuario');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando usuarios...</div>;

  const requiresAcademicData = formData.roles.includes('estudiante') || formData.roles.includes('mentor');
  const requiresSemester = formData.roles.includes('estudiante');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Administra cuentas, roles y perfiles.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={filtroRol} 
            onChange={e => setFiltroRol(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="todos">Todos los Roles</option>
            <option value="estudiante">Estudiante</option>
            <option value="mentor">Mentor</option>
            <option value="administrador">Administrador</option>
          </select>
          <button className="btn-primary" onClick={openCreateModal}>
            <FaPlus /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="card-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px' }}>Nombre</th>
              <th style={{ padding: '16px' }}>Correo</th>
              <th style={{ padding: '16px' }}>Roles</th>
              <th style={{ padding: '16px' }}>Estado</th>
              <th style={{ padding: '16px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.filter(u => filtroRol === 'todos' || u.roles.includes(filtroRol)).map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.nombres} {u.apellidos}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.codigo_institucional}</div>
                </td>
                <td style={{ padding: '16px' }}>{u.correo}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {u.roles.map(r => (
                      <span key={r} style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  {u.estado === 1 
                    ? <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Activo</span>
                    : <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Inactivo</span>
                  }
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!u.roles.includes('administrador') && (
                      <button className="btn-secondary" onClick={() => handleUpgrade(u)} style={{ padding: '6px', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }} title="Promover Usuario (Subir Nivel)">
                        <FaArrowUp />
                      </button>
                    )}
                    <button className="btn-secondary" onClick={() => openEditModal(u)} style={{ padding: '6px' }} title="Editar">
                      <FaEdit />
                    </button>
                    {u.estado === 1 ? (
                      <button className="btn-secondary" onClick={() => toggleStatus(u)} style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Desactivar">
                        <FaTrashAlt />
                      </button>
                    ) : (
                      <button className="btn-secondary" onClick={() => toggleStatus(u)} style={{ padding: '6px', color: 'var(--success)', borderColor: 'var(--success)' }} title="Reactivar">
                        <FaCheck />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nombres</label>
                  <input type="text" required value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Apellidos</label>
                  <input type="text" required value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
              </div>

              {!isEditing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Correo Electrónico</label>
                    <input type="email" required value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contraseña</label>
                    <input type="password" required={!isEditing} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  </div>
                </div>
              )}
              
              {!isEditing && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Código Institucional (Cédula o ID)</label>
                  <input type="text" required value={formData.codigo_institucional} onChange={(e) => setFormData({...formData, codigo_institucional: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Roles del Usuario</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={formData.roles.includes('estudiante')} onChange={() => handleRoleChange('estudiante')} />
                    Estudiante
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={formData.roles.includes('mentor')} onChange={() => handleRoleChange('mentor')} />
                    Mentor
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={formData.roles.includes('administrador')} onChange={() => handleRoleChange('administrador')} />
                    Administrador
                  </label>
                </div>
              </div>

              {requiresAcademicData && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Carrera</label>
                  <select required value={formData.carrera_id} onChange={(e) => setFormData({...formData, carrera_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <option value="">Seleccione una carrera...</option>
                    {carreras.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {requiresSemester && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Semestre (Nivel)</label>
                  <input type="number" min="1" max="10" required value={formData.semestre} onChange={(e) => setFormData({...formData, semestre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
