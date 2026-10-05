import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { GestionEstructura } from './GestionEstructura';
import { GestionCursos } from './GestionCursos'; 
import { GestionPreguntasRH} from './GestionPreguntasRH';
import { SeguimientoXAPI } from './SeguimientoXAPI';

export const PanelRRHH = () => {
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ÚNICA BARRA DE BOTONES (PARTE SUPERIOR) */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
        <button
          onClick={() => setPestanaActiva('dashboard')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            pestanaActiva === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📊 Dashboard y Analítica
        </button>

        <button
          onClick={() => setPestanaActiva('estructura')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            pestanaActiva === 'estructura'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 Departamentos y Puestos
        </button>

        <button
          onClick={() => setPestanaActiva('cursos')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            pestanaActiva === 'cursos'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📚 Gestión de Cursos
        </button>

        <button
          onClick={() => setPestanaActiva('preguntas')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            pestanaActiva === 'preguntas'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📝 Banco de Preguntas Diagnósticas
        </button>

        <button
          onClick={() => setPestanaActiva('xapi')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            pestanaActiva === 'xapi'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 Métricas & xAPI
        </button>
      </div>

      {/* RENDERIZADO DEL CONTENIDO REAL DE LAS PESTAÑAS */}
      {pestanaActiva === 'dashboard' && <AdminDashboard />}
      {pestanaActiva === 'estructura' && <GestionEstructura />}
      {pestanaActiva === 'cursos' && <GestionCursos />}
      {pestanaActiva === 'preguntas' && <GestionPreguntasRH />}
      {pestanaActiva === 'xapi' && <SeguimientoXAPI />}
    </div>
  );
};