import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Film, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TestTube from "@/components/common/TestTube";

const LAB_STAGES = [
  { pct: 35, text: "Sintetizando activos", color: "#ef18d6" },
  { pct: 50, text: "Calibrando iluminación en set", color: "#ef18d6" },
  { pct: 65, text: "Ajustando retención del algoritmo", color: "#188ff0" },
  { pct: 80, text: "Optimizando micro-formatos", color: "#188ff0" },
  { pct: 95, text: "Comprimiendo fórmula final", color: "#ef18d6" }
];

/**
 * Index (Página Principal)
 * Pantalla de preludio "En Preparación" (Coming Soon).
 * Viewport Lock (100dvh, cero scroll) con layout en 2 columnas:
 * Tubo de ensayo con mayor altura y ancho proporcional (height=390, width=135)
 * centrado en el medio de su columna (col-span-4), y narrativa en col-span-8.
 */
export default function Index() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LAB_STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const currentStage = LAB_STAGES[stageIndex];

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#f4f4f4] text-gray-900 flex flex-col justify-between relative overflow-hidden select-none selection:bg-[#ef18d6]/20 selection:text-[#ef18d6]">
      {/* Luz volumétrica ambiental de laboratorio en esquinas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#188ff0]/10 via-transparent to-transparent pointer-events-none" />

      {/* 1. Header Minimalista Compacto */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 sm:py-6 flex items-center justify-between shrink-0">
        <Link to="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <img src="/logo.png" alt="The Formulab" className="h-8 sm:h-9 w-auto object-contain" />
        </Link>

        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Cancún · Lab Activo
        </span>
      </header>

      {/* 2. Main Hero: Proporción 4:8 Equilibrada */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-2 min-h-0">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
          
          {/* Columna Izquierda (4 cols): Tubo más alto, proporcionalmente más ancho y CENTRADO en su espacio */}
          <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center">
            <div className="transition-transform duration-500 hover:scale-[1.03] drop-shadow-sm flex items-center justify-center">
              <TestTube
                fillPct={currentStage.pct}
                bubbling={true}
                color={currentStage.color}
                height={390}
                width={135}
                shakeKey={stageIndex}
              />
            </div>
          </div>

          {/* Columna Derecha (8 cols): Contenido alineado a la izquierda */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col items-start text-left space-y-4">
            {/* Badge Pill de Estado */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-mono font-bold uppercase tracking-wider text-brand-magenta shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-magenta animate-ping" />
              Fase de Síntesis · Fórmula 2026
            </div>

            {/* Titular Principal en Display Sora */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] font-sora font-black tracking-tight text-gray-900 leading-[1.08] max-w-2xl">
              Estamos calibrando una nueva <span className="text-brand-magenta">fórmula</span>.
            </h1>

            {/* Recuadro Dinámico de Progreso con Efecto Flip Text */}
            <div className="h-8 overflow-hidden relative flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageIndex}
                  initial={{ rotateX: -90, opacity: 0, y: 10 }}
                  animate={{ rotateX: 0, opacity: 1, y: 0 }}
                  exit={{ rotateX: 90, opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white border border-gray-200/90 shadow-2xs"
                >
                  <span
                    className="w-2 h-2 rounded-full transition-colors duration-500 shrink-0"
                    style={{ backgroundColor: currentStage.color }}
                  />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">
                    {currentStage.text}
                  </span>
                  <span className="text-[11px] font-mono font-extrabold text-brand-magenta bg-brand-magenta/10 px-1.5 py-0.5 rounded-md">
                    {currentStage.pct}%
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Subtítulo / Descripción de Laboratorio */}
            <p className="font-inter text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed pt-1">
              Rediseñando la plataforma de The Formulab para optimizar la creación, dirección y escalabilidad de contenido audiovisual vertical.
            </p>

            {/* CTAs Táctiles (Diagnóstico de Marca y Portafolio) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                to="/diagnostico"
                className="h-11 px-7 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Iniciar Diagnóstico de Marca</span>
              </Link>

              <Link
                to="/portafolio"
                className="h-11 px-6 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-sora font-bold uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Film className="w-4 h-4 text-brand-magenta" />
                <span>Ver Portafolio de Reels</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer de Laboratorio Compacto */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-inter text-gray-600 shrink-0">
        <p className="font-medium text-center sm:text-left">
          The Formulab · Laboratorio de Estrategia Audiovisual & Contenido Vertical
        </p>
        <span className="font-mono text-[11px] text-gray-600">
          Cancún, Q. Roo · © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
