import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaVideo, FaClock } from 'react-icons/fa';

const CalendarioHibrido = ({ sesiones, formatDate, tipoUsuario }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Función para normalizar fechas (quitar horas)
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Sesiones filtradas por el día seleccionado
  const sesionesDelDia = (sesiones || []).filter(s => isSameDay(new Date(s.inicio), fechaSeleccionada));

  // Función para agregar un "puntito" en el calendario si hay sesiones ese día
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const tieneSesiones = (sesiones || []).some(s => isSameDay(new Date(s.inicio), date));
      if (tieneSesiones) {
        return <div style={{ height: '6px', width: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', margin: '2px auto 0' }} />;
      }
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Mini Calendario (Izquierda) */}
      <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
        <Calendar 
          onChange={setFechaSeleccionada} 
          value={fechaSeleccionada} 
          tileContent={tileContent}
          className="custom-calendar"
        />
        <style>{`
          .custom-calendar {
            width: 100%;
            border: none;
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 16px;
            font-family: 'Inter', sans-serif;
            color: var(--text-primary);
            box-shadow: inset 0 0 0 1px var(--border-color);
          }
          .custom-calendar .react-calendar__navigation button {
            color: var(--text-primary);
            min-width: 44px;
            background: none;
            font-size: 16px;
            margin-top: 8px;
            border-radius: 8px;
          }
          .custom-calendar .react-calendar__navigation button:enabled:hover,
          .custom-calendar .react-calendar__navigation button:enabled:focus {
            background-color: var(--bg-tertiary);
          }
          .custom-calendar .react-calendar__month-view__days__day--weekend {
            color: var(--danger);
          }
          .custom-calendar .react-calendar__tile {
            padding: 10px 6px;
            border-radius: 8px;
            background: none;
            color: var(--text-primary);
          }
          .custom-calendar .react-calendar__tile:enabled:hover,
          .custom-calendar .react-calendar__tile:enabled:focus {
            background: var(--bg-tertiary);
          }
          .custom-calendar .react-calendar__tile--active {
            background: var(--accent-primary) !important;
            color: white !important;
          }
          .custom-calendar .react-calendar__month-view__days__day--neighboringMonth {
            color: var(--text-muted);
          }
        `}</style>
      </div>

      {/* Lista de Eventos (Derecha) */}
      <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Agenda del: <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>{fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </h4>
        
        {sesionesDelDia.length > 0 ? (
          sesionesDelDia.map((sesion, idx) => (
            <div key={idx} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1.1rem' }}>
                  {sesion.materia}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '500' }}>Con:</span> {tipoUsuario === 'estudiante' ? sesion.mentor : sesion.estudiante}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                  "{sesion.descripcion}"
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    Prioridad: {sesion.prioridad}
                  </span>
                  <span>
                    <FaClock style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {new Date(sesion.inicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} - {new Date(sesion.fin).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
              </div>
              {sesion.enlace && (
                <a href={sesion.enlace} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaVideo /> Teams
                </a>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            No hay sesiones programadas para este día.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioHibrido;
