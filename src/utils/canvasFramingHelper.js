import { uploadMediaFile } from "@/services/calendarService";
import { supabase } from "@/lib/supabase";

export const ASPECT_RATIOS = [
  { id: "4/5", label: "4:5 Retrato (Instagram)", width: 1080, height: 1350, ratio: 4 / 5, desc: "Máxima visibilidad en el feed", aspectClass: "aspect-[4/5]" },
  { id: "1/1", label: "1:1 Cuadrado", width: 1080, height: 1080, ratio: 1, desc: "Estándar clásico de cuadrícula", aspectClass: "aspect-square" },
  { id: "1.91/1", label: "1.91:1 Horizontal", width: 1080, height: 566, ratio: 1.91, desc: "Formato apaisado", aspectClass: "aspect-[1.91/1]" }
];

export const BACKGROUND_OPTIONS = [
  { id: "black", label: "Negro", colorClass: "bg-black border border-gray-600" },
  { id: "white", label: "Blanco", colorClass: "bg-white border border-gray-300" },
  { id: "blur", label: "Blur / Difuminado", colorClass: "bg-gradient-to-tr from-brand-magenta to-brand-blue" }
];

export function calculateFramingGeometry(activeNatural, activeRatioConfig, isContainMode, zoom = 1, panX = 0, panY = 0, containerWidth = 320, containerHeight = 400) {
  const natW = activeNatural?.width || 1080;
  const natH = activeNatural?.height || 1080;
  const imgRatio = natW / natH;
  const boxRatio = activeRatioConfig.ratio;

  let baseW = containerWidth;
  let baseH = containerHeight;

  if (isContainMode) {
    if (imgRatio <= boxRatio) {
      baseH = containerHeight;
      baseW = containerHeight * imgRatio;
    } else {
      baseW = containerWidth;
      baseH = containerWidth / imgRatio;
    }
  } else {
    if (imgRatio <= boxRatio) {
      baseW = containerWidth;
      baseH = containerWidth / imgRatio;
    } else {
      baseH = containerHeight;
      baseW = containerHeight * imgRatio;
    }
  }

  const currentW = baseW * zoom;
  const currentH = baseH * zoom;
  const initialLeft = (containerWidth - currentW) / 2;
  const initialTop = (containerHeight - currentH) / 2;

  const canPanX = currentW > containerWidth;
  const canPanY = currentH > containerHeight;
  const maxPanX = canPanX ? (currentW - containerWidth) / 2 : 0;
  const maxPanY = canPanY ? (currentH - containerHeight) / 2 : 0;
  const effectivePanX = Math.max(-maxPanX, Math.min(maxPanX, panX || 0));
  const effectivePanY = Math.max(-maxPanY, Math.min(maxPanY, panY || 0));

  return {
    width: Math.round(currentW),
    height: Math.round(currentH),
    left: Math.round(initialLeft + effectivePanX),
    top: Math.round(initialTop + effectivePanY),
    canPanX,
    canPanY,
    minPanX: -maxPanX,
    maxPanX,
    minPanY: -maxPanY,
    maxPanY
  };
}

/**
 * Process all image items onto an offscreen canvas and upload to R2
 */
