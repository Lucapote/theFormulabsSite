import { Calendar as CalendarIcon, Check, RefreshCw, X } from "lucide-react";
import { generateSlug, formatCalendarUrlPath } from "@/services/calendarService";
import CalendarDraftsConfigSection from "./CalendarDraftsConfigSection";

/**
 * CreateCalendarModal
 * Modal dialog for generating a new content calendar for a selected client.
 */
export default function CreateCalendarModal({
  isOpen = false,
  onClose,
  selectedCliente = null,
  calendarForm,
  setCalendarForm,
  onSubmit,
  isSaving = false,
  onNameChange,
  toggleTipoContenido,
  togglePlataforma,
  monthNames = [],
  tipoOptions = [],
  plataformaOptions = []
}) {
  if (!isOpen || !selectedCliente) return null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-x-hidden">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-w-[calc(100vw-1.5rem)] mx-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
              <CalendarIcon className="w-5 h-5 text-[#188ff0]" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-gray-900 text-lg md:text-xl tracking-tight leading-tight">
                Nuevo Calendario
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Cliente: <strong className="text-gray-900 font-bold">{selectedCliente.nombre}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="calendar-form" onSubmit={onSubmit} className="p-6 md:p-8 space-y-5 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Nombre del Calendario *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Campaña Noviembre 2026"
              value={calendarForm.nombre}
              onChange={onNameChange}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Mes
              </label>
              <select
                value={calendarForm.mes}
                onChange={(e) => setCalendarForm({ ...calendarForm, mes: Number(e.target.value) })}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium bg-white transition-all cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Año
              </label>
              <select
                value={calendarForm.anio}
                onChange={(e) => setCalendarForm({ ...calendarForm, anio: Number(e.target.value) })}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium bg-white transition-all cursor-pointer"
              >
                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TIPO DE CONTENIDO (CHECK OPTIONS) */}
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Tipo de Contenido *
            </label>
            <div className="flex flex-wrap gap-2">
              {tipoOptions.map((tipo) => {
                const isChecked = (calendarForm.tiposSeleccionados || []).includes(tipo);
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => toggleTipoContenido(tipo)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isChecked
                        ? "bg-pink-50 border-pink-300 text-pink-600 shadow-2xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      isChecked ? "bg-pink-500 text-white" : "border border-gray-300 bg-white"
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <span>{tipo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PLATAFORMAS (CHECK OPTIONS) */}
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Plataformas *
            </label>
            <div className="flex flex-wrap gap-2">
              {plataformaOptions.map((plat) => {
                const isChecked = (calendarForm.plataformasSeleccionadas || []).includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlataforma(plat)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isChecked
                        ? "bg-blue-50 border-blue-300 text-brand-blue shadow-2xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      isChecked ? "bg-brand-blue text-white" : "border border-gray-300 bg-white"
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PUBLICACIONES INICIALES / CAJAS VACÍAS */}
          <CalendarDraftsConfigSection
            calendarForm={calendarForm}
            setCalendarForm={setCalendarForm}
          />

          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Slug Personalizado (URL pública)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400">
                /{selectedCliente ? generateSlug(selectedCliente.nombre) : "cliente"}/
              </span>
              <input
                type="text"
                required
                placeholder="octubre-2026"
                value={
                  calendarForm.slug.startsWith(generateSlug(selectedCliente?.nombre || "") + "-")
                    ? calendarForm.slug.replace(generateSlug(selectedCliente?.nombre || "") + "-", "")
                    : calendarForm.slug
                }
                onChange={(e) => {
                  const clientPrefix = selectedCliente?.nombre ? generateSlug(selectedCliente.nombre) : "";
                  const calSlug = generateSlug(e.target.value);
                  const combined = clientPrefix ? `${clientPrefix}-${calSlug}` : calSlug;
                  setCalendarForm({
                    ...calendarForm,
                    slug: combined,
                    isSlugModified: true
                  });
                }}
                className="w-full h-11 pl-32 pr-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono text-pink-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Enlace público de acceso: <code>theformulab.io{formatCalendarUrlPath(calendarForm.slug || "octubre-2026", selectedCliente?.nombre)}</code>
            </p>
          </div>
        </form>

        {/* Fixed Action Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 md:px-8 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="calendar-form"
            disabled={isSaving}
            className="h-11 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Creando...
              </>
            ) : (
              "Crear Calendario"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
