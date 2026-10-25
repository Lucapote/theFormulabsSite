import { useState, useEffect, useMemo } from "react";
import {
  Video as VideoIcon,
  Calendar as CalendarIcon,
  Clock,
  Film,
  RefreshCw,
  Sparkles,
  Layers,
  Crop,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { getArchivosByCalendario } from "@/services/calendarService";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import GalleryFileItem from "@/components/dashboard/gallery/GalleryFileItem";
import MediaFramingModal from "@/components/dashboard/calendar/MediaFramingModal";
import { getLocalDateString } from "@/utils/formatters";

/**
 * PostModal
 * Modal dialog for scheduling and editing social media posts (Reels & Carousels).
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

  // Form states
  const today = getLocalDateString();
  const [tipoPost, setTipoPost] = useState("reel"); // 'reel' | 'carrousel'
  const [fechaProgramada, setFechaProgramada] = useState(today);
  const [horaProgramada, setHoraProgramada] = useState("18:00");
  const [caption, setCaption] = useState("");
  const [estado, setEstado] = useState("programado");
  const [archivos, setArchivos] = useState([]); // selected objects [{ id, url, tipo, nombre_archivo }]

  // Gallery files state
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [showFramingModal, setShowFramingModal] = useState(false);
  const [mediaRatios, setMediaRatios] = useState({}); // { [fileId]: { width, height, ratio, isValid } }

  // Detect and measure natural dimensions for assigned images (Instagram 4:5 [0.80] to 1.91:1)
  useEffect(() => {
    if (!archivos || archivos.length === 0) return;
    archivos.forEach((file) => {
      if (file.tipo === "video" || /\.(mp4|mov|webm)$/i.test(file.url || "")) return;
      if (mediaRatios[file.id]) return;

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        // Instagram allowed aspect ratios: between 4:5 (0.80) and 1.91:1 (1.91)
        const isValid = ratio >= 0.79 && ratio <= 1.93;
        setMediaRatios((prev) => ({
          ...prev,
          [file.id]: { width: w, height: h, ratio, isValid }
        }));
      };
      img.src = file.url;
    });
  }, [archivos, mediaRatios]);

  // Identify images with incompatible ratios for non-reels
  const invalidFiles = useMemo(() => {
    if (tipoPost === "reel") return [];
    return archivos.filter((file) => {
      if (file.tipo === "video" || /\.(mp4|mov|webm)$/i.test(file.url || "")) return false;
      const meta = mediaRatios[file.id];
      return meta && !meta.isValid;
    });
  }, [archivos, mediaRatios, tipoPost]);

  // Populate form on edit
  useEffect(() => {
    if (initialData) {
      setTipoPost(initialData.tipo_post || "reel");
      setFechaProgramada(initialData.fecha_programada || "");
      setHoraProgramada(initialData.hora_programada || "18:00");
      setCaption(initialData.caption || "");
      setEstado(initialData.estado || "programado");
      setArchivos(initialData.archivos || []);
    } else {
      setTipoPost("reel");
      setFechaProgramada("");
      setHoraProgramada("18:00");
      setCaption("");
      setEstado("programado");
      setArchivos([]);
    }
  }, [initialData, isOpen]);

  // Load gallery files whenever modal opens or calendar ID changes
  useEffect(() => {
    if (isOpen && calendarioId) {
      loadGalleryFiles();
    }
  }, [isOpen, calendarioId]);

  const loadGalleryFiles = async () => {
    if (!calendarioId) return;
    setLoadingGallery(true);
    const res = await getArchivosByCalendario(calendarioId);
    if (res.success) {
      setGalleryFiles(res.data || []);
    } else {
      toast.error(res.error || "No se pudo cargar la galería.");
    }
    setLoadingGallery(false);
  };

  // Direct toggle selection from inline gallery grid
  const handleToggleFileSelection = (file) => {
    if (tipoPost === "reel") {
      if (file.tipo !== "video") {
        toast.error("Para formato Reel solo se permite seleccionar 1 archivo de Video.");
        return;
      }
      const isAlreadySelected = archivos.some((a) => a.id === file.id);
      if (isAlreadySelected) {
        setArchivos([]);
      } else {
        setArchivos([file]);
      }
    } else {
      const existingIdx = archivos.findIndex((item) => item.id === file.id);
      if (existingIdx !== -1) {
        setArchivos(archivos.filter((item) => item.id !== file.id));
      } else {
        setArchivos([...archivos, file]);
      }
    }
  };

  // Filter available gallery files (unassigned or assigned to this post, filtered by active format)
  const selectedIds = (archivos || []).map((a) => a.id);
  const availableGalleryFiles = (galleryFiles || []).filter((file) => {
    const isAvailable = !file.en_uso || selectedIds.includes(file.id);
    if (!isAvailable) return false;

    // Filter by format: Reel requires video files only
    if (tipoPost === "reel" && file.tipo !== "video") return false;

    return true;
  });

  // Remove individual file from preview
  const handleRemoveFile = (fileId) => {
    setArchivos(archivos.filter((a) => a.id !== fileId));
  };

  // Switch format type handler
  const handleFormatChange = (newType) => {
    if (newType === tipoPost) return;
    setTipoPost(newType);

    if (newType === "reel") {
      const videos = archivos.filter((a) => a.tipo === "video");
      setArchivos(videos.slice(0, 1));
    }
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fechaProgramada) {
      toast.error("Por favor selecciona la fecha programada (obligatoria).");
      return;
    }

    if (!horaProgramada) {
      toast.error("Por favor ingresa la hora programada (obligatoria).");
      return;
    }

    if (!caption || !caption.trim()) {
      toast.error("Por favor ingresa el copywriting / texto de la publicación (obligatorio).");
      return;
    }

    if (!archivos || archivos.length === 0) {
      toast.error("Por favor asigna al menos 1 archivo del banco de medios (obligatorio).");
      return;
    }

    if (tipoPost === "reel" && archivos[0]?.tipo !== "video") {
      toast.error("Para formato Reel el archivo asignado debe ser un Video.");
      return;
    }

    // Interceptar si hay imágenes con ratios incompatibles con Instagram
    if (tipoPost !== "reel" && invalidFiles.length > 0) {
      toast.warning(
        `Hay ${invalidFiles.length} imagen(es) con formato incompatible con Instagram. Por favor encuádralas antes de programar.`,
        { duration: 4000 }
      );
      setShowFramingModal(true);
      return;
    }

    const finalEstado = estado === "borrador" ? "programado" : estado;

    onSave({
      id: initialData?.id,
      calendario_id: calendarioId,
      tipo_post: tipoPost,
      caption: caption.trim(),
      fecha_programada: fechaProgramada,
      hora_programada: horaProgramada,
      archivos,
      estado: finalEstado,
      archivosAnteriores: initialData?.archivos || []
    });
  };

  return (
    <>
      <BaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        eyebrow="GESTIÓN DE PUBLICACIÓN"
        eyebrowColor="text-brand-magenta"
        icon={Film}
        title={isEditing ? "Editar Publicación" : "Programar Publicación"}
        description="Selecciona formato, copy, horario y asigna medios de la galería."
        maxWidth="max-w-xl"
        cancelText="Cancelar"
        submitText={isEditing ? "Guardar Cambios" : "Programar Publicación"}
        loadingText="Guardando..."
        isLoading={isSaving}
      >
        <div className="space-y-5 sm:space-y-6">
          {/* TIPO DE FORMATO */}
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-2">
              Formato de Publicación *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleFormatChange("reel")}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  tipoPost === "reel"
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <VideoIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tipoPost === "reel" ? "text-pink-400" : "text-gray-400"}`} />
                <span className="truncate">Reel (1 Video)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange("carrousel")}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  tipoPost === "carrousel"
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tipoPost === "carrousel" ? "text-brand-blue" : "text-gray-400"}`} />
                <span className="truncate">Carrusel (Múltiple)</span>
              </button>
            </div>
          </div>

          {/* FECHA, HORA Y ESTADO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" /> Fecha Programada *
              </label>
              <input
                type="date"
                required
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-gray-900 font-medium bg-gray-50/50 transition-all cursor-pointer font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-blue" /> Hora Programada *
              </label>
              <input
                type="time"
                required
                value={horaProgramada}
                onChange={(e) => setHoraProgramada(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-gray-900 font-medium bg-gray-50/50 transition-all cursor-pointer font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5">
                Estado Publicación
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-xs font-sora font-semibold text-gray-900 bg-gray-50/50 cursor-pointer transition-all"
              >
                <option value="programado">Programado</option>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
          </div>

          {/* CAPTION / COPYWRITING */}
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

          {/* BANCO UNIFICADO DE MEDIOS DE GALERÍA */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <label className="text-xs font-sora font-bold uppercase text-gray-700 tracking-wide flex items-center gap-1.5">
                <Film className="w-4 h-4 text-brand-blue" />
                Medios de Galería ({archivos.length} asignados / {availableGalleryFiles.length} disponibles) *
              </label>

              <div className="flex items-center gap-2">
                {archivos.some((a) => a.tipo !== "video") && (
                  <button
                    type="button"
                    onClick={() => setShowFramingModal(true)}
                    className={`h-8 px-3 rounded-full border font-sora font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] transition-all ${
                      invalidFiles.length > 0
                        ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse"
                        : "bg-gradient-to-r from-pink-50 to-blue-50 border-blue-200 text-brand-blue hover:text-blue-700"
                    }`}
                    title="Ajustar y encuadrar imágenes para Instagram (1:1 o 4:5)"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{invalidFiles.length > 0 ? "Requiere Encuadre" : "Encuadre Instagram"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={loadGalleryFiles}
                  disabled={loadingGallery}
                  className="text-[11px] font-sora font-bold text-[#188ff0] hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                  title="Recargar archivos de la galería"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingGallery ? "animate-spin" : ""}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* AVISO PREVENTIVO DE RATIOS INCOMPATIBLES CON INSTAGRAM */}
            {invalidFiles.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-sora font-bold text-amber-900">
                    Proporción no soportada por Meta ({invalidFiles.length} imagen{invalidFiles.length > 1 ? "es" : ""})
                  </p>
                  <p className="text-amber-700 font-inter text-[11px] mt-0.5 leading-snug">
                    Instagram solo admite proporciones entre 4:5 (vertical) y 1.91:1 (horizontal). Encuadra a 4:5 o 1:1 para evitar rechazos de publicación.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFramingModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sora font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                >
                  Encuadrar ahora
                </button>
              </div>
            )}

            {loadingGallery ? (
              <div className="p-8 text-center bg-gray-50/70 rounded-2xl border border-gray-100">
                <Sparkles className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
                <p className="text-xs font-sora font-bold text-gray-600">
                  Cargando banco de medios...
                </p>
              </div>
            ) : availableGalleryFiles.length === 0 ? (
              <div className="p-6 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                <Film className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-sora font-bold text-gray-700">
                  {tipoPost === "reel"
                    ? "No hay videos disponibles en la galería"
                    : "No hay archivos disponibles en la galería"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {tipoPost === "reel"
                    ? "El formato Reel requiere archivos de video. Sube un video en la pestaña Galería para seleccionarlo aquí."
                    : "Sube imágenes o videos en la pestaña Galería de este cliente para poder seleccionarlos aquí."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-100 max-h-64 overflow-y-auto">
                {availableGalleryFiles.map((file) => {
                  const selectedIndex = archivos.findIndex((item) => item.id === file.id);
                  const isSelected = selectedIndex !== -1;

                  return (
                    <GalleryFileItem
                      key={file.id}
                      file={file}
                      isSelected={isSelected}
                      selectedIndex={selectedIndex}
                      tipoPost={tipoPost}
                      onSelect={(f) => handleToggleFileSelection(f)}
                      onPreview={(f) => setPreviewMedia(f)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </BaseFormModal>

      {/* Modal de Encuadre y Recorte Instagram */}
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

      {/* Lightbox details modal */}
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
