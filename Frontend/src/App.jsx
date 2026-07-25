import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="solicitudes" element={<div style={{ padding: '24px' }}><h2>Página de Solicitudes (En construcción)</h2></div>} />
          <Route path="agenda" element={<div style={{ padding: '24px' }}><h2>Página de Agenda (En construcción)</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
