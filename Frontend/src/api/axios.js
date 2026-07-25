import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // FastAPI Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Añade el token JWT si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manejo global de errores (ej. token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido -> limpiar sesión y redirigir
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
