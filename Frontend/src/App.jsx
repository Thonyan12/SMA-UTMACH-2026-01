import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas Protegidas */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="solicitudes" element={<div style={{ padding: '24px' }}><h2>Página de Solicitudes (En construcción)</h2></div>} />
              <Route path="agenda" element={<div style={{ padding: '24px' }}><h2>Página de Agenda (En construcción)</h2></div>} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
