import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Silently fetch updated data from server to keep context fresh
        api.get('/auth/me').then(res => {
          localStorage.setItem('user', JSON.stringify(res.data));
          setUser(res.data);
        }).catch(err => {
          console.error("Failed to refresh user data", err);
        });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo, password) => {
    // In FastAPI, OAuth2PasswordRequestForm requires form data (username, password)
    const formData = new URLSearchParams();
    formData.append('username', correo);
    formData.append('password', password);

    const deviceId = localStorage.getItem('device_id') || '';

    const response = await api.post('/auth/login', formData, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-device-id': deviceId
      }
    });

    if (response.data.requires_2fa) {
      return response.data; // Return early for Login.jsx to handle 2FA
    }

    const { access_token } = response.data;
    
    // Almacenar token temporalmente para la siguiente petición
    localStorage.setItem('token', access_token);
    
    // Obtener los datos del usuario logueado
    const userResponse = await api.get('/auth/me');
    const userData = userResponse.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const login2FA = async (cuenta_id, codigo) => {
    // Generate a secure random device_id if not exists
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_id', deviceId);
    }
    
    const response = await api.post('/auth/verify-2fa', { cuenta_id, codigo, device_id: deviceId });
    const { access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    const userResponse = await api.get('/auth/me');
    const userData = userResponse.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, login2FA, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
