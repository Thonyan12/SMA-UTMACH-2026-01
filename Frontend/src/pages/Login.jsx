import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(correo, password);
      navigate('/dashboard'); // Redirigir al Dashboard en caso de éxito
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        setError('Error al conectar con el servidor. Intenta de nuevo más tarde.');
      }
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
        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ width: '100%', maxWidth: '220px', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            Inicia sesión para acceder al sistema
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Correo Institucional
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FaEnvelope />
              </div>
              <input 
                type="email" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@utmachala.edu.ec"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FaLock />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '8px', width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
          >
            {isLoading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
