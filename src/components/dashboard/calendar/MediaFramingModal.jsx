import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import FramingViewport from "./subcomponents/FramingViewport";
import FramingControls from "./subcomponents/FramingControls";
import { useFramingGestures } from "@/hooks/useFramingGestures";
import {
  ASPECT_RATIOS,
  calculateFramingGeometry,
  processAndUploadFramedImages
} from "@/utils/canvasFramingHelper";

/**
 * MediaFramingModal
 * Modal interactivo con viewport de encuadre real (cámara sobre imagen completa)
 * compatible al 100% con los estándares de Meta Graph API.
 */
export default function MediaFramingModal({
  isOpen,
  onClose,
  mediaItems = [],
  calendarioId,
  postId = null,
  onFramingComplete
}) {
  const [selectedRatioId, setSelectedRatioId] = useState("4/5");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [naturalDimensions, setNaturalDimensions] = useState({});
  const [transformMap, setTransformMap] = useState({});

  const imageItems = mediaItems.filter(
    (m) => m.tipo !== "video" && !/\.(mp4|mov|webm)$/i.test(m.url || "")
  );
  const activeItem = imageItems[activeSlideIndex] || imageItems[0] || null;
  const activeKey = activeItem ? activeItem.id || String(activeSlideIndex) : "0";

  const currentTransform = transformMap[activeKey] || {
    fitMode: "contain",
    bgType: "black",
    zoom: 1,
    panX: 0,
    panY: 0
  };

  const isContainMode = currentTransform.fitMode === "contain";
  const activeRatioConfig =
    ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || ASPECT_RATIOS[0];

  const containerWidth = 320;
  const containerHeight = Math.round(containerWidth / activeRatioConfig.ratio);

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

  const geometry = useMemo(() => {
    return calculateFramingGeometry(
      activeNatural,
      activeRatioConfig,
      isContainMode,
      currentTransform.zoom || 1,
      currentTransform.panX || 0,
      currentTransform.panY || 0,
      containerWidth,
      containerHeight
    );
  }, [
    activeNatural,
    activeRatioConfig,
    isContainMode,
    currentTransform.zoom,
    currentTransform.panX,
    currentTransform.panY,
    containerWidth,
    containerHeight
  ]);

  const updateCurrentTransform = useCallback(
    (partial) => {
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
          ...partial
        }
      }));
    },
    [activeKey]
  );

  const {
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useFramingGestures({
    geometry,
    currentTransform,
    updateCurrentTransform
  });

  const handleSetFitMode = (mode) => {
    updateCurrentTransform({ fitMode: mode, panX: 0, panY: 0, zoom: 1 });
  };

  const handleResetSlide = () => {
    updateCurrentTransform({
      fitMode: "contain",
      bgType: "black",
      zoom: 1,
      panX: 0,
      panY: 0
    });
  };

  const handleApplyFraming = async (e) => {
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
      const processedFiles = await processAndUploadFramedImages({
        imageItems,
        transformMap,
        activeRatioConfig,
        containerWidth,
        containerHeight,
        calendarioId,
        postId,
        mediaItems
      });

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
      className="h-[95vh] max-h-[95vh]"
      bodyClassName="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto min-h-0"
    >
      <FramingControls
        selectedRatioId={selectedRatioId}
        setSelectedRatioId={setSelectedRatioId}
        isContainMode={isContainMode}
        handleSetFitMode={handleSetFitMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        handleResetSlide={handleResetSlide}
        currentTransform={currentTransform}
        updateCurrentTransform={updateCurrentTransform}
        imageItems={imageItems}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
      />

      <FramingViewport
        containerRef={containerRef}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        geometry={geometry}
        activeItem={activeItem}
        currentTransform={currentTransform}
        showGrid={showGrid}
        handleMouseDown={handleMouseDown}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />
    </BaseFormModal>
  );
}
