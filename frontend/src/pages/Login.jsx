import React, { useState, useEffect } from 'react';

export function Login({ onLogin }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/usuarios/simulador')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setUsuarios(data);
          setUsuarioSeleccionado(data[0]);
        }
      })
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  const handleMicrosoftLogin = () => {
    if (usuarioSeleccionado) {
      onLogin(usuarioSeleccionado);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full border border-slate-200">
        
        <h1 className="text-2xl font-bold mb-1 text-slate-800">PluriOne Enterprise</h1>
        <p className="text-gray-500 mb-6 text-sm">Plataforma de Inducción Inteligente</p>

        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            Simulador de Usuario (Entra ID):
          </label>
          <select 
            className="w-full p-2 bg-white border rounded text-sm text-slate-700"
            onChange={(e) => setUsuarioSeleccionado(usuarios.find(u => String(u.id) === e.target.value))}
          >
            {usuarios.length === 0 ? (
              <option value="">Cargando usuarios desde PostgreSQL...</option>
            ) : (
              <>
                {/* Grupo 1: Personal de Recursos Humanos / Administradores */}
                <optgroup label="── Personal de Recursos Humanos ──">
                  {usuarios
                    .filter((u) => u.rol === 'rh' || u.rol === 'admin')
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombre} - ({user.puesto_nombre || 'RH'})
                      </option>
                    ))}
                </optgroup>

                {/* Grupo 2: Empleados en Inducción */}
                <optgroup label="── Empleados (Inducción) ──">
                  {usuarios
                    .filter((u) => u.rol !== 'rh' && u.rol !== 'admin')
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombre} - Puesto: {user.puesto_nombre || user.puesto}
                      </option>
                    ))}
                </optgroup>
              </>
            )}
          </select>
        </div>

        <button
          onClick={handleMicrosoftLogin}
          disabled={!usuarioSeleccionado}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg transition-all font-medium shadow-md disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          Iniciar sesión con Microsoft
        </button>

      </div>
    </div>
  );
}