import React, { useState, useEffect } from 'react';

export const GestionCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    duracion: '',
    nivel: 'Básico',
    categoria: '',
    puesto_id: 'dev',
    url_contenido: ''
  });

  useEffect(() => {
    obtenerCursos();
  }, []);

  const obtenerCursos = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/cursos');
      const data = await res.json();
      if (res.ok) setCursos(data.cursos || []);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Curso guardado con éxito');
        setForm({
          titulo: '',
          descripcion: '',
          duracion: '',
          nivel: 'Básico',
          categoria: '',
          puesto_id: 'dev',
          url_contenido: ''
        });
        obtenerCursos();
      }
    } catch (error) {
      console.error('Error al crear curso:', error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/cursos/${id}`, { method: 'DELETE' });
      if (res.ok) obtenerCursos();
    } catch (error) {
      console.error('Error al eliminar curso:', error);
    }
  };

  const cursosFiltrados = cursos.filter((c) =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulo RRHH: Gestión de Cursos</h1>
          <p className="text-slate-500 text-sm">Administra y asigna el catálogo de capacitación de tu empresa</p>
        </div>

        {/* Formulario de Alta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Agregar Nuevo Curso
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Título del curso</label>
                <input
                  name="titulo"
                  placeholder="Ej. APIs REST con FastAPI"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">URL del material / vídeo</label>
                <input
                  name="url_contenido"
                  placeholder="https://..."
                  value={form.url_contenido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción</label>
              <textarea
                name="descripcion"
                placeholder="Breve resumen de los temas a tratar..."
                value={form.descripcion}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duración</label>
                <input
                  name="duracion"
                  placeholder="Ej. 4h"
                  value={form.duracion}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Categoría</label>
                <input
                  name="categoria"
                  placeholder="Ej. APIs, Analytics"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nivel</label>
                <select
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Puesto Dirigido</label>
                <select
                  name="puesto_id"
                  value={form.puesto_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="dev">Desarrollador Backend</option>
                  <option value="recruiter">Especialista en Marketing</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
              >
                Guardar Curso
              </button>
            </div>
          </form>
        </div>

        {/* Listado de Cursos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <h3 className="font-semibold text-slate-900 text-base">
              Catálogo de Cursos en Base de Datos ({cursos.length})
            </h3>
            <input
              type="text"
              placeholder="Buscar por título o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Título</th>
                  <th className="p-4">Puesto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Nivel</th>
                  <th className="p-4">Duración</th>
                  <th className="p-4 pr-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cursosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-slate-400">
                      No hay cursos registrados o coincidentes con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  cursosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-medium text-slate-900">{c.titulo}</td>
                      <td className="p-4 text-slate-600">{c.puesto_id}</td>
                      <td className="p-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                          {c.categoria}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{c.nivel}</td>
                      <td className="p-4 text-slate-600">{c.duracion}</td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleEliminar(c.id)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Eliminar
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
    </div>
  );
};