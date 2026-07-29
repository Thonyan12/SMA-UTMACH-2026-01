import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  
  const [step, setStep] = useState(1); // 1 = Login normal, 2 = Código 2FA
  const [cuentaId, setCuentaId] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, login2FA } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.endsWith('@utmachala.edu.ec')) {
      const msg = 'El correo debe ser institucional (@utmachala.edu.ec)';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(correo, password);
      
      if (result && result.requires_2fa) {
        setCuentaId(result.cuenta_id);
        setStep(2); // Pasar al paso de 2FA
        toast.success(result.message || 'Código enviado al correo');
      } else {
        navigate('/dashboard'); // Redirigir al Dashboard
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.detail || 'Error de validación');
      } else {
        setError('Error al conectar con el servidor. Intenta de nuevo más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login2FA(cuentaId, codigo2fa);
      toast.success('Dispositivo verificado correctamente');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Código incorrecto o expirado';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await login(correo, password);
      if (result && result.requires_2fa) {
        toast.success('Nuevo código enviado a tu correo');
      }
    } catch (err) {
      toast.error('Error al reenviar el código. Intenta nuevamente.');
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
      <div className="card-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative' }}>
        <Link to="/" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <FaArrowLeft /> Inicio
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo-horizontal-300x99.png" alt="UTMACH Logo" style={{ width: '100%', maxWidth: '220px', marginBottom: '16px', marginTop: '20px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Inicia sesión para acceder al sistema' : 'Verificación de dos pasos (Nuevo Dispositivo)'}
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
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  Contraseña
                </label>
                <Link to="/forgot-password" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FaLock />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 36px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
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
              disabled={isLoading}
              style={{ marginTop: '8px', width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
            >
              {isLoading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Código de 6 dígitos
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FaKey />
                </div>
                <input 
                  type="text" 
                  value={codigo2fa}
                  onChange={(e) => setCodigo2fa(e.target.value)}
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Hemos enviado un código temporal a tu correo. Revísalo e ingrésalo aquí.
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '8px', width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              {isLoading ? <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : 'Verificar Dispositivo'}
            </button>
            <button type="button" onClick={handleResendCode} disabled={isLoading} className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              {isLoading ? 'Reenviando...' : 'Volver a enviar código'}
            </button>
            <button type="button" onClick={() => { setStep(1); setCodigo2fa(''); setError(''); }} className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              Volver atrás
            </button>
          </form>
        )}
        </div>
      </div>
    );
  };
  
  export default Login;
