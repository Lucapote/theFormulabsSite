import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ZoomIn,
  Move,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Grid3X3,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2
} from "lucide-react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { uploadMediaFile } from "@/services/calendarService";
import { supabase } from "@/lib/supabase";

const ASPECT_RATIOS = [
  { id: "4/5", label: "4:5 Retrato (Instagram)", width: 1080, height: 1350, ratio: 4 / 5, desc: "Máxima visibilidad en el feed" },
  { id: "1/1", label: "1:1 Cuadrado", width: 1080, height: 1080, ratio: 1, desc: "Estándar clásico de cuadrícula" },
  { id: "1.91/1", label: "1.91:1 Horizontal", width: 1080, height: 566, ratio: 1.91, desc: "Formato apaisado" }
];

const BACKGROUND_OPTIONS = [
  { id: "black", label: "Negro", colorClass: "bg-black border border-gray-600" },
  { id: "white", label: "Blanco", colorClass: "bg-white border border-gray-300" },
  { id: "blur", label: "Blur / Difuminado", colorClass: "bg-gradient-to-tr from-pink-500 to-blue-500" }
];

/**
 * MediaFramingModal
 * Modal interactivo con viewport de encuadre real (cámara sobre imagen completa)
 * compatible al 100% con los estándares de Meta Graph API.
 */
