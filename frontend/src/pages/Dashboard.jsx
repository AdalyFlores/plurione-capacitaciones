import React, { useEffect, useState } from 'react';

export const Dashboard = ({ userProfile, score, onLogout }) => {
  const [ruta, setRuta] = useState([]);
  const [distribucion, setDistribucion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.position) {
      fetch('http://localhost:8000/api/rutas/generar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puesto_id: userProfile.position,
          score: score || 50,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setRuta(data.ruta || []);
          setDistribucion(data.distribucion);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userProfile, score]);

  const obligatorios = ruta.filter((c) => c.obligatorio);
  const complementarios = ruta.filter((c) => !c.obligatorio);

  return (
    <div className="min-h-screen w-full bg-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Cabecera */}
        <div className="bg-[#0E1E38] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Motor IA PluriOne
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                70% Obligatorio / 30% Sugerido
              </span>
            </div>
            <h1 className="text-2xl font-extrabold italic">
              Ruta de Aprendizaje Personalizada
            </h1>
            <p className="text-xs text-slate-300">
              Puesto: <span className="font-semibold text-white uppercase">{userProfile?.position || 'Desarrollador'}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Diagnóstico Diagnosticado</span>
              <span className="text-lg font-black text-emerald-400">{score}% Nivel</span>
            </div>
            <button
              onClick={onLogout}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded-lg font-bold transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl shadow">
                Analizando diagnóstico y generando ruta con la IA...
              </div>
            ) : (
              <>
                {/* Bloque 70% - Cursos Obligatorios */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold italic text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Cursos Obligatorios (70% - Brechas Prioritarias)
                    </h2>
                    <span className="text-[11px] font-bold text-slate-400">{obligatorios.length} Cursos</span>
                  </div>

                  {obligatorios.map((curso) => (
                    <div
                      key={curso.id}
                      className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded uppercase">
                            REQUERIDO POR RRHH & IA
                          </span>
                          <h3 className="text-sm font-bold text-slate-800 mt-1">
                            {curso.titulo}
                          </h3>
                        </div>
                        <button className="bg-[#0A1326] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
                          Iniciar
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                        <span>⏱️ {curso.duracion}</span>
                        <span>📊 Nivel: {curso.nivel}</span>
                        <span className="text-blue-900 italic">🤖 {curso.razon_ia}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bloque 30% - Cursos Complementarios */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold italic text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Cursos Complementarios (30% - Desarrollo Profesional)
                    </h2>
                    <span className="text-[11px] font-bold text-slate-400">{complementarios.length} Curso</span>
                  </div>

                  {complementarios.map((curso) => (
                    <div
                      key={curso.id}
                      className="bg-white p-5 rounded-xl border-l-4 border-l-amber-500 border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded uppercase">
                            RECOMENDADO / OPCIONAL
                          </span>
                          <h3 className="text-sm font-bold text-slate-800 mt-1">
                            {curso.titulo}
                          </h3>
                        </div>
                        <button className="bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors whitespace-nowrap">
                          Ver Detalle
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                        <span>⏱️ {curso.duracion}</span>
                        <span>📊 Nivel: {curso.nivel}</span>
                        <span className="text-slate-600 italic">🤖 {curso.razon_ia}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Panel Lateral Informativo */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold italic text-slate-900 uppercase tracking-wide">
                ¿Cómo se armó tu ruta?
              </h3>
              
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  1. <strong>Recursos Humanos</strong> cargó los módulos oficiales de capacitación.
                </p>
                <p>
                  2. La <strong>IA de PluriOne</strong> analizó tus respuestas en el diagnóstico.
                </p>
                <p>
                  3. Se aplicó la regla corporativa de <strong>70% de cursos prioritarios</strong> para cerrar tus brechas y <strong>30% de formación complementaria</strong>.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-2">
              <p className="font-bold">🎯 Meta de Capacitación:</p>
              <p className="text-[11px] leading-relaxed">
                Completa primero el bloque del 70% obligatorio para habilitar tu certificado de nivel en la plataforma.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};