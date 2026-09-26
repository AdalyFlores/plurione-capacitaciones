import React, { useState, useEffect, useRef } from 'react';

export const Dashboard = ({ userProfile, score, setScore, onLogout }) => {
  const [cursosIA, setCursosIA] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorIA, setErrorIA] = useState(null);

  const solicitudEjecutada = useRef(false);

  useEffect(() => {
    if (solicitudEjecutada.current) return;
    solicitudEjecutada.current = true;

    cargarRutaIA();
  }, [userProfile]);

  const cargarRutaIA = async () => {
    if (!userProfile?.id) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorIA(null);

    const usuarioId = userProfile.id;

    try {
      // 1. Solo actualizar score si en App.jsx venía en 0 y el backend tiene un puntaje real > 0
      if (!score || score === 0) {
        const resDiag = await fetch(`http://localhost:8000/api/diagnostico/ultimo/${usuarioId}`);
        if (resDiag.ok) {
          const dataDiag = await resDiag.json();
          if (dataDiag && Number(dataDiag.puntaje) > 0) {
            if (typeof setScore === 'function') {
              setScore(Number(dataDiag.puntaje));
            }
          }
        }
      }

      // 2. Consultar rutas ya guardadas en la base de datos
      const resGuardada = await fetch(`http://localhost:8000/api/rutas/usuario/${usuarioId}`);
      if (resGuardada.ok) {
        const dataGuardada = await resGuardada.json();
        let listaGuardada = dataGuardada.ruta || dataGuardada.recomendaciones || dataGuardada.cursos || dataGuardada;
        
        if (listaGuardada && typeof listaGuardada === 'object' && !Array.isArray(listaGuardada)) {
          listaGuardada = listaGuardada.cursos || listaGuardada.ruta || [];
        }

        if (Array.isArray(listaGuardada) && listaGuardada.length > 0) {
          setCursosIA(listaGuardada);
          setCargando(false);
          return;
        }
      }

      // 3. Generar la ruta con la IA si no existía
      const resIA = await fetch('http://localhost:8000/api/rutas/generar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId })
      });

      if (resIA.ok) {
        const dataIA = await resIA.json();
        let listaIA = dataIA.ruta || dataIA.recomendaciones || dataIA.cursos || dataIA;
        
        if (listaIA && typeof listaIA === 'object' && !Array.isArray(listaIA)) {
          listaIA = listaIA.cursos || listaIA.ruta || [];
        }

        if (Array.isArray(listaIA)) {
          setCursosIA(listaIA);
        }
      }
    } catch (err) {
      console.error('Error al conectar con el motor de IA:', err);
      setErrorIA('Error de conexión con el motor de IA.');
    } finally {
      setCargando(false);
    }
  };

  const obtenerNombrePuesto = (pos) => {
    const p = String(pos || '').toLowerCase();
    if (p === '1' || p === 'dev' || p === 'backend') return 'Desarrollador Backend';
    if (p === '2' || p === 'frontend') return 'Desarrollador Frontend';
    if (p === '3' || p === 'marketing') return 'Especialista en Marketing';
    if (p === '4' || p === 'analitica') return 'Analista de Datos';
    if (p === 'recruiter' || p === 'rh') return 'Reclutador / Selección';
    return pos || 'Colaborador';
  };

  const obtenerLinkCurso = (curso) => {
    if (typeof curso === 'string' && curso.startsWith('http')) return curso;
    if (typeof curso === 'object' && curso !== null) {
      return curso.link || curso.url || curso.enlace || curso.link_curso || curso.url_curso || curso.link_externo || curso.material_url || curso.url_recurso || null;
    }
    return null;
  };

  const handleIrACursoDirecto = (link) => {
    if (!link) return;
    const urlFinal = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
    window.open(urlFinal, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Resumen del perfil */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ¡Hola, {userProfile?.name || userProfile?.nombre || 'Empleado'}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Puesto: <strong className="text-slate-700">{obtenerNombrePuesto(userProfile?.position || userProfile?.puesto)}</strong> | 
            Departamento: <strong className="text-slate-700">{userProfile?.department || userProfile?.departamento || 'General'}</strong>
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center min-w-[160px]">
          <span className="text-xs uppercase font-semibold text-indigo-600 tracking-wider">Resultado Diagnóstico</span>
          <div className="text-3xl font-extrabold text-indigo-700 mt-1">{score || 0} pts</div>
        </div>
      </div>

      {/* Cursos de Capacitación */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
            Plan de Capacitación Recomendado por IA
          </h2>
          <p className="text-slate-500 text-sm">
            Cursos seleccionados inteligentemente con base en tus {score || 0} puntos
          </p>
        </div>

        {cargando ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-slate-600 font-medium text-sm">Analizando tu ruta de aprendizaje con IA...</p>
          </div>
        ) : errorIA ? (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center space-y-3">
            <p className="text-rose-700 font-semibold text-base">{errorIA}</p>
            <button 
              onClick={cargarRutaIA}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : cursosIA.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
            No se encontraron cursos personalizados asignados a tu perfil.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursosIA.map((curso, idx) => {
              const esObjeto = typeof curso === 'object' && curso !== null;
              
              const titulo = esObjeto ? (curso.nombre || curso.titulo || curso.title) : String(curso);
              const categoria = esObjeto ? (curso.categoria || curso.category || 'Capacitación') : 'Recomendado';
              const duracion = esObjeto ? (curso.duracion || curso.duration || 'Flexible') : 'Flexible';
              const descripcion = esObjeto ? (
                curso.descripcion || 
                curso.description || 
                curso.detalles || 
                curso.resumen || 
                'Curso enfocado en reforzar competencias clave para tu puesto.'
              ) : 'Curso personalizado para tu perfil profesional.';

              const nivel = esObjeto ? (curso.nivel || curso.level || 'General') : 'General';
              const linkUrl = obtenerLinkCurso(curso);
              const tieneLink = Boolean(linkUrl && linkUrl.trim() !== '');

              return (
                <div 
                  key={esObjeto && curso.id ? curso.id : idx} 
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
                        {categoria}
                      </span>
                      <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        ⏱️ {duracion}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {titulo}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed border-t border-slate-100 pt-2 mt-2">
                      {descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Nivel: <strong className="text-slate-600">{nivel}</strong></span>
                    
                    {tieneLink ? (
                      <button
                        type="button"
                        onClick={() => handleIrACursoDirecto(linkUrl)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Ir a curso</span>
                        <span className="text-sm">↗</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium rounded-xl flex items-center gap-1 select-none">
                        <span className="text-xs">🔒</span> Sin enlace disponible
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};