import { MapPin, ArrowRight } from "lucide-react";

/**
 * CreateClientIdentityTab
 * Pestaña 1: Información básica de identidad, razón social y locación.
 */
export default function CreateClientIdentityTab({
  clientForm,
  onChangeField,
  onNext
}) {
  return (
    <>
      {/* Bloque 1: Identidad del Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5">
            Nombre del Cliente / Marca *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Clínica Aurora"
            value={clientForm.nombre || ""}
            onChange={(e) => onChangeField("nombre", e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5">
            Empresa / Razón Social
          </label>
          <input
            type="text"
            placeholder="Ej. Aurora Health Group S.A."
            value={clientForm.empresa || ""}
            onChange={(e) => onChangeField("empresa", e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all"
          />
        </div>
      </div>

      {/* Bloque 2: Contacto y Locación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5">
            Email de Contacto
          </label>
          <input
            type="email"
            placeholder="Ej. contacto@clinicaaurora.com"
            value={clientForm.email || ""}
            onChange={(e) => onChangeField("email", e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Locación / Dirección base
          </label>
          <input
            type="text"
            placeholder="Ej. Av. Bonampak SM 4, Cancún"
            value={clientForm.locacion_default || ""}
            onChange={(e) => onChangeField("locacion_default", e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all"
          />
        </div>
      </div>

      {/* Paso Siguiente Asistido */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="h-10 px-5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>Configurar Retainer y Producción</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}

