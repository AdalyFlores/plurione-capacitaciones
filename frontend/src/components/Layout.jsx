import React from 'react';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-200 flex items-center justify-center p-6">
      {/* Contenedor principal de la tarjeta */}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col min-h-[580px] relative border border-slate-100">
        
        {/* Cabecera superior azul con el recuadro blanco para el logo */}
        <div className="w-full bg-[#0B1A30] h-28 flex items-center px-8 z-20 relative">
          <div className="bg-white p-3 rounded-md shadow-md flex items-center justify-center min-w-[180px]">
            {/* Si tienes la imagen en assets, usa: <img src={logo} className="h-10 w-auto" /> */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-slate-800 text-lg">
                O
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-800 tracking-tight leading-none">pluriOne</span>
                <span className="text-[8px] text-slate-400 tracking-widest uppercase">financial services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo del formulario + Fondo diagonal derecho */}
        <div className="flex-1 flex relative">
          {/* Lado izquierdo: Contenido del formulario */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 z-10 flex flex-col justify-center bg-white">
            {children}
          </div>

          {/* Lado derecho: Fondo azul en diagonal que conecta perfectamente con la barra superior */}
          <div 
            className="hidden lg:block absolute -top-28 right-0 w-2/3 h-[calc(100%+7rem)] bg-[#0B1A30]"
            style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)' }}
          >
            <div 
              className="w-full h-full bg-[#000F26] opacity-40"
              style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 15% 100%)' }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};