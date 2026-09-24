import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Exam } from './pages/Exam';
import { Dashboard } from './pages/Dashboard';
import { GestionCursos } from './pages/GestionCursos';

export default function App() {
  const [step, setStep] = useState(1); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);
  const [examData, setExamData] = useState(null);
  const [finalScore, setFinalScore] = useState(0);

  const handleLogin = async (user) => {
    setCurrentUser(user);

    if (user?.rol === 'rrhh' || user?.rol === 'admin') {
      setStep(5);
      return;
    }

    try {
      const userId = user?.id;
      
      // Tomamos el puesto directamente de la BD sin pedir al usuario seleccionarlo
      const puestoMapeado = String(user?.puesto || user?.puesto_id || 'dev');

      const perfilActualizado = {
        id: userId,
        name: user.nombre || user.email,
        position: puestoMapeado,
        puesto_id: puestoMapeado,
        department: user.departamento || 'tecnologia'
      };

      setUserProfile(perfilActualizado);

      // 1. Verificamos si el usuario ya realizó su diagnóstico
      const resRuta = await fetch(`http://localhost:8000/api/rutas/usuario/${userId}`);

      if (resRuta.ok) {
        const dataRuta = await resRuta.json();
        
        if (dataRuta && dataRuta.ruta) {
          if (dataRuta.puntaje) setFinalScore(dataRuta.puntaje);
          setStep(4); // Si ya tiene ruta guardada -> Va directo al Dashboard
          return;
        }
      }

      // 2. Si NO tiene ruta previa -> Pedimos el examen automáticamente
      const resExam = await fetch('http://localhost:8000/api/diagnostico/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email || 'colaborador@plurione.com',
          departamento: perfilActualizado.department,
          puesto: perfilActualizado.position,
        }),
      });

      if (resExam.ok) {
        const resData = await resExam.json();
        setExamData(resData.examen || resData);
        setStep(3); // Manda directo al Examen (Paso 3)
      } else {
        alert("No se pudo obtener el examen para el puesto asignado.");
      }

    } catch (err) {
      console.error('Error durante la autenticación:', err);
    }
  };

  const handleExamComplete = (calculatedScore) => {
    setFinalScore(calculatedScore);
    setStep(4);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setExamData(null);
    setFinalScore(0);
    setStep(1);
  };

  const esRRHH = currentUser?.rol === 'rrhh' || currentUser?.rol === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Navbar que solo se muestra cuando hay sesión iniciada */}
      {currentUser && (
        <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center text-sm shadow-md">
          <span className="font-bold text-lg">PluriOne Capacitaciones</span>
          
          <div className="flex gap-4 items-center">
            <span className="text-slate-300">
              Usuario: <strong>{currentUser.nombre || currentUser.email}</strong> ({currentUser.rol})
            </span>

            {esRRHH && (
              <button 
                onClick={() => setStep(5)} 
                className={`px-3 py-1 rounded transition-colors ${step === 5 ? 'bg-blue-600 font-bold' : 'hover:bg-slate-700'}`}
              >
                Panel RRHH (Cursos)
              </button>
            )}

            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      )}

      {/* RENDERIZADO CONDICIONAL DE PANTALLAS */}
      {step === 1 && <Login onLogin={handleLogin} />}

      {step === 3 && examData && (
        <Exam
          examData={examData}
          userName={currentUser?.nombre || currentUser?.email || "Empleado"}
          userProfile={userProfile || currentUser}
          onComplete={handleExamComplete}
        />
      )}

      {step === 4 && (
        <Dashboard
          userProfile={userProfile || currentUser}
          score={finalScore}
          onLogout={handleLogout}
        />
      )}

      {step === 5 && (
        <div className="p-6">
          {esRRHH ? (
            <GestionCursos />
          ) : (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-600">Acceso Denegado</h2>
              <p className="text-gray-600 mt-2">No tienes permisos de Recursos Humanos para acceder a este módulo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}