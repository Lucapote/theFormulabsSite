import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Sparkles,
  Filter,
  X,
  Play,
  Film,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  getArchivosByCalendario,
  uploadMediaFile,
  deleteArchivo
} from "@/services/calendarService";
import { compressMediaFile, formatBytes } from "@/utils/mediaCompressor";
import { useUpload } from "@/context/UploadContext";

export default function MediaGallery({
  calendarioId,
  calendarioNombre = "Calendario",
  onBack,
  refreshTrigger = 0
}) {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'disponible' | 'en_uso'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'image' | 'video'

  // Global Upload Context
  const { startUpload, addUploadListener, uploadState } = useUpload();

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Computed upload state for this calendar
  const isUploading = uploadState.isUploading && uploadState.calendarId === calendarioId;
  const uploadProgress = { current: uploadState.current, total: uploadState.total };

  // Lightbox / Delete Modal
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load gallery files
  const fetchGallery = async () => {
    if (!calendarioId) return;
    setLoading(true);
    const res = await getArchivosByCalendario(calendarioId);
    if (res.success) {
      setArchivos(res.data || []);
    } else {
      toast.error(res.error || "No se pudieron cargar los archivos de la galería.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, [calendarioId, refreshTrigger]);

  // Real-time listener for background uploads
  useEffect(() => {
    const removeListener = addUploadListener((updatedCalId) => {
      if (updatedCalId === calendarioId) {
        fetchGallery();
      }
    });
    return () => removeListener();
  }, [calendarioId]);

  // Trigger batch file upload with persistent background processing
  const handleUploadFiles = (filesList) => {
    startUpload(calendarioId, calendarioNombre, filesList, fetchGallery);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingMedia) return;
    setIsDeleting(true);
    const res = await deleteArchivo(deletingMedia.id, deletingMedia.url, deletingMedia.thumbnail_url);
    if (res.success) {
      toast.success(`Archivo "${deletingMedia.nombre_archivo}" eliminado de la galería.`);
      setDeletingMedia(null);
      if (previewMedia?.id === deletingMedia.id) {
        setPreviewMedia(null);
      }
      fetchGallery();
    } else {
      toast.error(res.error || "No se pudo eliminar el archivo.");
    }
    setIsDeleting(false);
  };

  // Copy link handler
  const copyMediaUrl = (item, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("Enlace del archivo copiado al portapapeles.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered files
  const filteredArchivos = archivos.filter((item) => {
    // Status filter
    if ((statusFilter === "disponible" || statusFilter === "disponibles") && item.en_uso) return false;
    if (statusFilter === "en_uso" && !item.en_uso) return false;

    // Type filter
    if (typeFilter === "image" && item.tipo !== "image") return false;
    if (typeFilter === "video" && item.tipo !== "video") return false;

    return true;
  });

  const disponiblesCount = archivos.filter((a) => !a.en_uso).length;
  const enUsoCount = archivos.filter((a) => a.en_uso).length;

  return (
    <div className="space-y-6 font-inter">
      {/* INTEGRATED HEADER BAR */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0"
              title="Volver a los calendarios"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs mb-1 font-sora">
              <Film className="w-4 h-4" />
              <span>BANCO DE MEDIOS Y GALERÍA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
              {calendarioNombre}
            </h2>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchGallery}
          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0"
          title="Actualizar banco de medios"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
        </button>
      </div>

      {/* 2-COLUMN MAIN CONTENT (1/3 Upload, 2/3 Gallery Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (1/3 Width: lg:col-span-4) - COMPACT UPLOADER */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-pink-500" />
              <h3 className="font-sora font-bold text-gray-900 text-sm">Subir Nuevos Medios</h3>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl p-6 text-center transition-all border-2 border-dashed relative overflow-hidden ${
              isDragging
                ? "border-pink-500 bg-pink-50/80 scale-[1.01]"
                : "border-gray-200 hover:border-pink-300 bg-gray-50/50 hover:bg-pink-50/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 border border-pink-100 text-pink-500 flex items-center justify-center mx-auto transition-transform hover:scale-110">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <h4 className="font-sora font-extrabold text-gray-900 text-sm">
                  {isUploading
                    ? `Subiendo (${uploadProgress.current} / ${uploadProgress.total})...`
                    : "Selecciona o arrastra archivos"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Imágenes (PNG, JPG, WEBP) y videos (MP4, MOV).
                </p>
              </div>

              {isUploading ? (
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.current / (uploadProgress.total || 1)) * 100}%`
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-5 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 transition-all inline-flex items-center gap-2 cursor-pointer w-full justify-center"
                >
                  <UploadCloud className="w-4 h-4" /> Seleccionar Archivos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3 Width: lg:col-span-8) - MEDIA GALLERY GRID */}
        <div className="lg:col-span-8 space-y-4">
          {/* Integrated Filter Controls Directly Above Gallery */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos ({archivos.length})
              </button>
              <button
                onClick={() => setStatusFilter("disponibles")}
                className={`px-3 py-1.5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "disponibles"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-emerald-700"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Disponibles ({disponiblesCount})
              </button>
              <button
                onClick={() => setStatusFilter("en_uso")}
                className={`px-3 py-1.5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "en_uso"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-purple-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                En uso ({enUsoCount})
              </button>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all whitespace-nowrap ${
                  typeFilter === "all"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("image")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                  typeFilter === "image"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Imágenes
              </button>
              <button
                onClick={() => setTypeFilter("video")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                  typeFilter === "video"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" /> Videos
              </button>
            </div>
          </div>
          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-sora font-bold text-gray-700">Cargando banco de medios...</p>
            </div>
          ) : filteredArchivos.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-sora font-bold text-gray-900 text-base mb-1">
                No se encontraron archivos
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                {archivos.length === 0
                  ? "Sube tus primeros archivos utilizando el panel de carga lateral."
                  : "No hay archivos que coincidan con los filtros seleccionados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredArchivos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewMedia(item)}
                  className="group bg-gray-900 rounded-[1.5rem] overflow-hidden relative aspect-square shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100"
                >
                  {/* Image or Video Preview */}
                  {item.tipo === "video" ? (
                    <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.nombre_archivo}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <video
                          src={item.url}
                          muted
                          preload="metadata"
                          playsInline
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={item.url}
                        alt={item.nombre_archivo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Eye className="w-5 h-5 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clean Bottom-Right Delete Button */}
                  <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingMedia(item);
                      }}
                      className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="Eliminar de la galería"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* LIGHTBOX PREVIEW MODAL */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 font-inter animate-in fade-in duration-200 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row max-h-[85dvh] sm:max-h-[88dvh]"
          >
            {/* Top Floating Close Button for Mobile & Desktop */}
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Player / Image Area */}
            <div className="md:w-3/5 bg-gray-950 flex items-center justify-center relative p-3 sm:p-4 shrink-0 max-h-[42vh] md:max-h-full overflow-hidden">
              {previewMedia.tipo === "video" ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  preload="metadata"
                  playsInline
                  poster={previewMedia.thumbnail_url || undefined}
                  className="max-h-[38vh] md:max-h-[65vh] w-full object-contain rounded-xl"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.nombre_archivo}
                  className="max-h-[38vh] md:max-h-[65vh] w-full object-contain rounded-xl"
                />
              )}
            </div>

            {/* Details Side Area */}
            <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <span className="inline-block text-[10px] font-sora font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-pink-50 text-pink-600">
                    DETALLES DE MEDIO
                  </span>
                </div>

                <h3 className="font-sora font-extrabold text-gray-900 text-lg mb-2 break-all">
                  {previewMedia.nombre_archivo}
                </h3>

                <div className="space-y-2 text-xs text-gray-600 font-medium">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">Tipo de Archivo:</span>
                    <span className="font-sora font-bold text-gray-900 uppercase flex items-center gap-1.5">
                      {previewMedia.tipo === "video" ? (
                        <>
                          <VideoIcon className="w-3.5 h-3.5 text-pink-500" /> Video / Reel
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-brand-blue" /> Imagen
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">Estado en Post:</span>
                    <span
                      className={`font-sora font-bold ${previewMedia.en_uso ? "text-purple-600" : "text-emerald-600"
                        }`}
                    >
                      {previewMedia.en_uso ? "En uso en publicación" : "Disponible (Sin usar)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">Fecha de Subida:</span>
                    <span className="font-mono text-gray-700">
                      {new Date(previewMedia.created_at).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => copyMediaUrl(previewMedia, e)}
                  className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 font-sora font-bold text-xs rounded-full inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedId === previewMedia.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" /> Link Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Enlace Directo
                    </>
                  )}
                </button>

                <button
                  onClick={() => setDeletingMedia(previewMedia)}
                  className="w-full h-11 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-sora font-bold text-xs rounded-full inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar de Galería
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMedia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-sora font-extrabold text-gray-900 mb-2">
              ¿Eliminar archivo?
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Estás a punto de eliminar el archivo{" "}
              <span className="font-bold text-gray-900 font-sora break-all">
                "{deletingMedia.nombre_archivo}"
              </span>{" "}
              de la galería del calendario. Esta acción eliminará el archivo del almacenamiento y no se podrá deshacer.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Eliminar Definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
