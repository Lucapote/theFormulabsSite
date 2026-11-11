import {
  Film,
  Clapperboard,
  CheckCircle2,
  Clock,
  CalendarRange,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function HomeDayMetrics({
  metrics,
  weekData,
  isWeekOpen,
  onToggleWeek
}) {
  const {
    totalPosts = 0,
    totalProductions = 0,
    publishedPosts = 0,
    pendingPosts = 0
  } = metrics || {};

  const {
    totalWeekPosts = 0,
    totalWeekProductions = 0,
    totalWeekActivities = 0
  } = weekData || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 font-inter">
      {/* Metric 1: Publicaciones del Día */}
      <div className="bg-white rounded-[1.8rem] p-5 border border-gray-100 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-sora font-extrabold tracking-widest uppercase text-gray-400 block">
            PUBLICACIONES DE HOY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sora font-black text-gray-900 tracking-tight">
              {totalPosts}
            </span>
            <span className="text-xs font-sora font-medium text-gray-500">
              {totalPosts === 1 ? "publicación" : "publicaciones"}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-gray-500">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {publishedPosts} listas
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              <Clock className="w-3 h-3" /> {pendingPosts} en proceso
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-brand-magenta shrink-0">
          <Film className="w-6 h-6" />
        </div>
      </div>

      {/* Metric 2: Rodajes y Producciones */}
      <div className="bg-white rounded-[1.8rem] p-5 border border-gray-100 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-sora font-extrabold tracking-widest uppercase text-gray-400 block">
            RODAJES Y PRODUCCIÓN
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sora font-black text-gray-900 tracking-tight">
              {totalProductions}
            </span>
            <span className="text-xs font-sora font-medium text-gray-500">
              {totalProductions === 1 ? "sesión agendada" : "sesiones agendadas"}
            </span>
          </div>
          <p className="text-[11px] font-medium text-gray-500 pt-1">
            {totalProductions > 0
              ? "Sesiones en set o locación para esta fecha"
              : "Sin llamados a rodaje para este día"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue shrink-0">
          <Clapperboard className="w-6 h-6" />
        </div>
      </div>

      {/* Metric 3: EN ESTA SEMANA (Interactiva) */}
      <div
        onClick={onToggleWeek}
        className={`bg-white rounded-[1.8rem] p-5 border shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group ${
          isWeekOpen
            ? "border-purple-300 ring-2 ring-purple-100 bg-gradient-to-br from-purple-50/20 via-white to-white"
            : "border-gray-100 hover:border-purple-200"
        }`}
        title="Haz clic para ver o contraer el desglose de los 7 días de la semana"
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sora font-extrabold tracking-widest uppercase text-purple-600 block">
              EN ESTA SEMANA
            </span>
            <span className="text-[9px] font-sora font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.2 rounded-md">
              7 Días
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sora font-black text-gray-900 tracking-tight">
              {totalWeekActivities}
            </span>
            <span className="text-xs font-sora font-medium text-gray-500">
              {totalWeekActivities === 1 ? "actividad" : "actividades"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-gray-500">
            <span>{totalWeekPosts} posts</span>
            <span>•</span>
            <span>{totalWeekProductions} rodajes</span>
            <span className="text-purple-600 font-bold ml-1 inline-flex items-center gap-0.5 group-hover:underline">
              {isWeekOpen ? "Ocultar" : "Ver días"}
              {isWeekOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
          <CalendarRange className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
