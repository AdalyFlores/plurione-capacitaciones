import React, { useState } from 'react';

export function Login({ onLogin }) {
  // Simulamos 2 empleados de prueba ya existentes en tu Base de Datos
  const usuariosDePrueba = [
    {
      id: 1,
      nombre: "Ana Gómez (Dev)",
      email: "ana.gomez@plurione.com",
      rol: "empleado",
      puesto: "dev",
      departamento: "Tecnología"
    },
    {
      id: 2,
      nombre: "Carlos Ruiz (Recruiter)",
      email: "carlos.ruiz@plurione.com",
      rol: "empleado",
      puesto: "recruiter",
      departamento: "Recursos Humanos"
    }
  ];

  // Usuario seleccionado para probar la simulación
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(usuariosDePrueba[0]);

  const handleMicrosoftLogin = () => {
    // Simulamos la respuesta de Microsoft Entra ID entregando el usuario
    onLogin(usuarioSeleccionado);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full border border-slate-200">
        
        <h1 className="text-2xl font-bold mb-1 text-slate-800">PluriOne Enterprise</h1>
        <p className="text-gray-500 mb-6 text-sm">Plataforma de Inducción Inteligente</p>

        {/* Selector de prueba solo para que pruebes ambos puestos en tu laptop */}
        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            Simulador de Usuario (Entra ID):
          </label>
          <select 
            className="w-full p-2 bg-white border rounded text-sm text-slate-700"
            onChange={(e) => setUsuarioSeleccionado(usuariosDePrueba[e.target.value])}
          >
            {usuariosDePrueba.map((user, index) => (
              <option key={user.id} value={index}>
                {user.nombre} - Puesto: {user.puesto}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Principal de Microsoft */}
        <button
          onClick={handleMicrosoftLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg transition-all font-medium shadow-md"
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