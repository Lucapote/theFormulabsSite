import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { getArchivosByCalendario } from "@/services/calendarService";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import MediaFramingModal from "@/components/dashboard/calendar/MediaFramingModal";
import { getLocalDateString } from "@/utils/formatters";
import { canSaveWithoutMedia, getPostStatusMeta } from "@/utils/postStatusHelpers";
import { useMediaRatios } from "@/hooks/useMediaRatios";
import PostModalClientFeedbackBanner from "./subcomponents/PostModalClientFeedbackBanner";
import PostModalMediaGalleryPicker from "./subcomponents/PostModalMediaGalleryPicker";
import PostModalScheduleFields from "./subcomponents/PostModalScheduleFields";

/**
 * PostModal
 * Diálogo modal para programar y editar publicaciones (Reels y Carruseles).
 * Estandarizado sobre BaseFormModal con alto estático de 95vh según GEMINI.md.
 */
export default function PostModal({
  isOpen,
  onClose,
  onSave,
  calendarioId,
  initialData = null,
  isSaving = false
}) {
  const isEditing = Boolean(initialData?.id);
  const today = getLocalDateString();
  const [tipoPost, setTipoPost] = useState("reel");
  const [fechaProgramada, setFechaProgramada] = useState(today);
  const [horaProgramada, setHoraProgramada] = useState("18:00");
  const [caption, setCaption] = useState("");
  const [estado, setEstado] = useState("sin_empezar");
  const [archivos, setArchivos] = useState([]);
  const [observacionesDescartadas, setObservacionesDescartadas] = useState(false);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [showFramingModal, setShowFramingModal] = useState(false);
  const { invalidFiles } = useMediaRatios(archivos, tipoPost);

  useEffect(() => {
    setObservacionesDescartadas(false);
    if (initialData) {
      setTipoPost(initialData.tipo_post || "reel");
      setFechaProgramada(initialData.fecha_programada || "");
      setHoraProgramada(initialData.hora_programada || "18:00");
      setCaption(initialData.caption || "");
      setEstado(initialData.estado || "sin_empezar");
      setArchivos(initialData.archivos || []);
    } else {
      setTipoPost("reel");
      setFechaProgramada("");
      setHoraProgramada("18:00");
      setCaption("");
      setEstado("sin_empezar");
      setArchivos([]);
    }
  }, [initialData, isOpen]);

  const loadGalleryFiles = async () => {
    if (!calendarioId) return;
    setLoadingGallery(true);
    try {
      const res = await getArchivosByCalendario(calendarioId);
      if (res.success) {
        setGalleryFiles(res.data || []);
      }
    } catch {
      toast.error("Error al cargar archivos de galería");
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (isOpen && calendarioId) {
      loadGalleryFiles();
    }
  }, [isOpen, calendarioId]);

  const availableGalleryFiles = useMemo(() => {
    if (tipoPost === "reel") {
      return galleryFiles.filter(
        (f) => f.tipo === "video" || /\.(mp4|mov|webm)$/i.test(f.url || "")
      );
    }
    return galleryFiles;
  }, [galleryFiles, tipoPost]);

  const handleToggleFileSelection = (file) => {
    if (tipoPost === "reel") {
      setArchivos([file]);
    } else {
      const exists = archivos.some((item) => item.id === file.id);
      if (exists) {
        setArchivos(archivos.filter((item) => item.id !== file.id));
      } else {
        setArchivos([...archivos, file]);
      }
    }
  };

  const handleFormatChange = (newFormat) => {
    setTipoPost(newFormat);
    if (newFormat === "reel") {
      const firstVideo = archivos.find(
        (a) => a.tipo === "video" || /\.(mp4|mov|webm)$/i.test(a.url || "")
      );
      setArchivos(firstVideo ? [firstVideo] : []);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fechaProgramada) {
      toast.error("Selecciona la fecha programada");
      return;
    }
    if (!canSaveWithoutMedia(estado) && archivos.length === 0) {
      toast.error(
        `El estado "${getPostStatusMeta(estado).label}" requiere al menos un archivo multimedia asignado.`
      );
      return;
    }

    const payload = {
      tipo_post: tipoPost,
      fecha_programada: fechaProgramada,
      hora_programada: horaProgramada || "18:00",
      caption,
      estado,
      archivos
    };

    if (observacionesDescartadas || estado !== "en_edicion") {
      payload.notas_cambios = null;
      payload.fecha_cambios = null;
    }

    onSave(payload);
  };

  return (
    <>
      <BaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={isEditing ? "Editar Publicación" : "Programar Nueva Publicación"}
        description="Define el formato, texto y archivos multimedia para este post"
        maxWidth="max-w-3xl"
        className="h-[95vh] max-h-[95vh]"
        bodyClassName="p-4 sm:p-6 space-y-5"
        submitText={isSaving ? "Guardando..." : isEditing ? "Actualizar Post" : "Programar Post"}
        isLoading={isSaving}
        isSubmitDisabled={isSaving}
      >
        <div className="space-y-5 sm:space-y-6">
          {/* Banner de Observaciones del Cliente */}
          {initialData?.notas_cambios && estado === "en_edicion" && !observacionesDescartadas && (
            <PostModalClientFeedbackBanner
              notasCambios={initialData.notas_cambios}
              fechaCambios={initialData.fecha_cambios}
              onDismiss={() => setObservacionesDescartadas(true)}
            />
          )}

          {/* Campos de Formato, Fecha, Hora y Estado */}
          <PostModalScheduleFields
            tipoPost={tipoPost}
            onFormatChange={handleFormatChange}
            fechaProgramada={fechaProgramada}
            onFechaChange={setFechaProgramada}
            horaProgramada={horaProgramada}
            onHoraChange={setHoraProgramada}
            estado={estado}
            onEstadoChange={setEstado}
          />

          {/* Caption / Copywriting */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sora font-bold uppercase text-gray-700 tracking-wide">
                Caption / Copywriting del Post *
              </label>
              <span className="text-[11px] font-mono text-gray-400">
                {caption.length} / 2200 car.
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Escribe el texto de la publicación, hashtags y llamadas a la acción..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all leading-relaxed font-inter"
            />
          </div>

          {/* Selector de Medios de Galería */}
          <PostModalMediaGalleryPicker
            tipoPost={tipoPost}
            estado={estado}
            archivos={archivos}
            availableGalleryFiles={availableGalleryFiles}
            invalidFiles={invalidFiles}
            loadingGallery={loadingGallery}
            onOpenFraming={() => setShowFramingModal(true)}
            onReloadGallery={loadGalleryFiles}
            onToggleSelection={handleToggleFileSelection}
            onPreviewMedia={setPreviewMedia}
          />
        </div>
      </BaseFormModal>

      {/* Modal de Encuadre Instagram */}
      {showFramingModal && (
        <MediaFramingModal
          isOpen={showFramingModal}
          onClose={() => setShowFramingModal(false)}
          mediaItems={archivos}
          calendarioId={calendarioId}
          postId={initialData?.id}
          onFramingComplete={(processedFiles) => {
            const videoFiles = archivos.filter((a) => a.tipo === "video");
            setArchivos([...videoFiles, ...processedFiles]);
            loadGalleryFiles();
          }}
        />
      )}

      {/* Lightbox Preview */}
      {previewMedia && (
        <MediaDetailModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
          showDelete={false}
        />
      )}
    </>
  );
}
