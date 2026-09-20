import React, { useState, useEffect } from 'react';

export const Exam = ({ examData, userName = "Carmen Adaly Flores Rendon", onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Cronómetro de 10 minutos
  const [timeLeft, setTimeLeft] = useState((examData?.duracion_minutos || 10) * 60);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleFinalize();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalQuestions = examData?.preguntas?.length || 0;
  const currentQuestion = examData?.preguntas?.[currentIndex];
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleSelectOption = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinalize();
    }
  };

  const handleFinalize = () => {
    let totalScore = 0;
    examData.preguntas.forEach((q) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex !== undefined) {
        const optionWeight = (selectedIndex + 1) / q.opciones.length;
        totalScore += optionWeight;
      }
    });

    const calculatedScore = Math.round((totalScore / totalQuestions) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    // Guardar resultado en PostgreSQL mediante FastAPI
    fetch('http://localhost:8000/api/diagnostico/guardar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: 1,
        puesto_id: 'dev',
        score: calculatedScore,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Diagnóstico guardado exitosamente en BD:', data);
      })
      .catch((err) => {
        console.error('❌ Error guardando el diagnóstico:', err);
      });
  };

  const initialLetter = userName ? userName.charAt(0).toUpperCase() : 'U';

  if (!currentQuestion && !submitted) {
    return <div className="p-8 text-center text-slate-600">Cargando evaluación...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col min-h-[560px] relative border border-slate-100">
        
        {/* Franja Azul Superior con Logo y Nombre */}
        <div className="w-full bg-[#0E1E38] h-28 flex items-center justify-between px-8 z-20 relative">
          <div className="flex flex-col gap-2">
            <div className="bg-white px-4 py-2 rounded shadow-md flex items-center justify-center w-fit">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-slate-800 text-sm">
                  O
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-800 tracking-tight leading-none">pluriOne</span>
                  <span className="text-[6px] text-slate-400 tracking-widest uppercase">financial services</span>
                </div>
              </div>
            </div>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center font-extrabold text-xs shadow">
                {initialLetter}
              </div>
              <span className="text-xs font-semibold italic tracking-wide">
                {userName}
              </span>
            </div>
          </div>

          {/* Reloj */}
          {!submitted && (
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Tiempo restante</span>
              <span className={`text-sm font-mono font-bold ${timeLeft < 120 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Cuerpo */}
        <div className="flex-1 flex relative">
          <div className="w-full lg:w-3/4 p-8 sm:p-10 z-10 flex flex-col justify-between bg-white">
            
            {!submitted ? (
              <div className="space-y-6">
                {/* Barra de Progreso */}
                <div className="space-y-1 max-w-lg">
                  <div className="flex justify-between items-center text-xs font-extrabold italic text-slate-900">
                    <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
                    <span className="text-blue-900">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0E1E38] h-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tarjeta de Pregunta */}
                <div className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 bg-white shadow-lg space-y-6 max-w-2xl">
                  <h2 className="text-lg sm:text-xl font-extrabold italic text-slate-900 text-center leading-snug">
                    {currentQuestion.texto}
                  </h2>

                  {/* Opciones en Retícula de Botones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentQuestion.opciones.map((op, opIdx) => {
                      const isSelected = answers[currentQuestion.id] === opIdx;
                      return (
                        <button
                          key={opIdx}
                          type="button"
                          onClick={() => handleSelectOption(opIdx)}
                          className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-center flex items-center justify-center min-h-[52px] ${
                            isSelected
                              ? 'border-[#0E1E38] bg-[#0E1E38] text-white shadow-md scale-[1.02]'
                              : 'border-slate-800 bg-white text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {op}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botón Siguiente */}
                <div className="flex justify-end max-w-2xl pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={answers[currentQuestion.id] === undefined}
                    className="bg-[#0A1326] text-white py-2.5 px-8 rounded-lg text-xs font-extrabold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Finalizar'}
                  </button>
                </div>
              </div>
            ) : (
              /* Pantalla de Resultados */
              <div className="text-center space-y-4 py-8 my-auto">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-inner ${
                  score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {score}%
                </div>
                <h2 className="text-2xl font-extrabold italic text-slate-900">
                  Diagnóstico Finalizado
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Tus respuestas se han guardado exitosamente. Con este resultado configuraremos tu ruta de aprendizaje personalizada.
                </p>

                <button
                  onClick={() => onComplete(score)}
                  className="mt-4 bg-[#0A1326] text-white py-2.5 px-6 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
                >
                  Ver mi Plan de Desarrollo Personalizado
                </button>
              </div>
            )}

          </div>

          {/* Diagonal Visual Corporativa */}
          <div 
            className="hidden lg:block absolute -top-28 right-0 w-2/5 h-[calc(100%+7rem)] bg-[#0E1E38]"
            style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0% 100%)' }}
          >
            <div 
              className="w-full h-full bg-[#050B17] opacity-40"
              style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 25% 100%)' }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};