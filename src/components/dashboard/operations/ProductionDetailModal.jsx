import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Check, MapPin, Calendar, FileText, Activity, ExternalLink, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { updateProduccion } from "@/services/operationsService";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";

export default function ProductionDetailModal({
  isOpen,
  onClose,
  produccion,
  clienteNombre = "",
  ciclo = null,
  onUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    estado: "pendiente_agendamiento",
    fecha_produccion: "",
    locacion: "",
    notas_brief: ""
  });

  const totalSesiones = ciclo?.producciones?.length || 1;
  const defaultSuggestedName = produccion
    ? getSessionDisplayName(produccion, ciclo?.mes, totalSesiones)
    : "Sesión de Producción";

  useEffect(() => {
    if (produccion) {
      let formattedDate = "";
      if (produccion.fecha_produccion) {
        const d = new Date(produccion.fecha_produccion);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          formattedDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        }
      }

      setFormData({
        nombre: produccion.nombre || "",
        estado: produccion.estado || "pendiente_agendamiento",
        fecha_produccion: formattedDate,
        locacion: produccion.locacion || "",
        notas_brief: produccion.notas_brief || ""
      });
    }
  }, [produccion]);

  if (!produccion) return null;

  const reservationUrl = getBookingUrl(produccion.token_reserva);

  const handleCopyLink = () => {
    if (!reservationUrl) return;
    navigator.clipboard.writeText(reservationUrl);
    setCopied(true);
    toast.success("Enlace de reserva copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const resolvedNombre = formData.nombre.trim() || defaultSuggestedName;

    const payload = {
      nombre: resolvedNombre,
      estado: formData.estado,
      locacion: formData.locacion,
      notas_brief: formData.notas_brief,
      fecha_produccion: formData.fecha_produccion
        ? new Date(formData.fecha_produccion).toISOString()
        : null
    };

    const res = await updateProduccion(produccion.id, payload);
    setLoading(false);

    if (res.success) {
      toast.success("Producción actualizada con éxito.");
      if (onUpdated) onUpdated(res.data);
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar la producción.");
    }
  };

  const displayName = formData.nombre.trim() || defaultSuggestedName;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border-gray-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="font-sora text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue shrink-0" />
            <span className="truncate">{displayName} &mdash; {clienteNombre}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nombre de la Sesión */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-magenta" /> Nombre de la Sesión
            </label>
            <input
              type="text"
              value={formData.nombre}
              placeholder={defaultSuggestedName}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-[11px] font-inter text-gray-400 mt-1">
              Por defecto sugerido: <span className="font-medium text-gray-600">{defaultSuggestedName}</span>
            </p>
          </div>

          {/* Link de Reserva */}
          {reservationUrl && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
              <span className="text-[11px] font-sora font-semibold text-brand-blue uppercase tracking-wider block mb-1">
                Link de Agendamiento Directo (Cliente)
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={reservationUrl}
                  className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copiar enlace"
                  className="h-8 px-2.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-brand-blue text-xs font-sora font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
                <a
                  href={reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir enlace en nueva pestaña"
                  className="h-8 px-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-xs font-sora font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </a>
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-magenta" /> Estado de la Sesión
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="pendiente_agendamiento">Pendiente de agendamiento</option>
              <option value="agendada">Agendada (Fecha confirmada)</option>
              <option value="rodaje_completado">Rodaje completado</option>
              <option value="en_edicion">En post-producción / edición</option>
              <option value="finalizada">Finalizada y entregada</option>
            </select>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora de Rodaje
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_produccion}
              onChange={(e) => setFormData({ ...formData, fecha_produccion: e.target.value })}
              className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {/* Locación */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
            </label>
            <input
              type="text"
              placeholder="Ej. Estudio The Formulab / Oficinas del cliente"
              value={formData.locacion}
              onChange={(e) => setFormData({ ...formData, locacion: e.target.value })}
              className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {/* Brief y Notas */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief y Requerimientos de Rodaje
            </label>
            <textarea
              rows={3}
              placeholder="Objetivos de la sesión, equipo requerido, guiones a rodar..."
              value={formData.notas_brief}
              onChange={(e) => setFormData({ ...formData, notas_brief: e.target.value })}
              className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>

          <DialogFooter className="pt-2 sm:space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-4 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-sora font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-6 rounded-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
