import React, { useState, useEffect } from 'react';

export const GestionPreguntasRH = () => {
  const [estructura, setEstructura] = useState([]);
  const [departamentoId, setDepartamentoId] = useState('');
  const [puestoId, setPuestoId] = useState('');
  const [texto, setTexto] = useState('');
  const [opciones, setOpciones] = useState(['', '', '', '']);
  const [opcionCorrecta, setOpcionCorrecta] = useState(0);
  const [categoria, setCategoria] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    obtenerEstructura();
  }, []);

  const obtenerEstructura = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/estructura');
      if (res.ok) {
        const data = await res.json();
        setEstructura(data);
      }
    } catch (err) {
      console.error('Error al cargar la estructura:', err);
    }
  };

  const deptoSeleccionado = estructura.find((d) => String(d.id) === String(departamentoId));
  const puestosDisponibles = deptoSeleccionado ? deptoSeleccionado.puestos : [];

  const handleOpcionChange = (index, value) => {
    const nuevas = [...opciones];
    nuevas[index] = value;
    setOpciones(nuevas);
  };

  const guardarPregunta = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!puestoId) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un departamento y un puesto válido.' });
      return;
    }

    const payload = {
      puesto: String(puestoId),
      texto,
      opciones,
      opcion_correcta: parseInt(opcionCorrecta),
      categoria: categoria || 'General'
    };

    try {
      const res = await fetch('http://localhost:8000/api/admin/preguntas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMensaje({ tipo: 'éxito', texto: '¡Pregunta guardada en la base de datos correctamente!' });
        setTexto('');
        setOpciones(['', '', '', '']);
        setCategoria('');
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al guardar la pregunta en la BD.' });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el backend.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Banco de Preguntas Diagnósticas (RH)</h2>
        <p className="text-xs text-slate-500">Agrega preguntas para que la IA evalúe las competencias del alumno.</p>
      </div>

      {mensaje && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold ${
            mensaje.tipo === 'éxito'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={guardarPregunta} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Selector de Departamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Departamento:</label>
            <select
              value={departamentoId}
              onChange={(e) => {
                setDepartamentoId(e.target.value);
                setPuestoId('');
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- Selecciona Departamento --</option>
              {estructura.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Puesto Asignado */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Puesto Asignado:</label>
            <select
              value={puestoId}
              onChange={(e) => setPuestoId(e.target.value)}
              disabled={!departamentoId}
              required
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            >
              <option value="">-- Selecciona Puesto --</option>
              {puestosDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Pregunta:</label>
          <textarea
            rows="2"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. ¿Qué librería de Python utiliza FastAPI para la validación de datos?"
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            Opciones (Selecciona el radio button de la respuesta correcta):
          </label>
          {opciones.map((op, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correcta"
                checked={parseInt(opcionCorrecta) === idx}
                onChange={() => setOpcionCorrecta(idx)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder={`Opción ${idx + 1}`}
                value={op}
                onChange={(e) => handleOpcionChange(idx, e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría / Tema:</label>
          <input
            type="text"
            placeholder="Ej. FastAPI, Git, Bases de Datos"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
        >
          Guardar Pregunta en PostgreSQL
        </button>
      </form>
    </div>
  );
};