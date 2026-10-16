import { Sparkles } from "lucide-react";

export const QUESTION_TITLES = {
  objetivo: "Necesidad principal",
  nicho: "Industria o nicho",
  operacion: "Etapa operativa",
  gestion: "Gestión actual",
  inversion: "Presupuesto mensual"
};

/**
 * LeadAnswersBreakdown
 * Subcomponente atómico para visualizar las respuestas del diagnóstico clínico.
 */
export default function LeadAnswersBreakdown({ answers = {} }) {
  const answersList = Object.entries(answers || {});

  return (
    <div className="space-y-2.5 font-inter">
      <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider pt-2 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-brand-magenta" /> Desglose Clínico de Respuestas ({answersList.length})
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {answersList.map(([key, val], idx) => (
          <div key={key} className="bg-white border border-gray-200/80 rounded-xl p-3.5 space-y-1.5 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 mr-1.5">#{idx + 1}</span>
              <span className="text-xs font-semibold text-gray-800 leading-snug">{QUESTION_TITLES[key] || val?.question || key}</span>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-2 font-medium">
              {val?.label || val?.answer || (typeof val === "string" ? val : "—")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
