import { Film } from "lucide-react";

/**
 * CalendarDraftsConfigSection
 * Form section inside CreateCalendarModal for specifying initial empty draft box quantities.
 */
export default function CalendarDraftsConfigSection({
  calendarForm,
  setCalendarForm
}) {
  return (
    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3 font-inter">
      <div className="flex items-center gap-2 text-gray-900 font-sora font-bold text-xs">
        <Film className="w-4 h-4 text-brand-blue" />
        <span>Borradores Iniciales</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-snug">
        Define cuántos borradores quieres generar automáticamente para este mes (listas para subir medios y escribir copy):
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-sora font-bold text-gray-700 mb-1">
            Cantidad de Reels:
          </label>
          <input
            type="number"
            min="0"
            max="30"
            placeholder="0"
            value={calendarForm.cantReels}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value;
              setCalendarForm({
                ...calendarForm,
                cantReels: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
              });
            }}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-blue outline-none text-xs font-sora font-bold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-sora font-bold text-gray-700 mb-1">
            Cantidad de Carruseles:
          </label>
          <input
            type="number"
            min="0"
            max="30"
            placeholder="0"
            value={calendarForm.cantCarruseles}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value;
              setCalendarForm({
                ...calendarForm,
                cantCarruseles: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
              });
            }}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-blue outline-none text-xs font-sora font-bold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
