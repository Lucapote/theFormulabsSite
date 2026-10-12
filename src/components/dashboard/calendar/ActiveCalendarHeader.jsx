import { ArrowLeft, Check, Copy, ExternalLink, Calendar as CalendarIcon, Film, Download } from "lucide-react";
import { formatCalendarUrlPath } from "@/services/calendarService";

/**
 * ActiveCalendarHeader
 * Navigation bar and view switcher header rendered when a calendar is currently active.
 */
export default function ActiveCalendarHeader({
  activeCalendar,
  selectedCliente,
  calendarSubTab = "posts",
  copiedSlug = null,
  onBack,
  onCopyCalendarLink,
  onSetSubTab,
  onToggleDownloadPermission = null
}) {
  if (!activeCalendar) return null;

  const targetCliente = selectedCliente || activeCalendar.cliente;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0"
          title="Volver al listado de calendarios"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 uppercase tracking-widest px-3 py-0.5 rounded-full">
              CALENDARIO ACTIVO
            </span>
            {targetCliente && (
              <button
                type="button"
                onClick={() => onToggleDownloadPermission?.(targetCliente)}
                title="Haga clic para alternar los permisos de descarga del cliente"
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sora font-bold transition-all cursor-pointer border ${
                  targetCliente.permite_descarga
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs"
                    : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Download className="w-3 h-3" />
                <span>
                  {targetCliente.permite_descarga
                    ? "Descargas activadas"
                    : "Descargas inactivas"}
                </span>
              </button>
            )}
          </div>
          <h2 className="text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
            {activeCalendar.nombre}
          </h2>
        </div>
      </div>

      {/* Sub Tab Switcher Pills & Share Link */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={() => onCopyCalendarLink(activeCalendar.slug)}
          className="h-9 sm:h-10 px-3 sm:px-4 bg-pink-50 hover:bg-pink-100 text-pink-600 font-sora font-bold text-xs rounded-full border border-pink-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          {copiedSlug === activeCalendar.slug ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" /> <span className="hidden sm:inline">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-pink-500" /> <span className="hidden sm:inline">Copiar Enlace</span><span className="sm:hidden">Enlace</span>
            </>
          )}
        </button>

        <a
          href={formatCalendarUrlPath(activeCalendar.slug, selectedCliente?.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 sm:h-10 px-3 sm:px-3.5 bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs rounded-full border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Abrir vista pública del cliente"
        >
          <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ver Vista Pública</span><span className="sm:hidden">Ver</span>
        </a>

        <button
          type="button"
          onClick={() => onSetSubTab("posts")}
          className={`py-2.5 px-5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            calendarSubTab === "posts"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-pink-400" />
          Calendario
        </button>

        <button
          type="button"
          onClick={() => onSetSubTab("gallery")}
          className={`py-2.5 px-5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            calendarSubTab === "gallery"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Film className="w-4 h-4 text-brand-blue" />
          Galeria
        </button>
      </div>
    </div>
  );
}
