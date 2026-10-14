import { useState } from "react";
import { Calendar, Clock, MapPin, FileText, Loader2, Check, Video } from "lucide-react";

export default function BookingFormCard({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  tipo = "organica",
  duracionHoras = null
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
  const isProfesional = tipo === "profesional" || duracionHoras === 6;

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

        {/* Banner de Tipo de Sesión y Horas de Cobertura */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-sora">
          <div className="flex items-center gap-2 text-brand-blue font-semibold">
            <Video className="w-4 h-4" />
            <span>Tipo de Sesión</span>
          </div>
          <span className="font-bold text-gray-900">
            {isProfesional ? "Profesional (6 horas)" : "Orgánica (4 horas total)"}
          </span>
        </div>

        {/* 1. Fecha y Hora lado a lado en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>Fecha del Rodaje</span>
              <span className="text-pink-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>Hora de Inicio</span>
              <span className="text-pink-500">*</span>
            </label>
            <input
              type="time"
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Locación */}
        <div>
          <label className="block text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Locación / Dirección</span>
            <span className="text-pink-500">*</span>
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

        {/* 3. Notas y Brief */}
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
