import { useState, useEffect } from "react";
import {
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock,
  Film,
  Plus,
  Check,
  RefreshCw,
  Copy,
  Trash2,
  Sparkles,
  Layers,
  AlertCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { getArchivosByCalendario } from "@/services/calendarService";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import { useLongPress } from "@/hooks/useLongPress";

function GalleryFileItem({ file, isSelected, selectedIndex, tipoPost, onSelect, onPreview }) {
  const bindLongPress = useLongPress(
    () => onPreview(file),
    () => onSelect(file)
  );

  return (
    <div
      {...bindLongPress}
      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 group select-none ${
        isSelected
          ? "border-[#188ff0] ring-4 ring-blue-100 scale-[0.98]"
          : "border-gray-200 hover:border-blue-300 bg-gray-900"
      }`}
      title="Clic simple: Seleccionar • Mantener presionado: Vista previa"
    >
      {file.tipo === "video" ? (
        file.thumbnail_url ? (
          <img
            src={file.thumbnail_url}
            alt={file.nombre_archivo || "Media"}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <video
            src={file.url}
            muted
            preload="metadata"
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        )
      ) : (
        <img
          src={file.url}
          alt={file.nombre_archivo || "Media"}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Top-Left Order Badge / Check if Selected */}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-[#188ff0] text-white text-xs font-sora font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 pointer-events-none">
          {tipoPost === "carrousel" ? (
            selectedIndex + 1
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </div>
      )}

      {/* Top-Right Preview Eye Button (Desktop Hover shortcut) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview(file);
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20 shadow-md"
        title="Ver detalles de medio"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* Bottom-Left Format Indicator Badge */}
      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-sora font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs pointer-events-none">
        {file.tipo === "video" ? (
          <VideoIcon className="w-2.5 h-2.5 text-white" />
        ) : (
          <ImageIcon className="w-2.5 h-2.5 text-white" />
        )}
      </span>
    </div>
  );
}

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
  const today = new Date().toISOString().split("T")[0];
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

  // Form Submit Handler - Strict Mandatory Field Validation
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

    // Al completar todos los campos requeridos, el estado pasa automáticamente a "programado"
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-y-auto">
      {/* Modal Container: Flex Col with Fixed Header/Footer and Scrollable Form Body */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-xl w-full max-w-[calc(100vw-1.25rem)] my-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[88dvh] relative">
        
        {/* Fixed Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-gray-900 text-base sm:text-xl tracking-tight leading-tight">
                {isEditing ? "Editar Publicación" : "Programar Publicación"}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-1">
                Selecciona formato, copy, horario y asigna medios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="post-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 sm:space-y-6">
          {/* 1. TIPO DE FORMATO (TOGGLE SWITCH) */}
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-2">
              Formato de Publicación *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleFormatChange("reel")}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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

          {/* 2. FECHA, HORA Y ESTADO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" /> Fecha Programada *
              </label>
              <input
                type="date"
                required
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-blue" /> Hora <br />Programada *
              </label>
              <input
                type="time"
                required
                value={horaProgramada}
                onChange={(e) => setHoraProgramada(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                Estado <br />Publicación
              </label>
              {/* CLEAN SELECT OPTIONS WITH NO OS EMOJIS */}
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-gray-900 outline-none text-sm font-sora font-bold text-gray-900 bg-white cursor-pointer"
              >
                <option value="programado">Programado</option>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
          </div>

          {/* 3. CAPTION / COPYWRITING */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sora font-bold uppercase text-gray-700">
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
              className="w-full p-4 rounded-2xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium transition-all leading-relaxed"
            />
          </div>

          {/* 4. BANCO UNIFICADO DE MEDIOS DE GALERÍA */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <label className="text-xs font-sora font-bold uppercase text-gray-700 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-brand-blue" />
                Medios de Galería ({archivos.length} asignados / {availableGalleryFiles.length} disponibles) *
              </label>

              <div className="flex items-center gap-3">

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

            {loadingGallery ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Sparkles className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
                <p className="text-xs font-sora font-bold text-gray-600">
                  Cargando banco de medios...
                </p>
              </div>
            ) : availableGalleryFiles.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 max-h-64 overflow-y-auto">
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
        </form>

        {/* Fixed Modal Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 md:px-8 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="post-form"
            disabled={isSaving}
            className="h-11 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Publicación"
            ) : (
              "Programar Publicación"
            )}
          </button>
        </div>
      </div>

      {/* Media Detail Preview Modal */}
      {previewMedia && (
        <MediaDetailModal
          media={previewMedia}
          posts={post ? [post] : []}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </div>
  );
}
