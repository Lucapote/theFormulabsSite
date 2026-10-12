import { Search, X, RefreshCw, Filter, Mail } from "lucide-react";

const ROUTE_PILLS = [
  { id: "all", label: "Todos los servicios" },
  { id: "A", label: "Gestión Integral" },
  { id: "B", label: "Proyecto Puntual" },
  { id: "C", label: "Mentoría Clínica" },
  { id: "web", label: "Sitio Web" }
];

export default function LeadFilterBar({
  search,
  onSearchChange,
  filterRoute,
  onFilterRouteChange,
  onRefresh,
  loading = false,
  onTestEmail,
  isTestingEmail = false
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, Instagram o WhatsApp..."
            className="w-full h-10 pl-10 pr-9 rounded-full bg-gray-50 border border-gray-200/80 text-xs font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Test Resend Email Notification */}
          {onTestEmail && (
            <button
              type="button"
              onClick={onTestEmail}
              disabled={isTestingEmail}
              className="h-10 px-3.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
              title="Enviar alerta de prueba con Resend a theformulab.io@gmail.com"
            >
              <Mail className={`w-3.5 h-3.5 text-brand-magenta ${isTestingEmail ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isTestingEmail ? "Probando..." : "Probar Resend"}</span>
            </button>
          )}

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="h-10 px-4 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-blue ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Route Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filtro:
        </span>
        {ROUTE_PILLS.map((pill) => {
          const isActive = filterRoute === pill.id;

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onFilterRouteChange(pill.id)}
              className={`h-7 px-3 rounded-full text-[11px] font-sora font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
