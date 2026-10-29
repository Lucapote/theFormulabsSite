import {
  Film,
  Plus,
  FileText,
  ListFilter,
  LayoutGrid,
  RefreshCw,
  RotateCcw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";

const ESTADO_OPTIONS = [
  { value: "all", label: "Todos los estados", dotClass: "bg-gray-400" },
  { value: "sin_empezar", label: "Sin empezar", dotClass: "bg-rose-500" },
  { value: "en_edicion", label: "En edición", dotClass: "bg-amber-500" },
  { value: "en_aprobacion", label: "En aprobación", dotClass: "bg-purple-500" },
  { value: "aprobado", label: "Aprobado", dotClass: "bg-emerald-500" },
  { value: "programado", label: "Programado", dotClass: "bg-[#188ff0]" },
  { value: "error", label: "Con Error en Meta", dotClass: "bg-rose-700" },
  { value: "publicado", label: "Publicados", dotClass: "bg-pink-500" }
];

const FORMATO_OPTIONS = [
  { value: "all", label: "Todos los formatos" },
  { value: "reel", label: "Reels (1 Video)" },
  { value: "carrousel", label: "Carruseles (Múltiple)" }
];

/**
 * ScheduledPostsFilterBar
 * Toolbar & filter controls for ScheduledPostsList.
 */
export default function ScheduledPostsFilterBar({
  showOnlyDrafts,
  calendarioNombre,
  filteredPostsCount,
  estadoFilter,
  setEstadoFilter,
  formatoFilter,
  setFormatoFilter,
  viewMode,
  setViewMode,
  hideViewModeSwitcher,
  loading,
  onNewPostClick,
  onImportClick,
  onRefreshClick
}) {
  const currentEstado = ESTADO_OPTIONS.find((o) => o.value === estadoFilter) || ESTADO_OPTIONS[0];
  const currentFormato = FORMATO_OPTIONS.find((o) => o.value === formatoFilter) || FORMATO_OPTIONS[0];
  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-3 sm:space-y-4 font-inter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="hidden sm:inline-flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs mb-1 font-sora">
            <Film className="w-4 h-4 text-brand-blue" />
            <span>{showOnlyDrafts ? "CAJAS VACÍAS PENDIENTES" : "PUBLICACIONES Y CAJAS EDITORIALES"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
            {calendarioNombre} ({filteredPostsCount} {showOnlyDrafts ? "cajas" : "posts"})
          </h3>
          <p className="hidden sm:block text-xs text-gray-500 font-medium mt-0.5">
            {showOnlyDrafts
              ? "Asigna medios, fecha y copy a cada caja para programarla en el calendario."
              : "Gestiona publicaciones programadas, borradores y publicadas."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!showOnlyDrafts && estadoFilter !== "publicado" && (
            <button
              type="button"
              onClick={onNewPostClick}
              className="h-9 px-3.5 sm:px-4 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Crear o programar una nueva publicación"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Post</span>
            </button>
          )}

          <button
            type="button"
            onClick={onImportClick}
            className="h-9 px-3.5 sm:px-4 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            title="Importar publicaciones desde archivo Word (.docx)"
          >
            <FileText className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Importar Word (.docx)</span>
          </button>

          {!hideViewModeSwitcher && (
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Vista Lista de Posts"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Vista Cuadrícula Mensual"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onRefreshClick}
            className="h-9 w-9 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Recargar publicaciones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      {!showOnlyDrafts && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Estado Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50/90 py-1 px-2.5 rounded-full border border-gray-200">
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-extrabold font-sora shrink-0">
                Estado:
              </span>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="h-7 px-3 bg-white border border-gray-200 rounded-full text-xs font-sora font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-all flex items-center gap-2 min-w-[150px] cursor-pointer focus:ring-0 focus:ring-offset-0">
                  <div className="flex items-center gap-1.5 truncate">
                    {currentEstado?.dotClass && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${currentEstado.dotClass}`} />
                    )}
                    <span className="truncate">{currentEstado?.label || "Todos"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border border-gray-100 shadow-xl p-1 z-50 min-w-[190px]">
                  {ESTADO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs font-sora font-semibold cursor-pointer rounded-xl py-2 pl-8 pr-3 hover:bg-gray-50 focus:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Formato Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50/90 py-1 px-2.5 rounded-full border border-gray-200">
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-extrabold font-sora shrink-0">
                Formato:
              </span>
              <Select value={formatoFilter} onValueChange={setFormatoFilter}>
                <SelectTrigger className="h-7 px-3 bg-white border border-gray-200 rounded-full text-xs font-sora font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-all flex items-center gap-2 min-w-[130px] cursor-pointer focus:ring-0 focus:ring-offset-0">
                  <span className="truncate">{currentFormato?.label || "Todos"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border border-gray-100 shadow-xl p-1 z-50 min-w-[170px]">
                  {FORMATO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs font-sora font-semibold cursor-pointer rounded-xl py-2 pl-8 pr-3 hover:bg-gray-50 focus:bg-gray-100"
                    >
                      <span>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters button if active */}
            {(estadoFilter !== "all" || formatoFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setEstadoFilter("all");
                  setFormatoFilter("all");
                }}
                className="h-7 px-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 font-sora text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-[0.98]"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3 h-3 text-gray-500" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
