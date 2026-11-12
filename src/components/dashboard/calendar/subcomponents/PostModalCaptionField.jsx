/**
 * PostModalCaptionField
 * Campo de texto multilínea para caption, hashtags y llamadas a la acción,
 * o instrucciones técnicas en el caso de historias.
 */
export default function PostModalCaptionField({
  tipoPost,
  caption = "",
  onChange
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-sora font-bold uppercase text-gray-700 tracking-wide">
          {tipoPost === "historia"
            ? "Instrucciones de la Historia / Secuencia *"
            : "Caption / Copywriting del Post *"}
        </label>
        <span className="text-[11px] font-mono text-gray-400">
          {caption.length} / 2200 car.
        </span>
      </div>
      <textarea
        rows={4}
        placeholder={
          tipoPost === "historia"
            ? "Instrucciones de publicación para Instagram: Stickers a colocar, links web, encuestas, textos sobreimpresos..."
            : "Escribe el texto de la publicación, hashtags y llamadas a la acción..."
        }
        value={caption}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all leading-relaxed font-inter"
      />
    </div>
  );
}

