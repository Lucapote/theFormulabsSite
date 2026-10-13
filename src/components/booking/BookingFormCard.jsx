import { useState } from "react";
import { Calendar, Clock, MapPin, FileText, Loader2, Check } from "lucide-react";

const SUGGESTED_SLOTS = [
  { label: "09:00 AM", value: "09:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "06:00 PM", value: "18:00" }
];

export default function BookingFormCard({
  initialData = {},
  onSubmit,
  isSubmitting = false
}) {
  const [fecha, setFecha] = useState(() => {
    if (initialData.fecha_produccion) {
      const d = new Date(initialData.fecha_produccion);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    return "";
  });

  const [hora, setHora] = useState(() => {
    if (initialData.fecha_produccion) {
      const d = new Date(initialData.fecha_produccion);
      if (!isNaN(d.getTime())) return d.toTimeString().slice(0, 5);
    }
    return "10:00";
  });

  const [locacion, setLocacion] = useState(initialData.locacion || "");
  const [notasBrief, setNotasBrief] = useState(initialData.notas_brief || "");
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fecha) {
      setErrorMsg("Por favor, selecciona una fecha para el rodaje.");
      return;
    }
    if (!hora) {
      setErrorMsg("Por favor, selecciona una hora para la sesión.");
      return;
    }
    if (!locacion.trim()) {
      setErrorMsg("Por favor, ingresa la dirección o locación de la grabación.");
      return;
    }

    const isoDateTime = new Date(`${fecha}T${hora}:00`).toISOString();
    onSubmit({
      fecha_produccion: isoDateTime,
      locacion: locacion.trim(),
      notas_brief: notasBrief.trim()
    });
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-inter text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* 1. Fecha del Rodaje */}
        <div>
          <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-blue" />
            <span>Fecha del Rodaje</span>
            <span className="text-brand-magenta">*</span>
          </label>
          <input
            type="date"
            min={today}
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full text-base sm:text-sm font-mono bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
        </div>

        {/* 2. Horario / Turno */}
        <div>
          <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            <span>Horario Sugerido de Inicio</span>
            <span className="text-brand-magenta">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
            {SUGGESTED_SLOTS.map((slot) => {
              const isSelected = hora === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setHora(slot.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
          <input
            type="time"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full text-base sm:text-sm font-mono bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
        </div>

        {/* 3. Locación */}
        <div>
          <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Locación / Dirección</span>
            <span className="text-brand-magenta">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej. En nuestro local (Av. Bonampak 123) / Estudio The Formulab"
            value={locacion}
            onChange={(e) => setLocacion(e.target.value)}
            className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
        </div>

        {/* 4. Notas y Brief */}
        <div>
          <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>Notas o Requerimientos de Grabación</span>
          </label>
          <textarea
            rows={3}
            placeholder="Prendas a utilizar, platos o productos listos, personal disponible para hablar en cámara, ideas clave..."
            value={notasBrief}
            onChange={(e) => setNotasBrief(e.target.value)}
            className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Botón CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirmando Reserva...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar Fecha de Grabación</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
