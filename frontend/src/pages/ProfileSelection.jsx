import React, { useState, useEffect } from 'react';

export const ProfileSelection = ({ onSelectRole }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [puestosDisponibles, setPuestosDisponibles] = useState({});
  
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/perfiles')
      .then((res) => res.json())
      .then((data) => {
        setDepartamentos(data.departamentos || []);
        setPuestosDisponibles(data.puestos || {});
      })
      .catch((err) => console.error('Error al cargar perfiles:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department || !position) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/diagnostico/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'usuario@prueba.com',
          departamento: department,
          puesto: position,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSelectRole({ department, position, sesionId: data.sesion_id });
      } else {
        alert('Ocurrió un error al procesar la selección.');
      }
    } catch (error) {
      console.error('Error al conectar con Python:', error);
      alert('No se pudo conectar con el servidor Backend.');
    } finally {
      setLoading(false);
    }
  };


  const listaPuestos = puestosDisponibles[department] || [];

  return (
    <div className="min-h-screen w-full bg-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col min-h-[520px] relative border border-slate-100">
        
        {/* Franja Azul Superior */}
        <div className="w-full bg-[#0E1E38] h-24 flex items-center px-8 z-20 relative">
          <div className="bg-white px-4 py-2 rounded shadow-md flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-slate-800 text-base">
                O
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-800 tracking-tight leading-none">pluriOne</span>
                <span className="text-[7px] text-slate-400 tracking-widest uppercase">financial services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 flex relative">
          <div className="w-full lg:w-1/2 p-8 sm:p-12 z-10 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto space-y-4">
              
              <h1 className="text-2xl font-extrabold italic text-slate-900">
                Selecciona tu perfil profesional
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Selector de Departamento Dinámico */}
                <div>
                  <label className="block text-xs font-semibold italic text-slate-800 mb-1">
                    Departamento
                  </label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setPosition(''); // Reinicia puesto al cambiar departamento
                      }}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-600 cursor-pointer"
                    >
                      <option value="" disabled>Seleccionar departamento...</option>
                      {departamentos.map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-900 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Selector de Puesto Dinámico */}
                <div>
                  <label className="block text-xs font-semibold italic text-slate-800 mb-1">
                    Puesto
                  </label>
                  <div className="relative">
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={!department}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-600 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        {department ? 'Seleccionar puesto...' : 'Primero elige un departamento'}
                      </option>
                      {listaPuestos.map((puesto) => (
                        <option key={puesto.id} value={puesto.id}>
                          {puesto.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-900 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-48 bg-[#0A1326] text-white py-2 px-6 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Iniciar diagnostico'}
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* Diagonal Visual */}
          <div 
            className="hidden lg:block absolute -top-24 right-0 w-3/5 h-[calc(100%+6rem)] bg-[#0E1E38]"
            style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)' }}
          >
            <div 
              className="w-full h-full bg-[#050B17] opacity-40"
              style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 20% 100%)' }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};