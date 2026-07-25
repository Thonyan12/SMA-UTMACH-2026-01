import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Solicitudes from './pages/Solicitudes';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas Protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="solicitudes" element={<Solicitudes />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="perfil" element={<Profile />} />
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
