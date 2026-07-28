import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    
    if (!correo.endsWith('@utmachala.edu.ec')) {
      toast.error('El correo debe ser institucional (@utmachala.edu.ec)');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { correo });
      toast.success('Si el correo está registrado, recibirás un código pronto.', { duration: 5000 });
      // Guardar correo temporalmente para la pantalla de reset
      localStorage.setItem('reset_email', correo);
      navigate('/reset-password');
    } catch (err) {
      toast.error('Error al solicitar la recuperación');
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
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Recuperar Contraseña</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ingresa tu correo institucional y te enviaremos un código de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                <FaEnvelope />
              </div>
              <input
                type="email"
                placeholder="ejemplo@utmachala.edu.ec"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
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
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Código'}
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

export default ForgotPassword;
