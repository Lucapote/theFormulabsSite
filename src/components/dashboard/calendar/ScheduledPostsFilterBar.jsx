import {
  Film,
  Plus,
  FileText,
  ListFilter,
  LayoutGrid,
  RefreshCw
} from "lucide-react";

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-gray-100 max-w-full overflow-hidden">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 text-xs font-sora font-bold max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
            <span className="hidden sm:inline-block text-gray-400 pl-2 text-[10px] uppercase tracking-wider font-extrabold shrink-0">
              Estado:
            </span>
            <button
              type="button"
              onClick={() => setEstadoFilter("all")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                estadoFilter === "all"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setEstadoFilter("borrador")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                estadoFilter === "borrador"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Borradores
            </button>
            <button
              type="button"
              onClick={() => setEstadoFilter("programado")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                estadoFilter === "programado"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Programados
            </button>
            <button
              type="button"
              onClick={() => setEstadoFilter("publicado")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                estadoFilter === "publicado"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Publicados
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 text-xs font-sora font-bold max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
            <span className="hidden sm:inline-block text-gray-400 pl-2 text-[10px] uppercase tracking-wider font-extrabold shrink-0">
              Formato:
            </span>
            <button
              type="button"
              onClick={() => setFormatoFilter("all")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                formatoFilter === "all"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFormatoFilter("reel")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                formatoFilter === "reel"
                  ? "bg-pink-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Reels
            </button>
            <button
              type="button"
              onClick={() => setFormatoFilter("carrousel")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                formatoFilter === "carrousel"
                  ? "bg-[#188ff0] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Carruseles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
