import { useState } from "react";
import { User, AtSign, Phone, MapPin, Calendar, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { UBICACIONES_LIST, CUANDO_INICIAR_LIST } from "@/data/leadFormData";

export default function LeadContactCard({
  contactData,
  onChangeContact,
  onSubmit,
  isSubmitting,
  errorMessage
}) {
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  const isFormValid =
    contactData.nombre.trim().length >= 2 &&
    contactData.instagram.trim().length >= 2 &&
    contactData.whatsapp.replace(/\D/g, "").length >= 8 &&
    Boolean(contactData.ubicacion) &&
    Boolean(contactData.cuando_iniciar);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmittedAttempt(true);

    if (isFormValid && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in-50 duration-300">
      {/* Title & Friendly Intro */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-magenta/10 border border-brand-magenta/20 text-[11px] font-sora font-bold text-brand-magenta">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-magenta" />
          Paso Final
        </div>
        <h2 className="font-sora text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          ¿A dónde te enviamos tu diagnóstico personalizado?
        </h2>
        <p className="text-sm text-gray-500 font-inter leading-relaxed">
          Revisaremos el perfil de tu marca antes de contactarte para darte una propuesta clara y sin rodeos.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-inter leading-relaxed flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-sora font-semibold text-gray-700">
            Tu nombre completo o el de tu marca <span className="text-brand-magenta">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Ej. Sofía Mendoza / Café Sol"
              value={contactData.nombre}
              onChange={(e) => onChangeContact("nombre", e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-inter focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Instagram Profile */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-sora font-semibold text-gray-700">
              Instagram de tu marca <span className="text-brand-magenta">*</span>
            </label>
            <span className="text-[11px] text-gray-400 font-inter">Para auditar tu feed</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="marca.ejemplo (sin el @)"
              value={contactData.instagram}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/^@/, "");
                onChangeContact("instagram", cleaned);
              }}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-inter focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-sora font-semibold text-gray-700">
              WhatsApp de contacto <span className="text-brand-magenta">*</span>
            </label>
            <span className="text-[11px] text-gray-400 font-inter">Directo para coordinar</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              placeholder="Ej. 998 123 4567"
              value={contactData.whatsapp}
              onChange={(e) => onChangeContact("whatsapp", e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-inter focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Ubicación Chips */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-sora font-semibold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              ¿Dónde está tu negocio físicamente? <span className="text-brand-magenta">*</span>
            </label>
            {submittedAttempt && !contactData.ubicacion && (
              <span className="text-[11px] font-sora font-semibold text-brand-magenta animate-pulse">
                Elige una opción
              </span>
            )}
          </div>
          <div
            className={`flex flex-wrap gap-2 transition-all ${
              submittedAttempt && !contactData.ubicacion
                ? "p-1.5 rounded-2xl ring-1 ring-brand-magenta/40 bg-pink-50/30"
                : ""
            }`}
          >
            {UBICACIONES_LIST.map((loc) => {
              const isSelected = contactData.ubicacion === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onChangeContact("ubicacion", loc)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-inter transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-brand-magenta text-white border-brand-magenta font-semibold shadow-xs shadow-pink-300"
                      : "bg-blue-50/70 border-blue-200/70 text-brand-blue hover:bg-blue-100/60 hover:border-blue-300"
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuándo iniciar Chips */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-sora font-semibold text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              ¿Cuándo te gustaría comenzar? <span className="text-brand-magenta">*</span>
            </label>
            {submittedAttempt && !contactData.cuando_iniciar && (
              <span className="text-[11px] font-sora font-semibold text-brand-magenta animate-pulse">
                Elige una opción
              </span>
            )}
          </div>
          <div
            className={`flex flex-wrap gap-2 transition-all ${
              submittedAttempt && !contactData.cuando_iniciar
                ? "p-1.5 rounded-2xl ring-1 ring-brand-magenta/40 bg-pink-50/30"
                : ""
            }`}
          >
            {CUANDO_INICIAR_LIST.map((cuando) => {
              const isSelected = contactData.cuando_iniciar === cuando;
              return (
                <button
                  key={cuando}
                  type="button"
                  onClick={() => onChangeContact("cuando_iniciar", cuando)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-inter transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-brand-magenta text-white border-brand-magenta font-semibold shadow-xs shadow-pink-300"
                      : "bg-blue-50/70 border-blue-200/70 text-brand-blue hover:bg-blue-100/60 hover:border-blue-300"
                  }`}
                >
                  {cuando}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-400 font-inter">
          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
          <span>Tus datos están protegidos. No compartimos tu información ni enviamos spam.</span>
        </div>

        {/* Submit CTA */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-brand-blue hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando tus respuestas...</span>
              </>
            ) : (
              <>
                <span>Obtener mi diagnóstico y propuesta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
