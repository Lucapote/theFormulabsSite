import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, FileText, Loader2, Check, Video, Info } from "lucide-react";
import {
  RECORDING_SHIFTS,
  getRecordingShifts,
  formatHour12,
  getSessionTypeInfo,
  getMinBusinessBookingDate,
  formatLocalDateToYMD
} from "@/utils/bookingHelpers";
import ProductionSlaWarningDialog from "./ProductionSlaWarningDialog";

export default function BookingFormCard({
  initialData = {},
  cliente = null,
  onSubmit,
  isSubmitting = false,
  tipo = "organica",
  duracionHoras = null
}) {
  const minDateStr = useMemo(() => formatLocalDateToYMD(getMinBusinessBookingDate(new Date(), 3)), []);
  const [showSlaDialog, setShowSlaDialog] = useState(false);

  const typeInfo = useMemo(() => getSessionTypeInfo(tipo, duracionHoras), [tipo, duracionHoras]);
  const sessionHours = typeInfo.hours;
  const isProfesional = typeInfo.isProfesional;

  const shifts = useMemo(() => {
    const list = getRecordingShifts(sessionHours);
    const initialHour = initialData.fecha_produccion
      ? new Date(initialData.fecha_produccion).toTimeString().slice(0, 5)
      : null;
    if (initialHour && !list.some((s) => s.value === initialHour)) {
      const hNum = parseInt(initialHour.split(":")[0], 10);
      if (!isNaN(hNum)) {
        const endH = hNum + sessionHours;
        const customShift = {
          value: initialHour,
          label: `${formatHour12(hNum)} - ${formatHour12(endH)}`,
          startHour: hNum,
          endHour: endH
        };
        return [...list, customShift].sort((a, b) => a.value.localeCompare(b.value));
      }
    }
    return list;
  }, [sessionHours, initialData.fecha_produccion]);

  const [fecha, setFecha] = useState(() => {
    const d = initialData.fecha_produccion ? new Date(initialData.fecha_produccion) : null;
    return d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
  });

  const [hora, setHora] = useState(() => {
    const d = initialData.fecha_produccion ? new Date(initialData.fecha_produccion) : null;
    const h = d && !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : "";
    const list = getRecordingShifts(duracionHoras || (tipo === "profesional" ? 6 : 4));
    return list.some((s) => s.value === h) ? h : (h || "09:00");
  });

  const [locacion, setLocacion] = useState(
    () =>
      initialData.locacion ||
      cliente?.locacion_default ||
      initialData?.cliente?.locacion_default ||
      "En las instalaciones del cliente"
  );
  const [notasBrief, setNotasBrief] = useState(initialData.notas_brief || "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return setFecha("");

    const [y, m, d] = val.split("-").map(Number);
    const selectedDate = new Date(y, m - 1, d, 12, 0, 0);
    const day = selectedDate.getDay();

    // 1. Restricción de fin de semana (Lunes a Viernes)
    if (day === 0 || day === 6) {
      setFecha("");
      toast.error("Las grabaciones se realizan únicamente de Lunes a Viernes.");
      return;
    }

    // 2. Restricción de ventana de anticipación (3 días hábiles)
    if (val < minDateStr) {
      setFecha("");
      toast.error("Las reservas deben realizarse con al menos 3 días hábiles de anticipación.");
      return;
    }

    setFecha(val);
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fecha) return setErrorMsg("Por favor, selecciona una fecha hábil para el rodaje.");
    if (!hora) return setErrorMsg("Por favor, selecciona un turno para la sesión.");
    if (!locacion.trim()) return setErrorMsg("Por favor, ingresa la dirección o locación de la grabación.");

    setShowSlaDialog(true);
  };

  const handleConfirmSla = () => {
    setShowSlaDialog(false);
    onSubmit({
      fecha_produccion: new Date(`${fecha}T${hora}:00`).toISOString(),
      locacion: locacion.trim(),
      notas_brief: notasBrief.trim()
    });
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-xl mx-auto font-inter">
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
            {typeInfo.title} ({typeInfo.hours} horas)
          </span>
        </div>

        {/* 1. Fecha y Turno de Grabación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>Fecha del Rodaje</span>
              <span className="text-pink-500">*</span>
            </label>
            <input
              type="date"
              min={minDateStr}
              required
              value={fecha}
              onChange={handleDateChange}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
            />
            <p className="text-[11px] text-gray-400 font-inter mt-1.5">
              Lun a Vie con mín. 3 días hábiles de anticipación.
            </p>
          </div>

          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>Turno de Grabación</span>
              <span className="text-pink-500">*</span>
            </label>
            <select
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer font-medium"
            >
              {shifts.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Locación */}
        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
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
          <p className="text-[11px] text-gray-500 font-inter mt-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span>Sujeto a disponibilidad del espacio en el local de la marca.</span>
          </p>
        </div>

        {/* 3. Notas y Brief */}
        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
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

        {/* Modal Clínico de Políticas SLA y Términos Operativos */}
        <ProductionSlaWarningDialog
          isOpen={showSlaDialog}
          onConfirm={handleConfirmSla}
          onCancel={() => setShowSlaDialog(false)}
          tipoProduccion={tipo}
          fechaSeleccionada={fecha}
          isSubmitting={isSubmitting}
          duracionHoras={sessionHours}
        />
      </form>
    </div>
  );
}
