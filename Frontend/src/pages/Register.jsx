import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaEnvelope, FaLock, FaKey, FaUser, FaIdCard, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [carreras, setCarreras] = useState([]);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    correo: '',
    password: '',
    confirmPassword: '',
    carrera_id: '',
    semestre: ''
  });

  const [codigo, setCodigo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const res = await api.get('/auth/carreras');
        setCarreras(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, carrera_id: res.data[0].id }));
        }
      } catch (err) {
        console.error("Error cargando carreras", err);
      }
    };
    fetchCarreras();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cedula: formData.cedula,
        correo: formData.correo,
        password: formData.password,
        carrera_id: parseInt(formData.carrera_id),
        semestre: parseInt(formData.semestre)
      };
      
      const res = await api.post('/auth/register', payload);
      if (res.data.requires_verification) {
        setStep(2);
        toast.success(res.data.message || 'Código enviado al correo');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar el registro');
      toast.error(err.response?.data?.detail || 'Error al procesar el registro');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/verify-register', {
        correo: formData.correo,
        codigo: codigo
      });
      toast.success('Cuenta creada y verificada exitosamente');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Código incorrecto o expirado';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 12px 12px 36px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    backgroundColor: '#fff'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-secondary)',
      padding: '24px'
    }}>
      <div className="card-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
        
        {step === 1 && (
          <div style={{ marginBottom: '24px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaArrowLeft /> Volver al inicio
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ width: '100%', maxWidth: '220px', marginBottom: '16px' }} />
          <h2 style={{ color: 'var(--primary-color)', margin: '0 0 8px 0' }}>
            {step === 1 ? 'Crear una cuenta' : 'Verifica tu correo'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Regístrate para obtener ayuda académica' : 'Ingresa el código que enviamos a tu correo institucional'}
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: 'var(--danger)', 
            padding: '12px 16px', 
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            border: '1px solid #f87171'
          }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nombres</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaUser /></div>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required style={inputStyle} placeholder="Tus nombres" />
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Apellidos</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaUser /></div>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required style={inputStyle} placeholder="Tus apellidos" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Cédula</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaIdCard /></div>
                  <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} required style={inputStyle} placeholder="Tu número de cédula" />
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Correo Institucional</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaEnvelope /></div>
                  <input type="email" name="correo" value={formData.correo} onChange={handleChange} required style={inputStyle} placeholder="ejemplo@utmachala.edu.ec" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Carrera</label>
                <select name="carrera_id" value={formData.carrera_id} onChange={handleChange} required style={{...inputStyle, paddingLeft: '12px'}}>
                  {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Semestre</label>
                <select name="semestre" value={formData.semestre} onChange={handleChange} required style={{...inputStyle, paddingLeft: '12px'}}>
                  <option value="">Selecciona...</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaLock /></div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required style={{...inputStyle, paddingRight: '40px'}} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Confirmar Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconStyle}><FaLock /></div>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{...inputStyle, paddingRight: '40px'}} placeholder="Repite la contraseña" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '16px', width: '100%', padding: '14px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center' }}>
              {isLoading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Registrarse'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)' }}>
              ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Código de verificación (6 dígitos)
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FaKey />
                </div>
                <input 
                  type="text" 
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ej. 123456"
                  maxLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 36px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none',
                    letterSpacing: '2px',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '8px', width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              {isLoading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Verificar y Crear Cuenta'}
            </button>
            <button type="button" onClick={() => { setStep(1); setCodigo(''); setError(''); }} className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              Volver atrás
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
