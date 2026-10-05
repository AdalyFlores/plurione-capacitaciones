import React, { useState, useEffect } from 'react';

export const SeguimientoXAPI = () => {
  const [logs, setLogs] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonSeleccionado, setJsonSeleccionado] = useState(null);

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    setLoading(true);
    try {
      const url = usuarioId 
        ? `http://localhost:8000/api/xapi/statements?usuario_id=${usuarioId}`
        : `http://localhost:8000/api/xapi/statements`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.statements || []);
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error("Error al obtener registros xAPI:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getVerboBadge = (verbo) => {
    const v = String(verbo || '').toLowerCase();
    if (v.includes('completado') || v.includes('completed')) 
      return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">✓ Completado</span>;
    if (v.includes('iniciado') || v.includes('launched') || v.includes('experienced')) 
      return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold">▶ Iniciado</span>;
    if (v.includes('aprobado') || v.includes('passed')) 
      return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold">★ Aprobó</span>;
    if (v.includes('respondido') || v.includes('answered')) 
      return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">✎ Respondió</span>;
    
    return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold">{verbo || 'Evento'}</span>;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Métricas & Eventos xAPI</h1>
          <p className="text-slate-500 text-sm">Registro detallado del aprendizaje y rendimiento de los colaboradores</p>
        </div>

        {/* Filtro por usuario */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 uppercase">Filtrar por Colaborador (ID):</label>
            <input
              type="text"
              placeholder="Ej. 6 (vacío = todos)"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={cargarLogs}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
            >
              Actualizar
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {loading ? 'Consultando...' : `Registros encontrados: ${logs.length}`}
          </div>
        </div>

        {/* Tabla de Eventos xAPI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-base">Historial de Actividades (Statements)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Colaborador</th>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Curso / Actividad</th>
                  <th className="p-4 pr-6 text-center">Detalles xAPI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-400">
                      No hay eventos xAPI registrados para este filtro.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nombre legible */}
                      <td className="p-4 pl-6 font-semibold text-slate-900">
                        {log.usuario_nombre || `Usuario #${log.usuario_id || log.actor_id || '-'}`}
                      </td>
                      
                      {/* Fecha formateada */}
                      <td className="p-4 text-slate-500 text-xs font-mono">
                        {log.marca_tiempo ? new Date(log.marca_tiempo).toLocaleString() : '-'}
                      </td>
                      
                      {/* Badge con color */}
                      <td className="p-4">{getVerboBadge(log.verbo)}</td>
                      
                      {/* Objeto o curso */}
                      <td className="p-4 font-medium text-slate-800">{log.objeto || 'General'}</td>
                      
                      {/* Botón para abrir modal con JSON */}
                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => setJsonSeleccionado(log.detalles)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
                        >
                          🔍 Ver JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para inspeccionar el JSON xAPI */}
      {jsonSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Detalles del Evento (xAPI Statement)</h3>
              <button
                onClick={() => setJsonSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800 shadow-inner">
              {JSON.stringify(jsonSeleccionado, null, 2)}
            </pre>
            <div className="text-right pt-2">
              <button
                onClick={() => setJsonSeleccionado(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};