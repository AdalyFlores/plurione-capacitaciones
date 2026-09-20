import React, { useState, useEffect } from 'react';

export const GestionCursos = () => {
  const [cursos, setCursos] = useState([]);
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
      if (res.ok) setCursos(data.cursos);
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

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Módulo RRHH: Gestión de Cursos</h2>

      {/* FORMULARIO DE ALTA */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h3>Agregar Nuevo Curso</h3>
        
        <input name="titulo" placeholder="Título del Curso" value={form.titulo} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción breve" value={form.descripcion} onChange={handleChange} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input name="duracion" placeholder="Duración (ej: 4h)" value={form.duracion} onChange={handleChange} required />
          <input name="categoria" placeholder="Categoría (ej: APIs, Analytics)" value={form.categoria} onChange={handleChange} required />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select name="nivel" value={form.nivel} onChange={handleChange}>
            <option value="Básico">Básico</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <select name="puesto_id" value={form.puesto_id} onChange={handleChange}>
            <option value="dev">Desarrollador Backend</option>
            <option value="recruiter">Especialista en Marketing</option>
          </select>
        </div>

        <input name="url_contenido" placeholder="URL del material/video (opcional)" value={form.url_contenido} onChange={handleChange} />

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Guardar Curso
        </button>
      </form>

      {/* TABLA DE CURSOS */}
      <h3 style={{ marginTop: '30px' }}>Catálogo de Cursos en Base de Datos</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Puesto</th>
            <th>Categoría</th>
            <th>Nivel</th>
            <th>Duración</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c.id}>
              <td>{c.titulo}</td>
              <td>{c.puesto_id}</td>
              <td>{c.categoria}</td>
              <td>{c.nivel}</td>
              <td>{c.duracion}</td>
              <td>
                <button onClick={() => handleEliminar(c.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};