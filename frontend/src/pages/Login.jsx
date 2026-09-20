import React, { useState } from 'react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa un correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.detail || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con Python (FastAPI). Verifica que esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        email: 'usuario.microsoft@prueba.com',
        nombre: 'Usuario Microsoft (Prueba)',
        rol: 'usuario'
      });
      setLoading(false);
    }, 800);
  };

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

        {/* Cuerpo del Formulario */}
        <div className="flex-1 flex relative">
          <div className="w-full lg:w-1/2 p-8 sm:p-12 z-10 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto space-y-4">
              
              <h1 className="text-2xl font-extrabold italic text-slate-900">
                Iniciar Sesión
              </h1>

              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded text-xs border border-red-200">
                  {error}
                </div>
              )}

              {/* Botón de Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-slate-300 py-2 px-4 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z"/>
                  <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                  <path fill="#7fba00" d="M11 1h9v9H11z"/>
                  <path fill="#ffb900" d="M11 11h9v9H11z"/>
                </svg>
                Iniciar sesión con Microsoft
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase">o con correo</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Formulario Estándar */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold italic text-slate-800 mb-1">
                    Correo de prueba
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prueba@empresa.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold italic text-slate-800 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700"
                  />
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-48 bg-[#0A1326] text-white py-2 px-6 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Verificando...' : 'Ingresar'}
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