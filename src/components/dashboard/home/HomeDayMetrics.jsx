import { Film, Clapperboard, CheckCircle2, Clock, Users } from "lucide-react";

export default function HomeDayMetrics({ metrics, posts = [], productions = [] }) {
  const {
    totalPosts = 0,
    totalProductions = 0,
    publishedPosts = 0,
    pendingPosts = 0
  } = metrics || {};

  // Extract unique active clients for today
  const activeClientsSet = new Set();
  posts.forEach((p) => {
    const name = p.calendario?.cliente?.nombre || p.calendario?.nombre;
    if (name) activeClientsSet.add(name);
  });
  productions.forEach((pr) => {
    const name = pr.cliente?.nombre || pr.nombre_cliente;
    if (name) activeClientsSet.add(name);
  });
  const activeClientsCount = activeClientsSet.size;

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

      {/* Metric 3: Clientes con actividad */}
      <div className="bg-white rounded-[1.8rem] p-5 border border-gray-100 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-sora font-extrabold tracking-widest uppercase text-gray-400 block">
            CLIENTES CON ACTIVIDAD
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-sora font-black text-gray-900 tracking-tight">
              {activeClientsCount}
            </span>
            <span className="text-xs font-sora font-medium text-gray-500">
              {activeClientsCount === 1 ? "marca activa" : "marcas activas"}
            </span>
          </div>
          <p className="text-[11px] font-medium text-gray-500 pt-1 truncate max-w-[200px]" title={Array.from(activeClientsSet).join(", ")}>
            {activeClientsCount > 0 ? Array.from(activeClientsSet).join(", ") : "Día despejado de entregas"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
