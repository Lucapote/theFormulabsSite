import {
  DollarSign,
  Clapperboard,
  LockKeyhole,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getPaymentSplitOptions, getDefaultFirstPaymentSessions } from "@/utils/bookingHelpers";

/**
 * EditClientRetainerTab
 * Pestaña 2 de Configuración Financiera y Operativa:
 * - Monto del Retainer y esquema de cobro (mensual o quincenal en dos fechas)
 * - Producciones comprometidas por mes y tipo de sesión base
 * - Regla de desbloqueo de sesiones para esquemas de dos pagos
 * - Configuración de permisos de descarga en calendarios públicos
 */
export default function EditClientRetainerTab({ formData, setFormData }) {
  return (
    <div className="space-y-4 font-inter">
      {/* Bloque A: Esquema Financiero y Retainer */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
        <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
          A. Esquema Financiero y Retainer
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor="client-retainer"
              className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1"
            >
              <DollarSign className="w-3.5 h-3.5 text-brand-magenta" /> Monto Retainer ($)
            </Label>
            <Input
              id="client-retainer"
              type="number"
              min="0"
              step="100"
              value={formData.monto_retainer}
              onChange={(e) => setFormData({ ...formData, monto_retainer: e.target.value })}
              placeholder="0.00"
              className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-sora font-bold"
            />
          </div>

          <div>
            <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
              Esquema de Cobro
            </Label>
            <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, esquema_pago: "mensual" })}
                className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                  formData.esquema_pago === "mensual"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, esquema_pago: "quincenal" })}
                className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                  formData.esquema_pago === "quincenal"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Quincenal
              </button>
            </div>
          </div>
        </div>

        {formData.esquema_pago === "quincenal" ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-sora text-gray-500 block mb-1">1er Día de Cobro</span>
              <Select
                value={String(formData.dia_corte_pago)}
                onValueChange={(val) => setFormData({ ...formData, dia_corte_pago: Number(val) })}
              >
                <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                  <SelectValue placeholder="1er Día" />
                </SelectTrigger>
                <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                      Día {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-[10px] font-sora text-gray-500 block mb-1">2do Día de Cobro</span>
              <Select
                value={String(formData.dia_corte_pago_2)}
                onValueChange={(val) => setFormData({ ...formData, dia_corte_pago_2: Number(val) })}
              >
                <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                  <SelectValue placeholder="2do Día" />
                </SelectTrigger>
                <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                      Día {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[10px] font-sora text-gray-500 block mb-1">Día de Cobro Mensual</span>
            <Select
              value={String(formData.dia_corte_pago)}
              onValueChange={(val) => setFormData({ ...formData, dia_corte_pago: Number(val) })}
            >
              <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                <SelectValue placeholder="Día de cobro" />
              </SelectTrigger>
              <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                    Día {d} de cada mes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Bloque B: Producción y Entregables */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
        <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
          B. Producción y Entregables
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Clapperboard className="w-3.5 h-3.5 text-brand-blue" /> Sesiones / Mes
            </Label>
            <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      producciones_por_mes: num,
                      sesiones_primer_pago: getDefaultFirstPaymentSessions(num)
                    })
                  }
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                    formData.producciones_por_mes === num
                      ? "bg-brand-blue text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
              Tipo Predeterminado
            </Label>
            <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo_sesion_default: "organica" })}
                className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                  formData.tipo_sesion_default === "organica"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Orgánica (4h)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo_sesion_default: "profesional" })}
                className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                  formData.tipo_sesion_default === "profesional"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pro (6h)
              </button>
            </div>
          </div>
        </div>

        {formData.esquema_pago === "quincenal" && formData.producciones_por_mes >= 2 && (
          <div className="p-3 bg-white border border-blue-100 rounded-xl space-y-2">
            <span className="text-[11px] font-sora font-bold text-gray-800 flex items-center gap-1.5">
              <LockKeyhole className="w-3.5 h-3.5 text-brand-blue" />
              Desbloqueo de Sesiones por Pago (2 Pagos)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {getPaymentSplitOptions(formData.producciones_por_mes).map((opt) => {
                const isSelected =
                  (Number(formData.sesiones_primer_pago) ||
                    getDefaultFirstPaymentSessions(formData.producciones_por_mes)) ===
                  opt.firstPaymentSessions;
                return (
                  <button
                    key={opt.firstPaymentSessions}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sesiones_primer_pago: opt.firstPaymentSessions
                      })
                    }
                    className={`py-2 px-3 rounded-full text-[11px] font-sora font-semibold transition-all cursor-pointer border text-center ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-blue"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
          <div className="space-y-0.5">
            <Label
              htmlFor="permite_descarga"
              className="text-xs font-sora font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-brand-magenta" /> Permitir Descarga de Contenido
            </Label>
            <p className="text-[10px] text-gray-500 font-inter">
              Habilita el botón de descarga en sus calendarios públicos.
            </p>
          </div>
          <Switch
            id="permite_descarga"
            checked={formData.permite_descarga}
            onCheckedChange={(val) => setFormData({ ...formData, permite_descarga: val })}
          />
        </div>
      </div>
    </div>
  );
}
