import { FileText, Users, Clapperboard, BarChart2 } from "lucide-react";

/**
 * DashboardTabs
 * Segmented pill navigation bar for switching between dashboard views.
 */
export default function DashboardTabs({
  activeTab,
  onSelectTab,
  totalPropuestasReales = 0,
  diagnosticsCount = 0,
  leadsPendientesCount = 0
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
      <button
        type="button"
        onClick={() => onSelectTab("proposals")}
        className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-2 ${
          activeTab === "proposals"
            ? "bg-gray-900 text-white shadow-md"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
        }`}
      >
        <FileText className="w-4 h-4 text-pink-400" />
        Propuestas ({totalPropuestasReales})
      </button>

      <button
        type="button"
        onClick={() => onSelectTab("calendars")}
        className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-2 ${
          activeTab === "calendars"
            ? "bg-gray-900 text-white shadow-md"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
        }`}
      >
        <Users className="w-4 h-4 text-pink-500" />
        Calendarios
      </button>

      <button
        type="button"
        onClick={() => onSelectTab("operaciones")}
        className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-2 ${
          activeTab === "operaciones"
            ? "bg-gray-900 text-white shadow-md"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
        }`}
      >
        <Clapperboard className="w-4 h-4 text-brand-blue" />
        Operaciones
      </button>

      <button
        type="button"
        onClick={() => onSelectTab("diagnostics")}
        className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
          activeTab === "diagnostics"
            ? "bg-gray-900 text-white shadow-md"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
        }`}
      >
        <BarChart2 className="w-4 h-4 text-brand-blue" />
        <span>Diagnósticos</span>
        <span className={activeTab === "diagnostics" ? "text-gray-300 font-normal" : "text-gray-400 font-normal"}>
          ({diagnosticsCount})
        </span>
        {leadsPendientesCount > 0 && (
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#188ff0] text-white rounded-full">
            {leadsPendientesCount}
          </span>
        )}
      </button>
    </div>
  );
}

