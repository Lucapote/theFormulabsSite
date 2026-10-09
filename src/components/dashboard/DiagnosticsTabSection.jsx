import { Sparkles, Database } from "lucide-react";

/**
 * DiagnosticsTabSection
 * Displays diagnostics submissions table for the Dashboard.
 */
export default function DiagnosticsTabSection({ diagnostics = [], loadingDb = false }) {
  return (
    <div className="space-y-4 font-inter">
      {loadingDb ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-sora font-bold text-gray-700">Cargando diagnósticos...</p>
        </div>
      ) : diagnostics.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg text-gray-500 text-sm">
          <Database className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          No se registraron respuestas de diagnóstico aún.
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-900 text-white font-sora text-xs">
                  <th className="p-5 font-bold w-[35%]">Email</th>
                  <th className="p-5 font-bold w-[25%]">Diagnóstico Emitido</th>
                  <th className="p-5 font-bold w-[20%]">Fecha</th>
                  <th className="p-5 font-bold w-[20%]">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {diagnostics.map((diag) => (
                  <tr key={diag.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="p-5 font-mono font-medium text-gray-900">{diag.email}</td>
                    <td className="p-5 font-sora font-bold text-pink-600">
                      {diag.result_data?.title || "Diagnóstico Completo"}
                    </td>
                    <td className="p-5 text-xs text-gray-500 font-medium">
                      {new Date(diag.created_at).toLocaleDateString("es-MX")}
                    </td>
                    <td className="p-5 text-xs text-gray-500 font-mono">
                      {diag.answers ? `${Object.keys(diag.answers).length} Respuestas` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
