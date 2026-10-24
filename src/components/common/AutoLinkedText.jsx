import { ExternalLink } from "lucide-react";

/**
 * AutoLinkedText
 * Componente que detecta automáticamente URLs (http, https, www) dentro de cualquier texto,
 * las formatea como enlaces destacados e interactivos que abren en una nueva pestaña (target="_blank"),
 * y preserva los saltos de línea y emojis intactos.
 *
 * Cumple con el ADN "Clinical High-Tech Lab" y principios de tactilidad de GEMINI.md.
 */
export default function AutoLinkedText({ text = "", className = "", onlyLinks = false }) {
  if (!text) return null;

  // Regex para detectar URLs iniciadas por http://, https:// o www.
  const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    let rawUrl = match[0];

    // Limpieza de signos de puntuación finales que no son parte de la URL (ej: ".", ",", ")", "]", ";", "!")
    let trailingPunctuation = "";
    while (/[.,!?;:)>\]"']$/.test(rawUrl)) {
      if (rawUrl.endsWith(")") && (rawUrl.match(/\(/g) || []).length >= (rawUrl.match(/\)/g) || []).length) {
        break;
      }
      trailingPunctuation = rawUrl.slice(-1) + trailingPunctuation;
      rawUrl = rawUrl.slice(0, -1);
    }

    // Texto antes de la URL
    if (matchIndex > lastIndex && !onlyLinks) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, matchIndex)
      });
    }

    // La URL detectada
    if (rawUrl) {
      const href = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

      parts.push({
        type: "link",
        url: rawUrl,
        href,
        trailing: onlyLinks ? "" : trailingPunctuation
      });
    }

    lastIndex = matchIndex + match[0].length;
  }

  // Resto del texto posterior al último link
  if (lastIndex < text.length && !onlyLinks) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex)
    });
  }

  if (onlyLinks && parts.length === 0) return null;

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }

        return (
          <span key={index} className="inline-flex items-baseline flex-wrap">
            <a
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Abrir ${part.href} en una nueva pestaña`}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-full bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 hover:border-blue-300 text-brand-blue font-sora font-semibold text-[11px] sm:text-xs transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer align-middle group select-all"
            >
              <span className="truncate max-w-[240px] sm:max-w-xs">{part.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-brand-blue opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
            {part.trailing && <span>{part.trailing}</span>}
          </span>
        );
      })}
    </span>
  );
}