export default function MediaFramingModal({
  isOpen,
  onClose,
  mediaItems = [], // Array de objetos { id, url, tipo, nombre_archivo }
  calendarioId,
  postId = null,
  onFramingComplete
}) {
  const [selectedRatioId, setSelectedRatioId] = useState("4/5");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Registro de dimensiones naturales por URL: { [url]: { width, height } }
  const [naturalDimensions, setNaturalDimensions] = useState({});

  // Estado por diapositiva: { fitMode: 'contain' | 'cover', bgType: 'black' | 'white' | 'blur', zoom: 1, panX: 0, panY: 0 }
  const [transformMap, setTransformMap] = useState({});

  // Filtrar solo imágenes
  const imageItems = mediaItems.filter((m) => m.tipo !== "video" && !/\.(mp4|mov|webm)$/i.test(m.url || ""));
  const activeItem = imageItems[activeSlideIndex] || imageItems[0] || null;
  const activeKey = activeItem ? (activeItem.id || String(activeSlideIndex)) : "0";

  const currentTransform = transformMap[activeKey] || {
    fitMode: "contain",
    bgType: "black",
    zoom: 1,
    panX: 0,
    panY: 0
  };

  const isContainMode = currentTransform.fitMode === "contain";
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const activeRatioConfig = ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || ASPECT_RATIOS[0];

  // Dimensiones del visor en pantalla (320px de ancho en desktop, 260px en móviles)
  const containerWidth = 320;
  const containerHeight = Math.round(containerWidth / activeRatioConfig.ratio);

  // Cargar dimensiones naturales de la imagen activa si aún no se tienen
  useEffect(() => {
    if (!activeItem?.url) return;
    if (naturalDimensions[activeItem.url]) return;

    const img = new Image();
    img.onload = () => {
      setNaturalDimensions((prev) => ({
        ...prev,
        [activeItem.url]: { width: img.naturalWidth, height: img.naturalHeight }
      }));
    };
    img.src = activeItem.url;
  }, [activeItem?.url, naturalDimensions]);

  const activeNatural = activeItem?.url ? naturalDimensions[activeItem.url] : null;

  // Cálculo matemático del tamaño y posición de la imagen en el viewport
  const geometry = useMemo(() => {
    const natW = activeNatural?.width || 1080;
    const natH = activeNatural?.height || 1080;
    const imgRatio = natW / natH;
    const boxRatio = activeRatioConfig.ratio; // W / H

    let baseW = containerWidth;
    let baseH = containerHeight;

    if (isContainMode) {
      if (imgRatio <= boxRatio) {
        // Imagen más alta que el marco (ej. tubo 0.428 < 0.8) -> Encaja verticalmente
        baseH = containerHeight;
        baseW = containerHeight * imgRatio;
      } else {
        // Imagen más ancha que el marco -> Encaja horizontalmente
        baseW = containerWidth;
        baseH = containerWidth / imgRatio;
      }
    } else {
      // Modo COVER (Rellenar marco completo)
      if (imgRatio <= boxRatio) {
        // Imagen más alta -> Llena el ancho completo y desborda en altura
        baseW = containerWidth;
        baseH = containerWidth / imgRatio;
      } else {
        // Imagen más ancha -> Llena la altura completa y desborda en ancho
        baseH = containerHeight;
        baseW = containerHeight * imgRatio;
      }
    }

    const zoom = currentTransform.zoom || 1;
    const currentW = baseW * zoom;
    const currentH = baseH * zoom;

    // Centrado inicial
    const initialX = (containerWidth - currentW) / 2;
    const initialY = (containerHeight - currentH) / 2;

    // Límites de paneo (clamping)
    let maxPanX = 0;
    let minPanX = 0;
    if (currentW > containerWidth) {
      maxPanX = (currentW - containerWidth) / 2;
      minPanX = -maxPanX;
    }

    let maxPanY = 0;
    let minPanY = 0;
    if (currentH > containerHeight) {
      maxPanY = (currentH - containerHeight) / 2;
      minPanY = -maxPanY;
    }

    // Paneo efectivo acotado dentro de los bordes
    const rawPanX = currentTransform.panX || 0;
    const rawPanY = currentTransform.panY || 0;
    const effectivePanX = Math.max(minPanX, Math.min(maxPanX, rawPanX));
    const effectivePanY = Math.max(minPanY, Math.min(maxPanY, rawPanY));

    const finalX = initialX + effectivePanX;
    const finalY = initialY + effectivePanY;

    return {
      width: currentW,
      height: currentH,
      left: finalX,
      top: finalY,
      canPanX: currentW > containerWidth,
      canPanY: currentH > containerHeight,
      minPanX,
      maxPanX,
      minPanY,
      maxPanY
    };
  }, [activeNatural, activeRatioConfig.ratio, isContainMode, currentTransform.zoom, currentTransform.panX, currentTransform.panY]);

  const updateCurrentTransform = useCallback((updates) => {
    setTransformMap((prev) => ({
      ...prev,
      [activeKey]: {
        ...(prev[activeKey] || {
          fitMode: "contain",
          bgType: "black",
          zoom: 1,
          panX: 0,
          panY: 0
        }),
        ...updates
      }
    }));
  }, [activeKey]);

  // Cambiar modo con control segmentado y resetear paneo
  const handleSetFitMode = (mode) => {
    updateCurrentTransform({
      fitMode: mode,
      panX: 0,
      panY: 0,
      zoom: 1
    });
  };

  // Reset transform
  const handleResetSlide = () => {
    setTransformMap((prev) => ({
      ...prev,
      [activeKey]: {
        fitMode: "contain",
        bgType: "black",
        zoom: 1,
        panX: 0,
        panY: 0
      }
    }));
  };

  // Manejo de arrastre (Pan) con viewport libre y límites elásticos
  const handleMouseDown = (e) => {
    if (!geometry.canPanX && !geometry.canPanY) return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: currentTransform.panX || 0, y: currentTransform.panY || 0 };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const nextX = panStartRef.current.x + deltaX;
    const nextY = panStartRef.current.y + deltaY;

    updateCurrentTransform({
      panX: geometry.canPanX ? Math.max(geometry.minPanX, Math.min(geometry.maxPanX, nextX)) : 0,
      panY: geometry.canPanY ? Math.max(geometry.minPanY, Math.min(geometry.maxPanY, nextY)) : 0
    });
  }, [geometry, updateCurrentTransform]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (!geometry.canPanX && !geometry.canPanY) return;
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { x: currentTransform.panX || 0, y: currentTransform.panY || 0 };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const nextX = panStartRef.current.x + deltaX;
    const nextY = panStartRef.current.y + deltaY;

    updateCurrentTransform({
      panX: geometry.canPanX ? Math.max(geometry.minPanX, Math.min(geometry.maxPanX, nextX)) : 0,
      panY: geometry.canPanY ? Math.max(geometry.minPanY, Math.min(geometry.maxPanY, nextY)) : 0
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Renderizar y exportar canvas para cada imagen procesada usando Proxy seguro
  const handleApplyFraming = async (e) => {
    // BaseFormModal envuelve el contenido en un <form> nativo: sin esto el navegador recarga la página
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
    if (isProcessing) return;

    if (!calendarioId) {
      toast.error("calendarioId requerido para procesar archivos.");
      return;
    }
    if (imageItems.length === 0) {
      onClose();
      return;
    }

    setIsProcessing(true);
    toast.loading("Procesando y optimizando encuadre para Instagram...", { id: "crop-progress" });

    try {
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

        // 1. Obtener imagen a través del proxy seguro
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
        } catch (fetchErr) {
          blobUrl = item.url;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${item.nombre_archivo || i}`));
          img.src = blobUrl;
        });

        // 2. Dimensiones de destino para Instagram
        const targetW = activeRatioConfig.width;
        const targetH = activeRatioConfig.height;
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        // 3. Dibujar Fondo según bgType
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

        // 4. Proyección matemática exacta de pantalla al canvas
        const scaleFactor = targetW / containerWidth;

        // Recalcular geometría de la imagen actual
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

        // 5. Exportar como JPEG de alta fidelidad
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error("No se pudo generar el blob del canvas"));
          }, "image/jpeg", 0.93);
        });

        const newFileName = `framed_${activeRatioConfig.id.replace("/", "x")}_${item.nombre_archivo || "foto.jpg"}`;
        const newFile = new File([blob], newFileName, { type: "image/jpeg" });
        // Ya optimizado en canvas a la resolución exacta de Meta: evitar recompresión/redimensionado
        newFile._alreadyCompressed = true;

        // Subir a Cloudflare R2
        const uploadRes = await uploadMediaFile(calendarioId, newFile);
        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || `No se pudo subir ${newFileName} a R2`);
        }
        processedFiles.push(uploadRes.data);
      }

      // Si el post ya existía en la BD, actualizar inmediatamente sus archivos y limpiar error
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

        // Sincronizar banco de medios: nuevos encuadres en uso, originales liberados
        const newIds = processedFiles.map((f) => f.id).filter(Boolean);
        const oldIds = imageItems.map((f) => f.id).filter(Boolean);
        if (newIds.length) {
          await supabase.from("archivos_galeria").update({ en_uso: true }).in("id", newIds);
        }
        if (oldIds.length) {
          await supabase.from("archivos_galeria").update({ en_uso: false }).in("id", oldIds);
        }
      }

      toast.success("¡Encuadre optimizado y guardado con éxito!", { id: "crop-progress" });
      if (onFramingComplete) {
        onFramingComplete(processedFiles);
      }
      onClose();
    } catch (err) {
      console.error("Error aplicando encuadre:", err);
      toast.error(`Error al procesar imágenes: ${err.message}`, { id: "crop-progress" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleApplyFraming}
      eyebrow="ENCUADRE QUIRÚRGICO META"
      eyebrowColor="text-brand-magenta"
      title="Encuadre y Proporción Instagram"
      description="Adapta tus fotos y carruseles al estándar oficial de Meta (4:5 o 1:1) sin cortar el contenido importante."
      maxWidth="max-w-2xl"
      cancelText="Cancelar"
      submitText={isProcessing ? "Guardando..." : `Guardar Encuadre (${imageItems.length})`}
      loadingText="Procesando imágenes..."
      isLoading={isProcessing}
      isSubmitDisabled={isProcessing || !activeItem}
      className="h-[94vh] max-h-[94vh]"
      bodyClassName="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto"
    >
      {/* 1. SELECTOR DE FORMATO MAESTRO */}
      <div className="space-y-1.5">
        <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider block">
          1. Proporción Maestra para Instagram
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedRatioId === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => setSelectedRatioId(ratio.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-0.5 ${
                  isSelected
                    ? "border-brand-blue bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sora font-bold text-xs text-gray-900">
                    {ratio.label}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-brand-blue" />}
                </div>
                <span className="text-[10px] font-inter text-gray-500">
                  {ratio.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MODO Y ÁREA DE VISOR INTERACTIVO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider block">
            2. Modo y Encuadre
          </label>

          {/* CONTROL SEGMENTADO ÚNICO Y CLARO: AJUSTAR VS RELLENAR */}
          <div className="bg-gray-100 p-0.5 rounded-full border border-gray-200 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSetFitMode("contain")}
              className={`h-7 px-3 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isContainMode
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Minimize2 className="w-3 h-3 text-pink-400" />
              <span>Ajustar (100% visible)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetFitMode("cover")}
              className={`h-7 px-3 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isContainMode
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Maximize2 className="w-3 h-3 text-brand-blue" />
              <span>Rellenar (Cubrir)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                showGrid ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200"
              }`}
              title="Alternar cuadrícula de tercios"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetSlide}
              className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Restablecer posición, escala y fondo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL VISOR TIPO INSTAGRAM (VIEWPORT REAL) */}
        <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-gray-200 shadow-inner">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`
            }}
            className={`relative overflow-hidden select-none rounded-xl transition-colors ${
              geometry.canPanX || geometry.canPanY
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default"
            } ${
              currentTransform.bgType === "white"
                ? "bg-white"
                : currentTransform.bgType === "blur"
                ? "bg-slate-900"
                : "bg-black"
            }`}
          >
            {/* Fondo Desenfoque (Blur) si está seleccionado */}
            {activeItem && currentTransform.bgType === "blur" && (
              <img
                src={activeItem.url}
                alt="Fondo Blur"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70 pointer-events-none"
              />
            )}

            {/* Imagen Principal con Geometría Real y Pan sin recorte en bloque */}
            {activeItem ? (
              <img
                src={activeItem.url}
                alt="Encuadre"
                draggable={false}
                style={{
                  position: "absolute",
                  left: `${geometry.left}px`,
                  top: `${geometry.top}px`,
                  width: `${geometry.width}px`,
                  height: `${geometry.height}px`,
                  maxWidth: "none",
                  maxHeight: "none"
                }}
                className="pointer-events-none select-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                <AlertCircle className="w-6 h-6 mb-1 text-gray-600" />
                <span>No hay imágenes seleccionadas</span>
              </div>
            )}

            {/* Cuadrícula de tercios superpuesta */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div />
              </div>
            )}

            {/* Indicador de arrastre / encuadre */}
            <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full pointer-events-none flex items-center gap-1">
              {geometry.canPanX || geometry.canPanY ? (
                <>
                  <Move className="w-3 h-3 text-brand-blue" /> Arrastra para encuadrar
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> 100% visible
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTROLES DE FONDO Y ZOOM */}
        <div className="space-y-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
          {/* SELECTOR DE FONDO: Siempre visible en modo Ajustar */}
          {isContainMode && (
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-200/60 flex-wrap">
              <span className="text-[11px] font-sora font-bold text-gray-700 uppercase tracking-wide">
                Fondo de Márgenes:
              </span>
              <div className="flex items-center gap-1.5">
                {BACKGROUND_OPTIONS.map((bg) => {
                  const isSelected = (currentTransform.bgType || "black") === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => updateCurrentTransform({ bgType: bg.id })}
                      className={`h-7 px-2.5 rounded-full text-xs font-sora font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900 shadow-xs ring-2 ring-gray-900/10"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${bg.colorClass}`} />
                      <span className="text-[11px]">{bg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slider de Zoom ampliado (0.5x a 3.0x) */}
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs font-sora font-semibold text-gray-600 shrink-0">Zoom:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={currentTransform.zoom || 1}
              onChange={(e) => updateCurrentTransform({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
            <span className="text-xs font-mono font-bold text-gray-700 w-12 text-right">
              {(currentTransform.zoom || 1).toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* 3. TIRA DE DIAPOSITIVAS DEL CARRUSEL */}
      {imageItems.length > 1 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-blue" />
              Diapositivas ({imageItems.length})
            </span>
            <span className="text-[11px] font-inter text-gray-400">
              Personaliza cada imagen por separado
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {imageItems.map((item, idx) => {
              const isCurrent = activeSlideIndex === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative cursor-pointer ${
                    isCurrent
                      ? "border-brand-blue scale-105 shadow-md ring-2 ring-blue-500/20"
                      : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={item.url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-mono font-bold px-1 rounded">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </BaseFormModal>
  );
}
