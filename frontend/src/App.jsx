import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Exam } from './pages/Exam';
import { Dashboard } from './pages/Dashboard';
import { GestionCursos } from './pages/GestionCursos';
import { Curso } from './pages/Curso';

export default function App() {
  const [step, setStep] = useState(1); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);
  const [examData, setExamData] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Restaurar sesión automáticamente al dar F5
  useEffect(() => {
    const savedUser = localStorage.getItem('pluriUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        handleLogin(user);
      } catch (err) {
        console.error('Error restaurando sesión:', err);
      }
    }
  }, []);

  const handleLogin = async (user) => {
    setCurrentUser(user);
    localStorage.setItem('pluriUser', JSON.stringify(user));

    if (user?.rol === 'rrhh' || user?.rol === 'admin') {
      setStep(5);
      return;
    }

    const userId = user?.id || 1;
    const puestoMapeado = String(user?.puesto || user?.puesto_id || 'dev');

    const perfilActualizado = {
      id: userId,
      name: user.nombre || user.email,
      position: puestoMapeado,
      puesto_id: puestoMapeado,
      department: user.departamento || 'tecnologia'
    };

    setUserProfile(perfilActualizado);

    try {
      // 1. Consultar el último diagnóstico completado del usuario
      const resDiag = await fetch(`http://localhost:8000/api/diagnostico/ultimo/${userId}`);
      
      if (resDiag.ok) {
        const dataDiag = await resDiag.json();
        const puntajeObtenido = Number(dataDiag.score || 0);

        // Si la base de datos devuelve un puntaje mayor a 0, vamos directo al Dashboard
        if (puntajeObtenido > 0) {
          setFinalScore(puntajeObtenido);
          setStep(4); // Pantalla de Dashboard (Mi Ruta)
          return;
        }
      }

      // 2. Solo si el usuario NO tiene puntaje previo en BD, se inicia el examen
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
        setStep(3); // Ir a la vista del Examen
        return;
      }

      setStep(3);

    } catch (err) {
      console.error('Error durante la verificación del usuario:', err);
      setStep(4);
    }
  };

  const handleExamComplete = (calculatedScore) => {
    const puntajeValido = Number(calculatedScore) || 0;
    setFinalScore(puntajeValido);
    setStep(4);
  };

  const handleSelectCourse = (cursoId) => {
    setSelectedCourseId(cursoId);
    setStep(6);
  };

  const handleLogout = () => {
    localStorage.removeItem('pluriUser');
    setCurrentUser(null);
    setUserProfile(null);
    setExamData(null);
    setFinalScore(0);
    setSelectedCourseId(null);
    setStep(1);
  };

  const esRRHH = currentUser?.rol === 'rrhh' || currentUser?.rol === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {currentUser && (
        <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center text-sm shadow-md">
          <span className="font-bold text-lg cursor-pointer" onClick={() => setStep(4)}>
            PluriOne Capacitaciones
          </span>
          
          <div className="flex gap-4 items-center">
            <span className="text-slate-300">
              Usuario: <strong>{currentUser.nombre || currentUser.email}</strong> ({currentUser.rol})
            </span>

            <button 
              onClick={() => setStep(4)} 
              className={`px-3 py-1 rounded transition-colors ${step === 4 ? 'bg-blue-600 font-bold' : 'hover:bg-slate-700'}`}
            >
              Mi Ruta
            </button>

            {esRRHH && (
              <button 
                onClick={() => setStep(5)} 
                className={`px-3 py-1 rounded transition-colors ${step === 5 ? 'bg-blue-600 font-bold' : 'hover:bg-slate-700'}`}
              >
                Panel RRHH
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

      {step === 1 && <Login onLogin={handleLogin} />}

      {step === 3 && (
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
          setScore={setFinalScore}
          onLogout={handleLogout}
          onSelectCourse={handleSelectCourse}
        />
      )}

      {step === 5 && (
        <div className="p-6">
          {esRRHH ? (
            <GestionCursos />
          ) : (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-600">Acceso Denegado</h2>
            </div>
          )}
        </div>
      )}

      {step === 6 && selectedCourseId && (
        <div className="p-6">
          <Curso 
            cursoId={selectedCourseId} 
            usuarioId={currentUser?.id}
            onBack={() => {
              setSelectedCourseId(null);
              setStep(4);
            }} 
          />
        </div>
      )}
    </div>
  );
}