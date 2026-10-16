import { useState } from "react";
import { Users, Target, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadMetricsHeader({ stats, loading = false }) {
  const [hoveredCard, setHoveredCard] = useState(null); // 'service' | 'pipeline' | null

  const {
    totalLeads = 0,
    topRoute = "—",
    topRouteCount = 0,
    routesDistribution = {
      gestion: { count: 0, percent: 0 },
      proyecto: { count: 0, percent: 0 },
      mentoria: { count: 0, percent: 0 }
    }
  } = stats || {};

  // Control de hover solo en dispositivos con cursor físico para evitar trabas en mobile
  const handleMouseEnter = (card) => {
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
      return;
    }
    setHoveredCard(card);
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
      return;
    }
    setHoveredCard(null);
  };

  // Toggle en pantallas táctiles / mobile
  const handleCardClick = (card) => {
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
      setHoveredCard((prev) => (prev === card ? null : card));
    }
  };

  const isServiceCardFlipped = hoveredCard === "pipeline";
  const isPipelineCardFlipped = hoveredCard === "service";

  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full items-stretch relative isolate">
      {/* 1. Total Diagnósticos */}
      <div
        className={`transition-all duration-500 ease-in-out bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 shadow-md hover:shadow-xl flex flex-col justify-between h-[168px] w-full ${
          isServiceCardFlipped ? "md:w-[22%]" : isPipelineCardFlipped ? "md:w-[26%]" : "md:w-[28%]"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sora font-bold tracking-wider text-gray-400 uppercase">
                TOTAL DIAGNÓSTICOS
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En Vivo
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 bg-blue-50 border-blue-100 text-brand-blue">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-sora text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
                {totalLeads}
              </div>
              <p className="text-xs font-semibold text-gray-700 truncate font-inter">
                Formularios completados
              </p>
            </div>
          )}
        </div>

        {!loading && (
          <div className="pt-2 mt-2 border-t border-gray-100/80">
            <span className="text-[10px] font-sora font-medium text-gray-400 block truncate">
              100% capturados en BD
            </span>
          </div>
        )}
      </div>

      {/* 2. Servicio Predominante (se expande y gira al interactuar) */}
      <div
        onMouseEnter={() => handleMouseEnter("service")}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleCardClick("service")}
        className={`transition-all duration-500 ease-in-out h-[168px] [perspective:1000px] cursor-pointer w-full rounded-[1.5rem] sm:rounded-[2rem] ${
          isServiceCardFlipped ? "md:w-[58%]" : isPipelineCardFlipped ? "md:w-[32%]" : "md:w-[36%]"
        }`}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isServiceCardFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Frente: Servicio Predominante */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-sora font-bold tracking-wider text-gray-400 uppercase">
                  SERVICIO PREDOMINANTE
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 bg-pink-50 border-pink-100 text-brand-magenta">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {loading ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-28 rounded-full" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-sora text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
                    {topRoute || "—"}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 truncate font-inter">
                    {totalLeads > 0
                      ? `${topRouteCount} de ${totalLeads} solicitudes (${Math.round((topRouteCount / totalLeads) * 100)}%)`
                      : "Sin solicitudes registradas"}
                  </p>
                </div>
              )}
            </div>

            {!loading && (
              <div className="pt-2 mt-2 border-t border-gray-100/80 flex items-center justify-between text-[10px] font-sora">
                <span className="text-gray-400 hover:text-brand-magenta transition-colors flex items-center gap-1">
                  <span className="hidden md:inline">Hover: Ver Guía de Precios</span>
                  <span className="md:hidden">Ver Guía de Precios</span>
                </span>
                <span className="text-brand-magenta font-bold">Guía Comercial ➔</span>
              </div>
            )}
          </div>

          {/* Dorso: Guía de Servicios y Precios Recomendados */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-950 text-white border border-gray-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-3.5 flex flex-col justify-between shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-1">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-brand-magenta shrink-0" />
                <span className="text-[10px] font-sora font-bold tracking-wider text-gray-200 uppercase truncate">
                  SERVICIOS Y PRECIOS RECOMENDADOS
                </span>
              </div>
              <span className="text-[10px] font-sora text-brand-magenta font-bold hidden sm:inline shrink-0">
                Guía de Venta
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 my-0.5">
              {/* Gestión Integral */}
              <div className="bg-gray-900/90 border border-emerald-900/50 rounded-xl p-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sora text-[10px] font-bold text-emerald-400">Gestión</span>
                    <span className="text-[8px] font-sora text-emerald-400/80 font-bold">Retainer</span>
                  </div>
                  <p className="text-[9px] text-gray-300 leading-tight font-inter line-clamp-2">
                    Marketing y contenido total.
                  </p>
                </div>
                <div className="mt-1 pt-0.5 border-t border-gray-800 text-[9px] font-sora font-bold text-emerald-300">
                  $7k – $18k<span className="text-[8px] font-normal text-gray-400 block font-inter">/ mes</span>
                </div>
              </div>

              {/* Proyecto Puntual */}
              <div className="bg-gray-900/90 border border-blue-900/50 rounded-xl p-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sora text-[10px] font-bold text-blue-400">Proyecto</span>
                    <span className="text-[8px] font-sora text-blue-400/80 font-bold">Único</span>
                  </div>
                  <p className="text-[9px] text-gray-300 leading-tight font-inter line-clamp-2">
                    Sitio web, funnel o reels.
                  </p>
                </div>
                <div className="mt-1 pt-0.5 border-t border-gray-800 text-[9px] font-sora font-bold text-blue-300">
                  $6k – $20k<span className="text-[8px] font-normal text-gray-400 block font-inter">por entrega</span>
                </div>
              </div>

              {/* Mentoría Clínica */}
              <div className="bg-gray-900/90 border border-pink-900/50 rounded-xl p-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sora text-[10px] font-bold text-pink-400">Mentoría</span>
                    <span className="text-[8px] font-sora text-pink-400/80 font-bold">1 a 1</span>
                  </div>
                  <p className="text-[9px] text-gray-300 leading-tight font-inter line-clamp-2">
                    Asesoría paso a paso.
                  </p>
                </div>
                <div className="mt-1 pt-0.5 border-t border-gray-800 text-[9px] font-sora font-bold text-pink-300">
                  $650 – $5k<span className="text-[8px] font-normal text-gray-400 block font-inter">sesión/paquete</span>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-gray-800/80 text-[10px] font-sora text-gray-400 flex items-center justify-between">
              <span>↺ Catálogo oficial</span>
              <span className="text-gray-500 font-inter">The Formulab Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Distribución de Servicios */}
      <div
        onMouseEnter={() => handleMouseEnter("pipeline")}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleCardClick("pipeline")}
        className={`transition-all duration-500 ease-in-out h-[168px] [perspective:1000px] cursor-pointer w-full rounded-[1.5rem] sm:rounded-[2rem] ${
          isServiceCardFlipped ? "md:w-[20%]" : isPipelineCardFlipped ? "md:w-[42%]" : "md:w-[36%]"
        }`}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isPipelineCardFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Frente: Desglose por Servicio */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-sora font-bold tracking-wider text-gray-400 uppercase">
                  DISTRIBUCIÓN DE SERVICIOS
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 bg-indigo-50 border-indigo-100 text-indigo-600">
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {loading ? (
                <div className="space-y-1.5 py-1">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ) : (
                <div className="space-y-1 text-[11px] font-inter">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Mentoría Clínica:</span>
                    <strong className="text-pink-600 font-sora font-bold">
                      {routesDistribution.mentoria?.count || 0} ({routesDistribution.mentoria?.percent || 0}%)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Proyecto Puntual:</span>
                    <strong className="text-blue-600 font-sora font-bold">
                      {routesDistribution.proyecto?.count || 0} ({routesDistribution.proyecto?.percent || 0}%)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Gestión Integral:</span>
                    <strong className="text-emerald-600 font-sora font-bold">
                      {routesDistribution.gestion?.count || 0} ({routesDistribution.gestion?.percent || 0}%)
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {!loading && (
              <div className="pt-2 mt-2 border-t border-gray-100/80 flex items-center justify-between text-[10px] font-sora">
                <span className="text-gray-400 hover:text-brand-blue transition-colors flex items-center gap-1">
                  <span className="hidden md:inline">Hover: Ver Perfil de Cliente</span>
                  <span className="md:hidden">Ver Perfil de Cliente</span>
                </span>
                <span className="text-brand-blue font-bold">Perfiles ➔</span>
              </div>
            )}
          </div>

          {/* Dorso: Perfil del Cliente por Servicio */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-950 text-white border border-gray-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-3.5 flex flex-col justify-between shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-1">
              <span className="text-[10px] font-sora font-bold tracking-wider text-gray-400 uppercase">
                PERFIL DEL CLIENTE POR SERVICIO
              </span>
              <span className="text-[10px] font-sora text-brand-blue font-bold">Criterio</span>
            </div>

            <div className="space-y-1 my-0.5 text-[10px] font-inter">
              <div className="bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800/60 flex items-center justify-between">
                <span className="font-sora text-emerald-400 font-bold text-[10px]">Gestión:</span>
                <span className="text-gray-300 truncate max-w-[190px]">Equipo establecido, delegación total</span>
              </div>
              <div className="bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800/60 flex items-center justify-between">
                <span className="font-sora text-blue-400 font-bold text-[10px]">Proyecto:</span>
                <span className="text-gray-300 truncate max-w-[190px]">Necesita solución o activo concreto</span>
              </div>
              <div className="bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800/60 flex items-center justify-between">
                <span className="font-sora text-pink-400 font-bold text-[10px]">Mentoría:</span>
                <span className="text-gray-300 truncate max-w-[190px]">Emprendedor solo, busca aprender</span>
              </div>
            </div>

            <div className="pt-1 border-t border-gray-800/80 text-[10px] font-sora text-gray-400 flex items-center justify-between">
              <span>Total: {totalLeads} prospectos</span>
              <span className="text-brand-magenta font-bold">100% analizados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
