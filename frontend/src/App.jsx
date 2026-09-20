import React, { useState } from 'react';
import { Login } from './pages/Login';
import { ProfileSelection } from './pages/ProfileSelection';
import { Exam } from './pages/Exam';
import { Dashboard } from './pages/Dashboard';
import { GestionCursos } from './pages/GestionCursos';

export default function App() {
  const [step, setStep] = useState(1); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);
  const [examData, setExamData] = useState(null);
  const [finalScore, setFinalScore] = useState(0);


  const handleLogin = (user) => {
    setCurrentUser(user);

    if (user?.rol === 'rrhh' || user?.rol === 'admin') {
      setStep(5);
    } else {
      setStep(2);
    }
  };

  const handleSelectRole = (data) => {
    setUserProfile(data);
    
    fetch('http://localhost:8000/api/diagnostico/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentUser?.email || 'colaborador@plurione.com',
        departamento: data.department,
        puesto: data.position,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setExamData(resData.examen);
        setStep(3);
      })
      .catch((err) => console.error('Error al iniciar diagnóstico:', err));
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

            {/* Solo mostramos el botón de RRHH si tiene el rol correspondiente */}
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

      {step === 2 && <ProfileSelection onSelectRole={handleSelectRole} />}

      {step === 3 && examData && (
        <Exam
          examData={examData}
          userName={currentUser?.nombre || "Empleado"}
          onComplete={handleExamComplete}
        />
      )}

      {step === 4 && (
        <Dashboard
          userProfile={userProfile}
          score={finalScore}
          onLogout={handleLogout}
        />
      )}

      {/* Pantalla de Gestión de Cursos protegida */}
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