export async function processAndUploadFramedImages({
  imageItems,
  transformMap,
  activeRatioConfig,
  containerWidth,
  containerHeight,
  calendarioId,
  postId,
  mediaItems
}) {
  const processedFiles = [];

  for (let i = 0; i < imageItems.length; i++) {
    const item = imageItems[i];
    const key = item.id || String(i);
    const transform = transformMap[key] || {
      fitMode: "contain",
      bgType: "black",
      zoom: 1,
      panX: 0,
      panY: 0
    };

    let blobUrl = null;
    let storageKey = null;
    if (item.url && item.url.includes("calendarios/")) {
      storageKey = item.url.substring(item.url.indexOf("calendarios/")).split("?")[0];
    }

    try {
      const fetchUrl = storageKey
        ? `/api/r2-presigned-url?action=proxy&key=${encodeURIComponent(storageKey)}`
        : item.url;
      const imgBlob = await fetch(fetchUrl).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      });
      blobUrl = URL.createObjectURL(imgBlob);
    } catch (_) {
      blobUrl = item.url;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${item.nombre_archivo || i}`));
      img.src = blobUrl;
    });

    const targetW = activeRatioConfig.width;
    const targetH = activeRatioConfig.height;
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    if (transform.bgType === "blur") {
      const blurScale = Math.max(targetW / img.width, targetH / img.height) * 1.15;
      const blurW = img.width * blurScale;
      const blurH = img.height * blurScale;
      const blurX = (targetW - blurW) / 2;
      const blurY = (targetH - blurH) / 2;

      ctx.save();
      ctx.filter = "blur(40px) brightness(0.65)";
      ctx.drawImage(img, blurX, blurY, blurW, blurH);
      ctx.restore();
    } else if (transform.bgType === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
    } else {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const scaleFactor = targetW / containerWidth;
    const imgRatio = img.width / img.height;
    const boxRatio = activeRatioConfig.ratio;
    let baseW = containerWidth;
    let baseH = containerHeight;

    if (transform.fitMode === "contain") {
      if (imgRatio <= boxRatio) {
        baseH = containerHeight;
        baseW = containerHeight * imgRatio;
      } else {
        baseW = containerWidth;
        baseH = containerWidth / imgRatio;
      }
    } else {
      if (imgRatio <= boxRatio) {
        baseW = containerWidth;
        baseH = containerWidth / imgRatio;
      } else {
        baseH = containerHeight;
        baseW = containerHeight * imgRatio;
      }
    }

    const zoom = transform.zoom || 1;
    const currentW = baseW * zoom;
    const currentH = baseH * zoom;
    const initialX = (containerWidth - currentW) / 2;
    const initialY = (containerHeight - currentH) / 2;

    const maxPanX = currentW > containerWidth ? (currentW - containerWidth) / 2 : 0;
    const maxPanY = currentH > containerHeight ? (currentH - containerHeight) / 2 : 0;
    const effectivePanX = Math.max(-maxPanX, Math.min(maxPanX, transform.panX || 0));
    const effectivePanY = Math.max(-maxPanY, Math.min(maxPanY, transform.panY || 0));

    const finalX = (initialX + effectivePanX) * scaleFactor;
    const finalY = (initialY + effectivePanY) * scaleFactor;
    const finalW = currentW * scaleFactor;
    const finalH = currentH * scaleFactor;

    ctx.filter = "none";
    ctx.drawImage(img, finalX, finalY, finalW, finalH);

    if (blobUrl && blobUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (_) {}
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("No se pudo generar el blob del canvas"));
      }, "image/jpeg", 0.93);
    });

    const newFileName = `framed_${activeRatioConfig.id.replace("/", "x")}_${item.nombre_archivo || "foto.jpg"}`;
    const newFile = new File([blob], newFileName, { type: "image/jpeg" });
    newFile._alreadyCompressed = true;

    const uploadRes = await uploadMediaFile(calendarioId, newFile);
    if (!uploadRes.success || !uploadRes.data) {
      throw new Error(uploadRes.error || `No se pudo subir ${newFileName} a R2`);
    }
    processedFiles.push(uploadRes.data);
  }

  if (postId && supabase) {
    const videoItems = mediaItems.filter((m) => !imageItems.includes(m));
    const finalArchivos = [...videoItems, ...processedFiles];

    const { error: postUpdateErr } = await supabase
      .from("posts")
      .update({
        archivos: finalArchivos,
        estado: "programado",
        error_mensaje: null,
        reintentos: 0
      })
      .eq("id", postId);

    if (postUpdateErr) {
      throw new Error(`No se pudo actualizar la publicación: ${postUpdateErr.message}`);
    }

    const newIds = processedFiles.map((f) => f.id).filter(Boolean);
    const oldIds = imageItems.map((f) => f.id).filter(Boolean);
    if (newIds.length) {
      await supabase.from("archivos_galeria").update({ en_uso: true }).in("id", newIds);
    }
    if (oldIds.length) {
      await supabase.from("archivos_galeria").update({ en_uso: false }).in("id", oldIds);
    }
  }

  return processedFiles;
}

