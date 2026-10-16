import { UserPlus, RefreshCw, DollarSign, Calendar, Video, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * CreateClientModal
 * Modal dialog for creating a new client/brand with Retainers & Operations fields.
 * Clinical High-Tech Lab design system.
 */
export default function CreateClientModal({
  isOpen = false,
  onClose,
  clientForm = {
    nombre: "",
    empresa: "",
    email: "",
    locacion_default: "",
    permite_descarga: false,
    monto_retainer: "",
    esquema_pago: "mensual",
    dia_corte_pago: 1,
    dia_corte_pago_2: 15,
    tipo_sesion_default: "organica",
    producciones_por_mes: 1
  },
  setClientForm,
  onSubmit,
  isSaving = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-x-hidden">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full max-w-[calc(100vw-1.5rem)] mx-auto shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-gray-900 text-lg">
                Nuevo Cliente
              </h3>
              <p className="text-[11px] text-gray-500 font-inter">
                Alta operativa y configuración de retainer mensual
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Bloque 1: Identidad del Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Nombre del Cliente / Marca *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Clínica Aurora"
                value={clientForm.nombre || ""}
                onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Empresa / Razón Social
              </label>
              <input
                type="text"
                placeholder="Ej. Aurora Health Group S.A."
                value={clientForm.empresa || ""}
                onChange={(e) => setClientForm({ ...clientForm, empresa: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
              />
            </div>
          </div>

          {/* Bloque 2: Contacto y Locación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Email de Contacto
              </label>
              <input
                type="email"
                placeholder="Ej. contacto@clinicaaurora.com"
                value={clientForm.email || ""}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Locación / Dirección base
              </label>
              <input
                type="text"
                placeholder="Ej. Av. Bonampak SM 4, Cancún"
                value={clientForm.locacion_default || ""}
                onChange={(e) => setClientForm({ ...clientForm, locacion_default: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
              />
            </div>
          </div>

          {/* Fila Operativa: Monto Retainer, Esquema de Pago y Días de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-pink-500" />
                Retainer Mensual Total ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-sora font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0.00"
                  value={clientForm.monto_retainer ?? ""}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, monto_retainer: e.target.value })
                  }
                  className="w-full h-11 pl-7 pr-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-semibold transition-all"
                />
              </div>
              {(clientForm.esquema_pago === "dos_pagos" || clientForm.esquema_pago === "quincenal") && Number(clientForm.monto_retainer) > 0 && (
                <p className="text-[11px] font-inter text-gray-500 mt-1">
                  2 pagos de <strong className="text-gray-800">${(Number(clientForm.monto_retainer) / 2).toLocaleString("es-MX")}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Esquema y Días de Pago
              </label>
              <div className="space-y-1.5">
                <select
                  value={
                    clientForm.esquema_pago === "dos_pagos" || clientForm.esquema_pago === "quincenal"
                      ? "dos_pagos"
                      : "mensual"
                  }
                  onChange={(e) =>
                    setClientForm({ ...clientForm, esquema_pago: e.target.value })
                  }
                  className="w-full h-11 px-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs text-gray-900 font-sora font-semibold bg-white transition-all cursor-pointer"
                >
                  <option value="mensual">1 Pago Mensual</option>
                  <option value="dos_pagos">2 Pagos Mensuales</option>
                </select>

                {clientForm.esquema_pago === "dos_pagos" || clientForm.esquema_pago === "quincenal" ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] font-sora font-semibold text-gray-500 block mb-0.5">
                        1er Pago
                      </span>
                      <select
                        value={clientForm.dia_corte_pago ?? 1}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, dia_corte_pago: Number(e.target.value) })
                        }
                        className="w-full h-9 px-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs text-gray-900 font-medium bg-white transition-all cursor-pointer"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                          <option key={dia} value={dia}>
                            Día {dia}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-sora font-semibold text-gray-500 block mb-0.5">
                        2do Pago
                      </span>
                      <select
                        value={clientForm.dia_corte_pago_2 ?? 15}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, dia_corte_pago_2: Number(e.target.value) })
                        }
                        className="w-full h-9 px-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs text-gray-900 font-medium bg-white transition-all cursor-pointer"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                          <option key={dia} value={dia}>
                            Día {dia}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={clientForm.dia_corte_pago ?? 1}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, dia_corte_pago: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs text-gray-900 font-medium bg-white transition-all cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                        <option key={dia} value={dia}>
                          Día {dia} de cada mes
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de Sesión de Producción (Orgánica 4h vs Profesional 6h) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sora font-bold uppercase text-gray-700 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-brand-blue" />
                Tipo de Sesión de Producción
              </label>
              <span className="text-[11px] font-sora font-semibold text-gray-500">
                {(clientForm.tipo_sesion_default || "organica") === "profesional"
                  ? "6 hrs de levantamiento"
                  : "4 hrs de levantamiento"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setClientForm({ ...clientForm, tipo_sesion_default: "organica" })
                }
                className={`py-2 px-3 rounded-xl border text-xs font-sora font-bold transition-all text-center cursor-pointer ${
                  (clientForm.tipo_sesion_default || "organica") === "organica"
                    ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Orgánica (4 horas)
              </button>
              <button
                type="button"
                onClick={() =>
                  setClientForm({ ...clientForm, tipo_sesion_default: "profesional" })
                }
                className={`py-2 px-3 rounded-xl border text-xs font-sora font-bold transition-all text-center cursor-pointer ${
                  clientForm.tipo_sesion_default === "profesional"
                    ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Profesional (6 horas)
              </button>
            </div>
          </div>

          {/* Sesiones de Producción / Mes (Control Segmentado Lab) */}
          <div className="pt-1">
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-emerald-500" />
              Sesiones de Producción / Mes
            </label>
            <div className="bg-gray-100 p-1 rounded-full border border-gray-200 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((num) => {
                const isActive = (Number(clientForm.producciones_por_mes) || 1) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      setClientForm({ ...clientForm, producciones_por_mes: num })
                    }
                    className={`h-8 text-[11px] font-sora font-bold rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    {num} {num === 1 ? "sesión" : "sesiones"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permiso de Descarga en Vista Pública */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="space-y-0.5 pr-3">
              <Label
                htmlFor="permite-descarga-toggle"
                className="text-xs font-sora font-bold text-gray-800 cursor-pointer"
              >
                Permitir descarga de archivos en vista pública
              </Label>
              <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
                Habilita a este cliente descargar fotos y videos desde su calendario.
              </p>
            </div>
            <Switch
              id="permite-descarga-toggle"
              checked={Boolean(clientForm.permite_descarga)}
              onCheckedChange={(checked) =>
                setClientForm({ ...clientForm, permite_descarga: checked })
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Cliente"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
