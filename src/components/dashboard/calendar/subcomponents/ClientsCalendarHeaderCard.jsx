import { Users, RefreshCw, UserPlus, Calendar as CalendarIcon } from "lucide-react";

/**
 * ClientsCalendarHeaderCard
 * Cabecera institucional de la sección de Clientes y Calendarios con respuesta háptica
 * y tokens oficiales de Clinical High-Tech Lab (brand-magenta y brand-blue).
 */
export default function ClientsCalendarHeaderCard({
  isLoading,
  selectedCliente,
  onReload,
  onNewClient,
  onNewCalendar
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div className="inline-flex items-center gap-2 text-brand-magenta font-bold tracking-widest uppercase text-xs mb-2 font-sora">
          <Users className="w-4 h-4" />
          <span>FASE 2 • GESTIÓN DE CONTENIDOS</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 font-sora tracking-tight">
          Clientes y <span className="text-brand-blue">Calendarios</span>
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium font-inter">
          Organiza tus clientes y gestiona sus calendarios de contenido.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
        <button
          type="button"
          onClick={onReload}
          className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          title="Recargar clientes y calendarios"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-magenta" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={onNewClient}
          className="h-11 px-5 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 text-brand-magenta" />
          Nuevo Cliente
        </button>

        <button
          type="button"
          onClick={onNewCalendar}
          disabled={!selectedCliente}
          className="h-11 px-6 bg-brand-magenta hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <CalendarIcon className="w-4 h-4" />
          Nuevo Calendario
        </button>
      </div>
    </div>
  );
}

