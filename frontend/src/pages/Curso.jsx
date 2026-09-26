import React, { useState, useEffect } from 'react';

export function Curso({ cursoId, usuarioId, onBack }) {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const obtenerDetalleCurso = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/cursos/${cursoId}`);
        
        if (!res.ok) {
          throw new Error(`El curso con ID ${cursoId} no fue encontrado.`);
        }

        const data = await res.json();
        const cursoObtenido = data.curso || data;
        
        if (cursoObtenido && (cursoObtenido.id || cursoObtenido.titulo)) {
          setCurso(cursoObtenido);
        } else {
          setError("No se pudieron cargar los datos del curso.");
        }
      } catch (err) {
        console.error("Error al cargar el curso:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (cursoId) {
      obtenerDetalleCurso();
    }
  }, [cursoId]);

  const registrarProgreso = async () => {
    try {
      await fetch('http://localhost:8000/api/progreso/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuarioId || 1,
          id_curso: cursoId,
          estatus: 'Completado',
          calificacion: 100
        })
      });
      setCompletado(true);
    } catch (err) {
      console.error("Error al registrar el progreso:", err);
    }
  };

  // Función para determinar si la URL se puede meter en un iframe
  const analizarUrl = (url) => {
    if (!url) return { esVideo: false, urlEmbed: null };
    let urlLimpia = url.trim();

    if (urlLimpia.includes('youtube.com/watch?v=')) {
      const videoId = urlLimpia.split('v=')[1]?.split('&')[0];
      return { esVideo: true, urlEmbed: `https://www.youtube.com/embed/${videoId}` };
    }
    if (urlLimpia.includes('youtu.be/')) {
      const videoId = urlLimpia.split('youtu.be/')[1]?.split('?')[0];
      return { esVideo: true, urlEmbed: `https://www.youtube.com/embed/${videoId}` };
    }

    return { esVideo: false, urlEmbed: urlLimpia };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-600 font-medium">
        Cargando detalles del curso...
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="text-red-600 font-bold text-lg">
          {error || "Curso no encontrado o no disponible."}
        </div>
        <button
          onClick={onBack}
          className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition text-sm font-semibold"
        >
          Volver a Mi Ruta
        </button>
      </div>
    );
  }

  const { esVideo, urlEmbed } = analizarUrl(curso.url_contenido);

  return (
  <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6 space-y-6 border border-slate-100">
    {/* Botón Volver */}
    <button
      onClick={onBack}
      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-2 group"
    >
      <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver a Mi Ruta
    </button>

    {/* Encabezado del Curso */}
    <div className="border-b border-slate-100 pb-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {curso.categoria || 'Capacitación'}
        </span>
        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
          Nivel: {curso.nivel || 'General'}
        </span>
        {curso.tipo_contenido && (
          <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-3 py-1 rounded-full">
            {curso.tipo_contenido}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{curso.titulo}</h1>
      
      <p className="text-slate-600 mt-4 text-base leading-relaxed">
        {curso.descripcion || 'Sin descripción disponible para este módulo.'}
      </p>
    </div>

    {/* Ficha de detalles basada en tus columnas reales */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
      <div className="flex items-center gap-2">
        <span className="text-base">⏱️</span>
        <span><strong>Duración estimada:</strong> {curso.duracion || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-base">🎯</span>
        <span><strong>Puesto asignado:</strong> {curso.puesto_id || 'General'}</span>
      </div>
    </div>

    {/* Material del Curso */}
    <div className="mt-6">
      <h3 className="font-bold text-slate-800 text-lg mb-3">Material del Curso</h3>

      {curso.url_contenido ? (
        esVideo ? (
          /* Reproductor embed para videos */
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <iframe
              src={urlEmbed}
              title={curso.titulo}
              className="w-full h-[450px] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          /* Tarjeta para enlaces web o documentación externa */
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="text-slate-700 font-medium max-w-md">
              Este recurso de aprendizaje se encuentra en una plataforma externa.
            </div>
            <a
              href={curso.url_contenido}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-indigo-200"
            >
              <span>Ir al curso externo</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-800 space-y-2">
          <p className="font-semibold text-base">⚠️ Este curso no cuenta con un enlace de material adjunto.</p>
          <p className="text-sm text-amber-700">
            Revisa la información descrita arriba y marca el módulo como completado.
          </p>
        </div>
      )}
    </div>

    {/* Botón de Finalización */}
    <div className="pt-4 border-t border-slate-100 flex justify-end items-center">
      {completado ? (
        <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-5 py-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
          ✓ ¡Curso completado!
        </span>
      ) : (
        <button
          onClick={registrarProgreso}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition shadow-md hover:shadow-emerald-100"
        >
          Marcar como Completado
        </button>
      )}
    </div>
  </div>
);
}