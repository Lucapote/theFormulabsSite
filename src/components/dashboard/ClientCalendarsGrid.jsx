import {
  Calendar as CalendarIcon,
  Building2,
  Mail,
  Plus,
  Sparkles,
  Users,
  Trash2,
  Copy,
  Check,
  Film,
  ExternalLink
} from "lucide-react";
import { formatCalendarUrlPath } from "@/services/calendarService";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

/**
 * ClientCalendarsGrid
 * Displays the selected client details header and grid of assigned content calendars.
 */
export default function ClientCalendarsGrid({
  selectedCliente = null,
  calendarios = [],
  loadingCalendarios = false,
  copiedSlug = null,
  onOpenCalendarModal,
  onDeleteCalendar,
  onCopyCalendarLink,
  onSelectActiveCalendar
}) {
  return (
    <div className="lg:col-span-8 bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 space-y-6">
      {selectedCliente ? (
        <>
          {/* Active Client Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 uppercase tracking-widest px-3 py-1 rounded-full mb-1">
                CLIENTE SELECCIONADO
              </span>
              <h3 className="text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
                {selectedCliente.nombre}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
                {selectedCliente.empresa && (
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-pink-400" />
                    {selectedCliente.empresa}
                  </span>
                )}
                {selectedCliente.email && (
                  <span className="flex items-center gap-1 font-mono text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-brand-blue" />
                    {selectedCliente.email}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCalendarModal}
              className="h-10 px-5 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-md shadow-pink-100 transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Crear Calendario
            </button>
          </div>

          {/* Calendars List / Table */}
          <div>
            <h4 className="font-sora font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brand-blue" />
              Calendarios Creados ({calendarios.length})
            </h4>

            {loadingCalendarios ? (
              <div className="p-12 text-center bg-gray-50 rounded-2xl">
                <Sparkles className="w-6 h-6 text-pink-500 animate-spin mx-auto mb-2" />
                <p className="text-xs font-sora font-bold text-gray-600">Cargando calendarios...</p>
              </div>
            ) : calendarios.length === 0 ? (
              <div className="p-10 text-center bg-gray-50 rounded-[1.5rem] border border-dashed border-gray-200">
                <CalendarIcon className="w-10 h-10 text-pink-300 mx-auto mb-3" />
                <h5 className="font-sora font-bold text-gray-900 text-base mb-1">
                  Sin calendarios asignados
                </h5>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                  Este cliente aún no tiene un calendario editorial creado. ¡Crea el primero ahora!
                </p>
                <button
                  type="button"
                  onClick={onOpenCalendarModal}
                  className="h-10 px-6 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Crear Primer Calendario
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calendarios.map((cal) => (
                  <div
                    key={cal.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-sora font-bold text-gray-900 text-base group-hover:text-pink-600 transition-colors">
                          {cal.nombre}
                        </h5>
                        <button
                          type="button"
                          onClick={(e) => onDeleteCalendar(cal.id, cal.nombre, e)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Eliminar calendario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-sora font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
                          {MONTH_NAMES[(cal.mes || 1) - 1]} {cal.anio}
                        </span>
                        <span className="inline-block font-mono text-[11px] font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full">
                          {formatCalendarUrlPath(cal.slug, selectedCliente?.nombre)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => onCopyCalendarLink(cal.slug)}
                        className="h-8 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-xs font-sora font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedSlug === cal.slug ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span>{copiedSlug === cal.slug ? "Copiado" : "Copiar"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectActiveCalendar(cal)}
                          className="h-8 px-3.5 bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="Gestionar galería de medios"
                        >
                          <Film className="w-3.5 h-3.5 shrink-0" />
                          <span>Posts</span>
                        </button>

                        <a
                          href={formatCalendarUrlPath(cal.slug, selectedCliente?.nombre)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-3 bg-blue-50 hover:bg-[#188ff0] text-[#188ff0] hover:text-white rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>Ver</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h4 className="font-sora font-bold text-gray-700 text-base mb-1">
            Selecciona un cliente
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Elige un cliente del directorio a la izquierda para administrar y crear sus calendarios de contenido.
          </p>
        </div>
      )}
    </div>
  );
}
