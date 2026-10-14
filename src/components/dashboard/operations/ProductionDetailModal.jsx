import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Check, MapPin, Calendar, Clock, FileText, Activity, ExternalLink, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateProduccion } from "@/services/operationsService";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";

const STATUS_CONFIG = {
  pendiente_agendamiento: { label: "Pendiente de agendamiento", color: "bg-amber-500" },
  agendada: { label: "Agendada (Fecha confirmada)", color: "bg-blue-500" },
  rodaje_completado: { label: "Rodaje completado", color: "bg-purple-500" },
  en_edicion: { label: "En edición / post-producción", color: "bg-pink-500" },
  finalizada: { label: "Finalizada y entregada", color: "bg-emerald-500" }
};

export default function ProductionDetailModal({
  isOpen, onClose, produccion, clienteNombre = "", ciclo = null, onUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", estado: "pendiente_agendamiento", fecha_produccion: "",
    duracion_horas: 4, locacion: "", notas_brief: ""
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
        duracion_horas: produccion.duracion_horas || (produccion.tipo === "profesional" ? 6 : 4),
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

  const handleOpenMaps = () => {
    const loc = formData.locacion.trim();
    if (!loc) return;
    const url = loc.startsWith("http://") || loc.startsWith("https://")
      ? loc
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      nombre: formData.nombre.trim() || defaultSuggestedName,
      estado: formData.estado,
      duracion_horas: Number(formData.duracion_horas) || 4,
      locacion: formData.locacion.trim(),
      notas_brief: formData.notas_brief.trim(),
      fecha_produccion: formData.fecha_produccion ? new Date(formData.fecha_produccion).toISOString() : null
    };
    const res = await updateProduccion(produccion.id, payload);
    setLoading(false);
    if (res.success) {
      toast.success("Sesión de producción actualizada");
      if (onUpdated) onUpdated(res.data);
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar la producción.");
    }
  };

  const displayName = formData.nombre.trim() || defaultSuggestedName;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full rounded-2xl bg-white border border-gray-100 shadow-2xl p-6 md:p-8 font-inter max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-gray-100 text-left space-y-1.5">
          <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-blue-50 text-[#188ff0] border border-blue-100 font-bold self-start inline-flex items-center gap-1.5">
            Sesión #{produccion.numero_sesion || 1} • {produccion.tipo?.toUpperCase() || "RODAJE"}
          </span>
          <DialogTitle className="font-sora text-xl font-bold text-gray-900 tracking-tight">
            {displayName}
          </DialogTitle>
          <p className="text-xs text-gray-500 font-medium">
            Cliente: <strong className="text-gray-900 font-bold">{clienteNombre || "Cliente"}</strong>
            {ciclo ? ` • Ciclo ${ciclo.mes}/${ciclo.anio}` : ""}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* BLOQUE A — Cronograma y Estado */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">A. Cronograma y Estado</span>

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">Nombre de la Sesión</label>
              <input type="text" placeholder={defaultSuggestedName} value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-magenta" /> Estado de la Producción
                </label>
                <span className="flex items-center gap-1.5 text-[11px] font-sora font-semibold text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[formData.estado]?.color || "bg-gray-400"}`} />
                  {STATUS_CONFIG[formData.estado]?.label.split(" ")[0]}
                </span>
              </div>
              <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0] cursor-pointer">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora
                </label>
                <input type="datetime-local" value={formData.fecha_produccion} onChange={(e) => setFormData({ ...formData, fecha_produccion: e.target.value })} className="w-full h-10 px-3 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
              </div>
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> Duración
                </label>
                <div className="relative">
                  <input type="number" min="1" max="24" value={formData.duracion_horas} onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })} className="w-full h-10 pl-3 pr-8 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 pointer-events-none">hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE B — Logística de Grabación */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">B. Logística de Grabación</span>
            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
              </label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Ej. Estudio The Formulab / Oficinas del cliente" value={formData.locacion} onChange={(e) => setFormData({ ...formData, locacion: e.target.value })} className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
                {formData.locacion.trim() && (
                  <button type="button" onClick={handleOpenMaps} title="Abrir en Google Maps" className="h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief y Notas de Rodaje
              </label>
              <textarea rows={3} placeholder="Objetivos de la sesión, equipo requerido, guiones a rodar..." value={formData.notas_brief} onChange={(e) => setFormData({ ...formData, notas_brief: e.target.value })} className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0] resize-none" />
            </div>
          </div>

          {/* BLOQUE C — Caja de Reserva Pública */}
          {reservationUrl && (
            <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-xl p-3.5 space-y-2">
              <span className="text-xs text-gray-500 font-medium block">Enlace público para que el cliente elija o confirme su fecha:</span>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={reservationUrl} className="w-full h-9 text-xs font-mono bg-white border border-gray-200 rounded-xl px-3 text-gray-700 select-all focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
                <button type="button" onClick={handleCopyLink} className="h-9 px-3.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-sora font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-[0.98]">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copied ? "Copiado" : "Copiar Link"}</span>
                </button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 flex-row items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-full text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 px-5 h-10 border border-transparent hover:bg-gray-100 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="rounded-full text-xs font-sora font-bold uppercase tracking-wider bg-[#188ff0] hover:bg-blue-600 text-white px-6 py-2.5 shadow-md shadow-blue-200 active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar Cambios"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
