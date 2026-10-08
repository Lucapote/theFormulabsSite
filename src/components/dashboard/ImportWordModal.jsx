import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Film,
  Layers,
  ArrowRight,
  Loader2,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { parseDocxCalendar } from "@/utils/docxCalendarParser";
import { applyImportedPostsToCalendar } from "@/services/calendarService";

export default function ImportWordModal({
  isOpen,
  onClose,
  calendarioId,
  onSuccess
}) {
  const [file, setFile] = useState(null);
  const [parsedPosts, setParsedPosts] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith(".docx") &&
      selectedFile.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setParseError("Por favor selecciona un archivo válido en formato Word (.docx).");
      return;
    }

    setFile(selectedFile);
    setParseError("");
    setIsParsing(true);
    setParsedPosts([]);

    try {
      const posts = await parseDocxCalendar(selectedFile);
      setParsedPosts(posts);
    } catch (err) {
      console.error("Error al analizar documento:", err);
      setParseError(err.message || "Error al procesar el archivo .docx.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetState = () => {
    setFile(null);
    setParsedPosts([]);
    setParseError("");
    setIsParsing(false);
    setIsApplying(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleApply = async () => {
    if (!parsedPosts || parsedPosts.length === 0 || !calendarioId) return;

    setIsApplying(true);
    try {
      const res = await applyImportedPostsToCalendar(calendarioId, parsedPosts);
      if (res.success) {
        toast.success(
          `¡Importación exitosa! Se procesaron ${res.totalProcessed} publicaciones (${res.countUpdated} cajas vacías rellenadas, ${res.countInserted} creadas).`
        );
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        toast.error(res.error || "No se pudo aplicar la importación.");
      }
    } catch (err) {
      console.error("Error al aplicar publicaciones:", err);
      toast.error("Ocurrió un error inesperado al guardar las publicaciones.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 via-white to-blue-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-gray-900 text-lg tracking-tight">
                Importar Contenido desde Word (.docx)
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Extrae fechas, formatos y copywriting para rellenar cajas vacías o agregar posts.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Dropzone if no file selected or parsing error */}
          {(!file || parseError) && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/30 hover:bg-pink-50/60 rounded-[1.5rem] p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-gray-800 text-sm">
                  Arrastra tu documento Word (.docx) aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  o haz clic para explorar tus archivos
                </p>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[11px] font-bold text-gray-500 shadow-sm border border-gray-100">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                Detección automática de Fechas, Formatos, Captions y CTAs
              </div>
            </div>
          )}

          {/* Parsing Loading State */}
          {isParsing && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
              <p className="font-sora font-bold text-gray-800 text-sm">
                Procesando documento Word...
              </p>
              <p className="text-xs text-gray-500">
                Analizando párrafos y estructurando publicaciones del calendario
              </p>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Error en el archivo</p>
                <p className="mt-0.5 text-red-600">{parseError}</p>
              </div>
            </div>
          )}

          {/* Parsed Preview Section */}
          {!isParsing && file && !parseError && parsedPosts.length > 0 && (
            <div className="space-y-4">
              {/* Info & Counter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-sora font-extrabold text-gray-900 text-xs truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 font-sora font-bold text-xs rounded-full">
                    {parsedPosts.length} publicaciones detectadas
                  </span>
                  <button
                    onClick={resetState}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              {/* List of Detected Posts */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {parsedPosts.map((post, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-pink-200 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sora font-extrabold text-gray-400">
                          #{index + 1}
                        </span>

                        {/* Format Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            post.tipo_post === "carrousel"
                              ? "bg-blue-50 text-[#188ff0] border border-blue-100"
                              : "bg-pink-50 text-pink-600 border border-pink-100"
                          }`}
                        >
                          {post.tipo_post === "carrousel" ? (
                            <Layers className="w-3 h-3" />
                          ) : (
                            <Film className="w-3 h-3" />
                          )}
                          {post.tipo_post === "carrousel" ? "Carrusel" : "Reel"}
                        </span>

                        {/* Status Badge */}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">
                          Borrador
                        </span>
                      </div>

                      {/* Date & Time Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {post.fecha_programada || "Sin fecha asignada"}
                        </span>
                        {post.hora_programada && (
                          <>
                            <span className="text-gray-300">•</span>
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{post.hora_programada.substring(0, 5)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Caption Preview */}
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-normal leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {post.caption ? (
                        post.caption
                      ) : (
                        <span className="italic text-gray-400">
                          (Sin texto de copywriting)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            disabled={isApplying}
            className="h-10 px-5 text-xs font-sora font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            disabled={
              !file || isParsing || isApplying || parsedPosts.length === 0
            }
            className="h-10 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aplicando al Calendario...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar al Calendario ({parsedPosts.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
