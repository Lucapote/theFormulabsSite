import { Home, Clock, ShieldCheck, FlaskConical, AlertCircle, Check, Activity } from "lucide-react";

export default function LeadSuccessCard({ contactData }) {
  const nombre = contactData?.nombre?.trim() || "amigo";
  const instagram = contactData?.instagram?.trim() || "";

  return (
    <div className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-5 sm:p-8 shadow-xl space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-300 text-center">
      {/* Status Live Pill (Azul clínico coherente) */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-2xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
        </span>
        <span className="text-[11px] font-mono font-bold text-brand-blue tracking-wider uppercase">
          Muestra Recibida · Caso en Laboratorio
        </span>
      </div>

      {/* Hero Affirmation & Validation */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="font-sora text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          ¡Excelente decisión, {nombre}!
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 font-inter leading-relaxed">
          Tus respuestas están en manos de nuestros estrategas. Mientras auditamos tu perfil {instagram ? <strong className="text-gray-900">(@{instagram})</strong> : ""}, esto es lo que tomaremos en cuenta para tu diagnóstico:
        </p>
      </div>

      {/* Subconscious Neuromarketing PAS Capsule (Cromática Balanceada) */}
      <div className="max-w-lg mx-auto bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
          <span className="text-[11px] font-sora font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-blue" />
            Enfoque de Diagnóstico
          </span>
          <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
            THE FORMULAB
          </span>
        </div>

        {/* 1. Problema (Magenta Institucional) */}
        <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100 text-brand-magenta flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-brand-magenta uppercase tracking-wider">
                01 · Detección
              </span>
              <span className="text-gray-300">·</span>
              <h4 className="text-xs font-sora font-bold text-gray-900">
                Alcance sin retorno comercial
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-inter leading-relaxed">
              Publicar con esfuerzo continuo suele generar reproducciones o likes dispersos, pero rara vez se traduce en mensajes con intención real de compra.
            </p>
          </div>
        </div>

        {/* 2. Agitación (Celeste / Azul Eléctrico Institucional) */}
        <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-wider">
                02 · Fricción
              </span>
              <span className="text-gray-300">·</span>
              <h4 className="text-xs font-sora font-bold text-gray-900">
                Semanas probando sin dirección
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-inter leading-relaxed">
              Depender de tendencias pasajeras desgasta recursos creativos y le cede terreno a competidores que ya operan con una fórmula clara de captación.
            </p>
          </div>
        </div>

        {/* 3. Solución (Magenta Institucional) */}
        <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100 text-brand-magenta flex items-center justify-center shrink-0 mt-0.5">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-brand-magenta uppercase tracking-wider">
                03 · Fórmula
              </span>
              <span className="text-gray-300">·</span>
              <h4 className="text-xs font-sora font-bold text-gray-900">
                Ingeniería de contenido estructurada
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-inter leading-relaxed">
              Diseñamos activos con ganchos psicológicos de alta retención y llamadas a la acción precisas, orientando cada pieza directamente a tu facturación.
            </p>
          </div>
        </div>
      </div>

      {/* Protocolo de Contacto: Certeza & Cero Ansiedad */}
      <div className="max-w-lg mx-auto bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sora font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            ¿Qué pasará en las próximas 24 horas?
          </span>
          <span className="text-[10px] font-mono text-gray-400 font-semibold tracking-wider uppercase">
            PRÓXIMO PASO
          </span>
        </div>
        <div className="space-y-2 text-xs font-inter text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span><strong>1. Auditoría individual:</strong> Analizamos tu perfil actual, tu nicho y los ángulos de mayor oportunidad visual.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span><strong>2. Mensaje directo por WhatsApp:</strong> Te compartiremos tus hallazgos clave y el plan sugerido a tu chat.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span><strong>3. Cero llamadas frías:</strong> Comunicación concisa y sin presiones de compra. Tú decides cómo proceder.</span>
          </div>
        </div>
        <div className="pt-1 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] text-gray-500 font-inter">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Tus datos son 100% confidenciales y de uso exclusivo para tu diagnóstico.</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-1">
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-brand-magenta hover:bg-pink-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-pink-200 transition-all active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Volver al sitio principal</span>
        </a>
      </div>
    </div>
  );
}
