import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserCheck, DollarSign, Calendar, MapPin, RefreshCw, Briefcase, GraduationCap, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { convertLeadToClient } from "@/services/leadService";

export default function LeadToClientModal({ isOpen, onClose, lead, onClientCreated }) {
  const [loading, setLoading] = useState(false);
  const [tipoServicio, setTipoServicio] = useState("mentoria");
  const [formData, setFormData] = useState({
    nombre: "", empresa: "", email: "", monto_retainer: "",
    esquema_pago: "mensual", dia_corte_pago: 1, dia_corte_pago_2: 15,
    producciones_por_mes: 0, tipo_sesion_default: "mentoria",
    locacion_default: "", permite_descarga: false
  });

  useEffect(() => {
    if (lead) {
      const suggestedPrice = lead.suggested_range
        ? parseInt(lead.suggested_range.replace(/\D/g, ""), 10) || ""
        : "";
      setFormData({
        nombre: lead.nombre || "",
        empresa: lead.nombre ? `${lead.nombre} Brand` : "",
        email: "",
        monto_retainer: suggestedPrice || "",
        esquema_pago: "mensual",
        dia_corte_pago: 1,
        dia_corte_pago_2: 15,
        producciones_por_mes: 0,
        tipo_sesion_default: "mentoria",
        locacion_default: lead.ubicacion || "",
        permite_descarga: false
      });
      setTipoServicio("mentoria");
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const handleTipoServicioChange = (tipo) => {
    setTipoServicio(tipo);
    if (tipo === "retainer") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "organica", producciones_por_mes: 2, permite_descarga: true }));
    } else if (tipo === "mentoria") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "mentoria", producciones_por_mes: 0, permite_descarga: false }));
    } else if (tipo === "servicio_unico") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "profesional", producciones_por_mes: 1, permite_descarga: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre del cliente es obligatorio.");
    setLoading(true);

    const res = await convertLeadToClient(lead.id, formData);
    setLoading(false);

    if (res.success) {
      toast.success("Cliente creado y vinculado al lead con éxito");
      if (onClientCreated) onClientCreated(res.data.cliente);
      onClose();
    } else {
      toast.error(res.error || "Error al convertir lead.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 md:p-8 font-inter max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-gray-100 text-left space-y-1.5">
          <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold self-start inline-flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Alta Directa de Lead
          </span>
          <DialogTitle className="font-sora text-xl font-bold text-gray-900 tracking-tight">
            Convertir Lead a Cliente / Mentoría
          </DialogTitle>
          <p className="text-xs text-gray-500 font-medium">
            Prospecto: <strong className="text-gray-900 font-bold">{lead.nombre}</strong>
            {lead.ubicacion ? ` • ${lead.ubicacion}` : ""}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Selector de Tipo de Servicio */}
          <div>
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1.5 block">
              Tipo de Servicio Acordado
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/80 text-[11px] font-sora font-semibold">
              <button
                type="button"
                onClick={() => handleTipoServicioChange("retainer")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  tipoServicio === "retainer" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
                <span>Retainer</span>
              </button>
              <button
                type="button"
                onClick={() => handleTipoServicioChange("mentoria")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  tipoServicio === "mentoria" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#ef18d6]" />
                <span>Mentoría</span>
              </button>
              <button
                type="button"
                onClick={() => handleTipoServicioChange("servicio_unico")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  tipoServicio === "servicio_unico" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Servicio Único</span>
              </button>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">Nombre *</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
              </div>
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">Empresa / Marca</label>
                <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-pink-500" /> Monto Pactado ($)
                </label>
                <input type="number" min="0" step="100" placeholder="0" value={formData.monto_retainer} onChange={(e) => setFormData({ ...formData, monto_retainer: e.target.value })} className="w-full h-10 px-3 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
              </div>
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">Esquema de Cobro</label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-xl border border-gray-200 h-10">
                  <button type="button" onClick={() => setFormData({ ...formData, esquema_pago: "mensual" })} className={`flex-1 rounded-lg text-xs font-sora font-semibold transition-all ${formData.esquema_pago === "mensual" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}>Mensual</button>
                  <button type="button" onClick={() => setFormData({ ...formData, esquema_pago: "quincenal" })} className={`flex-1 rounded-lg text-xs font-sora font-semibold transition-all ${formData.esquema_pago === "quincenal" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}>Quincenal</button>
                </div>
              </div>
            </div>

            {/* Días de corte */}
            {formData.esquema_pago === "quincenal" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-sora text-gray-500 block mb-0.5">1er Día Corte</span>
                  <select value={formData.dia_corte_pago} onChange={(e) => setFormData({ ...formData, dia_corte_pago: Number(e.target.value) })} className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-800">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Día {d}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-sora text-gray-500 block mb-0.5">2do Día Corte</span>
                  <select value={formData.dia_corte_pago_2} onChange={(e) => setFormData({ ...formData, dia_corte_pago_2: Number(e.target.value) })} className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-800">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Día {d}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-sora text-gray-500 block mb-0.5">Día de Corte Mensual</span>
                <select value={formData.dia_corte_pago} onChange={(e) => setFormData({ ...formData, dia_corte_pago: Number(e.target.value) })} className="w-full h-9 px-2.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-800">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Día {d} de cada mes</option>)}
                </select>
              </div>
            )}

            {/* Producciones por mes si no es mentoría */}
            {tipoServicio !== "mentoria" && (
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">Sesiones de Rodaje / Mes</label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-xl border border-gray-200 h-9">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} type="button" onClick={() => setFormData({ ...formData, producciones_por_mes: n })} className={`flex-1 rounded-lg text-xs font-sora font-bold transition-all ${formData.producciones_por_mes === n ? "bg-brand-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}>{n}</button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección Base
              </label>
              <input type="text" placeholder="Ubicación o enlace de Google Maps" value={formData.locacion_default} onChange={(e) => setFormData({ ...formData, locacion_default: e.target.value })} className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]" />
            </div>
          </div>

          <DialogFooter className="pt-2 flex-row items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-full text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 px-5 h-10 border border-transparent hover:bg-gray-100 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-[#188ff0] hover:bg-blue-600 text-white rounded-full font-sora font-bold text-xs py-2.5 px-6 shadow-md shadow-blue-200 active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Activando...</> : "Activar como Cliente"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
