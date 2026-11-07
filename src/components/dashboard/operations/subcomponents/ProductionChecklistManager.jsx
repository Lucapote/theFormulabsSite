import { useState } from "react";
import { ListChecks, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";

/**
 * ProductionChecklistManager
 * Gestor clínico interactivo con cuadro de texto multilínea para definir requerimientos
 * pegados en bloque o escritos manualmente. El Enter genera salto de línea.
 */
export default function ProductionChecklistManager({
  requerimientos = [],
  onChange
}) {
  const [nuevoTexto, setNuevoTexto] = useState("");

  const items = Array.isArray(requerimientos) ? requerimientos : [];
  const completadosCount = items.filter((i) => i.completado).length;

  const cleanLine = (line) => {
    return line
      .replace(/^(\s*[-*•–—+]\s*|\s*\d+[\.\)]\s*|\s*\[[\sxX]?\]\s*)/, "")
      .trim();
  };

  const handleAgregar = () => {
    if (!nuevoTexto.trim()) return;

    const lineas = nuevoTexto.split(/\r?\n/);
    const nuevosItems = [];

    lineas.forEach((linea) => {
      const textoLimpio = cleanLine(linea);
      if (textoLimpio) {
        const yaExisteEnActuales = items.some(
          (it) => it.texto.toLowerCase() === textoLimpio.toLowerCase()
        );
        const yaExisteEnNuevos = nuevosItems.some(
          (it) => it.texto.toLowerCase() === textoLimpio.toLowerCase()
        );

        if (!yaExisteEnActuales && !yaExisteEnNuevos) {
          nuevosItems.push({
            id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            texto: textoLimpio,
            completado: false,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    if (nuevosItems.length > 0) {
      onChange?.([...items, ...nuevosItems]);
    }
    setNuevoTexto("");
  };

  const handleLimpiarTodos = () => {
    onChange?.([]);
  };

  const handleEliminar = (id) => {
    const nextItems = items.filter((i) => i.id !== id);
    onChange?.(nextItems);
  };

  return (
    <div className="bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 space-y-3.5 font-inter text-left">
      {/* Cabecera del Bloque */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0">
            <ListChecks className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-sora font-bold text-gray-900 tracking-wider uppercase">
            Requerimientos para el Cliente (Checklist)
          </span>
        </div>

        {items.length > 0 && (
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-bold">
            {completadosCount}/{items.length} completados
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        El cliente verá estos puntos en su enlace de reserva y podrá marcarlos conforme los prepare.
      </p>

      {/* Área de texto para pegar o escribir requerimientos multilínea */}
      <div className="space-y-2">
        <textarea
          rows={3}
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder={`Pega o escribe tu lista de requerimientos (uno por línea):\n• 3 mudas de ropa\n• Productos muestra limpios\n• Decoración navideña para mesas`}
          className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue resize-y transition-all leading-relaxed"
        />

        <div className="flex items-center justify-between gap-2">
          {items.length > 0 ? (
            <button
              type="button"
              onClick={handleLimpiarTodos}
              className="text-[11px] font-sora font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
            >
              Vaciar lista
            </button>
          ) : (
            <span className="text-[10px] text-gray-400">
              Enter = salto de línea
            </span>
          )}

          <button
            type="button"
            onClick={handleAgregar}
            disabled={!nuevoTexto.trim()}
            className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sora text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar a la lista</span>
          </button>
        </div>
      </div>

      {/* Lista de Requerimientos Definidos */}
      {items.length === 0 ? (
        <div className="py-3 px-4 rounded-xl border border-dashed border-gray-200 bg-white/60 text-center">
          <p className="text-[11px] text-gray-400 italic">
            Sin requerimientos específicos aún. Pega o escribe tu lista arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                item.completado
                  ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {item.completado ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-xs font-inter leading-snug break-words ${
                    item.completado ? "line-through text-emerald-800/80" : ""
                  }`}
                >
                  {item.texto}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    item.completado
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {item.completado ? "Listo" : "Pendiente"}
                </span>

                <button
                  type="button"
                  onClick={() => handleEliminar(item.id)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  title="Eliminar requerimiento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
