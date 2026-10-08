import mammoth from "mammoth";

/**
 * Maps Spanish month names to 2-digit strings.
 */
const MONTH_MAP = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  setiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

/**
 * Helper to convert 12h or raw time to HH:mm:ss format
 */
function normalizeTime(hourRaw, minRaw = "00", ampmRaw = "") {
  let hour = parseInt(hourRaw, 10);
  const min = parseInt(minRaw || "0", 10);
  const ampm = ampmRaw ? ampmRaw.toLowerCase().replace(/\./g, "").trim() : "";

  if (isNaN(hour)) hour = 18;

  if (ampm === "pm" && hour < 12) {
    hour += 12;
  } else if (ampm === "am" && hour === 12) {
    hour = 0;
  }

  const hh = String(hour).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

/**
 * Regex to detect Spanish date header lines
 * Examples:
 * - Sábado 10 de octubre — 8:00 PM
 * - Lunes 12 de noviembre de 2026 - 10:30 AM
 * - 15 de Octubre - 19:00
 */
const DATE_HEADER_REGEX = /(?:(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+)?(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?(?:\s*(?:[—–\-:]|\s+a\s+las\s+)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?)?/i;

/**
 * Parse a Word .docx file into structured calendar posts.
 * @param {File} file - .docx file uploaded by user
 * @param {number} defaultYear - Default year if not specified in text (default 2026)
 * @returns {Promise<Array>} List of post objects for Supabase
 */
export async function parseDocxCalendar(file, defaultYear = 2026) {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo para procesar.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || "";

  if (!rawText.trim()) {
    throw new Error("El archivo Word no contiene texto extraíble.");
  }

  // Split lines and clean whitespace
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Group lines into post blocks by detecting date headers or post dividers
  const blocks = [];
  let currentBlock = [];

  for (const line of lines) {
    // Check if line looks like a date header or "Publicación X / Post X"
    const isDateHeader = DATE_HEADER_REGEX.test(line) && /\bde\b/i.test(line);
    const isPostHeader = /^(publicaci[oó]n|post)\s*\d+/i.test(line);

    if ((isDateHeader || isPostHeader) && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const parsedPosts = [];

  for (const block of blocks) {
    const blockText = block.join("\n");

    // 1. Detect Date & Time
    let fechaProgramada = null;
    let horaProgramada = "18:00:00";

    for (const line of block) {
      const match = line.match(DATE_HEADER_REGEX);
      if (match && match[1] && match[2]) {
        const day = String(parseInt(match[1], 10)).padStart(2, "0");
        const monthName = match[2].toLowerCase().trim();
        const month = MONTH_MAP[monthName];

        if (month) {
          const year = match[3] ? parseInt(match[3], 10) : defaultYear;
          fechaProgramada = `${year}-${month}-${day}`;

          if (match[4]) {
            horaProgramada = normalizeTime(match[4], match[5], match[6]);
          }
          break;
        }
      }
    }

    // 2. Detect Format (Reel or Carrusel)
    let tipoPost = "reel"; // Default
    const formatLine = block.find((l) => /formato|tipo/i.test(l));
    const fullTextLower = blockText.toLowerCase();

    if (formatLine) {
      if (/carrusel|carrousel|carousel|deslizable/i.test(formatLine)) {
        tipoPost = "carrousel";
      } else if (/reel|video/i.test(formatLine)) {
        tipoPost = "reel";
      }
    } else {
      if (fullTextLower.includes("carrusel") || fullTextLower.includes("carrousel")) {
        tipoPost = "carrousel";
      }
    }

    // 3. Extract Caption & CTA
    let captionText = "";
    let ctaText = "";

    // Search for explicit Caption: and CTA: labels
    const captionMatch = blockText.match(/(?:caption|copy|texto|leyenda):\s*([\s\S]*?)(?=(?:cta|llamado a la acci[oó]n|formato|tipo|fecha|$))/i);
    const ctaMatch = blockText.match(/(?:cta|llamado a la acci[oó]n):\s*([\s\S]*?)(?=(?:formato|tipo|fecha|$))/i);

    if (captionMatch && captionMatch[1]?.trim()) {
      captionText = captionMatch[1].trim();
    }
    if (ctaMatch && ctaMatch[1]?.trim()) {
      ctaText = ctaMatch[1].trim();
    }

    // If no explicit caption label was found, extract lines that are not headers or formats
    if (!captionText) {
      const contentLines = block.filter((line) => {
        if (line.match(DATE_HEADER_REGEX) && /\bde\b/i.test(line)) return false;
        if (/^(publicaci[oó]n|post)\s*\d+/i.test(line)) return false;
        if (/^(formato|tipo):/i.test(line)) return false;
        if (/^(cta|llamado a la acci[oó]n):/i.test(line)) return false;
        return true;
      });
      captionText = contentLines.join("\n\n").trim();
    }

    // Final combined caption
    let finalCaption = captionText;
    if (ctaText) {
      finalCaption = finalCaption ? `${finalCaption}\n\n${ctaText}` : ctaText;
    }

    // Only add if there is a valid date or caption or content
    if (fechaProgramada || finalCaption) {
      parsedPosts.push({
        fecha_programada: fechaProgramada,
        hora_programada: horaProgramada,
        tipo_post: tipoPost,
        caption: finalCaption,
        estado: "borrador",
      });
    }
  }

  if (parsedPosts.length === 0) {
    throw new Error(
      "No se encontraron publicaciones válidas en el documento. Asegúrate de incluir encabezados de fecha (ej. 'Sábado 10 de octubre — 8:00 PM') y textos."
    );
  }

  return parsedPosts;
}
