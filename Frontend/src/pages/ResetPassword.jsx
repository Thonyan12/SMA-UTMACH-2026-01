import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('reset_email');
    if (savedEmail) {
      setCorreo(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo.trim() || !password.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { correo, codigo, nueva_password: password });
      toast.success('¡Contraseña actualizada con éxito!');
      localStorage.removeItem('reset_email');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
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
      <div className="card-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ width: '100%', maxWidth: '220px', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Nueva Contraseña</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ingresa el código que te enviamos al correo.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Código de Verificación (6 dígitos)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                <FaKey />
              </div>
              <input
                type="text"
                placeholder="Ej. 123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={6}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  letterSpacing: '2px'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Nueva Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Restablecer Contraseña'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FaArrowLeft /> Volver al Inicio de Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
