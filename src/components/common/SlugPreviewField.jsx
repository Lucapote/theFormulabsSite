import { useState } from "react";
import { Globe, Copy, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * SlugPreviewField
 * Componente estandarizado Clinical High-Tech para previsualización de URLs públicas y slugs.
 *
 * @param {object} props
 * @param {string} [props.slug] - Identificador o slug actual
 * @param {string} [props.prefix='theformulab.io/'] - Dominio base o prefijo de ruta
 * @param {string} [props.label] - Etiqueta descriptiva opcional
 * @param {React.ReactNode} [props.icon] - Icono personalizado opcional
 * @param {string} [props.className] - Clases de Tailwind adicionales
 * @param {boolean} [props.copyable=false] - Habilita botón pill de copiado integrado
 * @param {string} [props.fullUrl] - URL completa a copiar (si difiere del prefix + slug)
 * @param {function} [props.onCopy] - Callback ejecutado tras copiar
 */
export default function SlugPreviewField({
  slug = "",
  prefix = "theformulab.io/",
  label = null,
  icon = null,
  className = "",
  copyable = false,
  fullUrl = null,
  onCopy = null
}) {
  const [copied, setCopied] = useState(false);

  // Normalizar separador entre prefix y slug (respeta queries con ? o =)
  const normalizedPrefix =
    prefix.endsWith("/") || prefix.endsWith("=") || prefix.endsWith("?") || (slug && slug.startsWith("/"))
      ? prefix
      : `${prefix}/`;

  const displaySlug = slug
    ? (slug.startsWith("/") && normalizedPrefix.endsWith("/") ? slug.slice(1) : slug)
    : "tu-slug-aqui";

  const handleCopy = (e) => {
    e?.stopPropagation?.();
    const textToCopy =
      fullUrl ||
      (typeof window !== "undefined" && window.location?.origin
        ? `${window.location.origin}/${displaySlug}`
        : `https://${normalizedPrefix}${displaySlug}`);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      if (typeof onCopy === "function") onCopy(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`space-y-1.5 w-full min-w-0 max-w-full overflow-hidden ${className}`}>
      {label && (
        <span className="block text-xs font-sora font-semibold text-gray-700 tracking-tight">
          {label}
        </span>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200/80 text-xs font-mono text-gray-600 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto select-all min-w-0 flex-1 py-0.5 no-scrollbar max-w-full">
          {icon || <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
          <span className="text-gray-400 select-none shrink-0 truncate max-w-[200px] sm:max-w-none">{normalizedPrefix}</span>
          <span className="font-semibold text-gray-900 truncate">{displaySlug}</span>
        </div>

        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="h-8 px-3 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer active:scale-[0.98] self-end sm:self-auto"
            title="Copiar enlace"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
