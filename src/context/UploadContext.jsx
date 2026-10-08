import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/services/calendarService";
import { compressMediaFile, formatBytes } from "@/utils/mediaCompressor";
import {
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    current: 0,
    total: 0,
    currentFileName: "",
    calendarName: "",
    calendarId: "",
    isComplete: false,
    successCount: 0,
    failCount: 0,
  });

  const [isDismissed, setIsDismissed] = useState(false);
  const [listeners, setListeners] = useState([]);

  const addUploadListener = (fn) => {
    setListeners((prev) => [...prev, fn]);
    return () => setListeners((prev) => prev.filter((l) => l !== fn));
  };

  const startUpload = async (
    calendarioId,
    calendarioNombre,
    filesList,
    onCompleteCallback
  ) => {
    const files = Array.from(filesList).filter((file) => {
      const isImg = file.type.startsWith("image/");
      const isVid =
        file.type.startsWith("video/") ||
        /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name);
      return isImg || isVid;
    });

    if (files.length === 0) {
      toast.error(
        "Selecciona archivos de imagen (.png, .jpg, .webp) o video (.mp4, .mov, .webm)."
      );
      return;
    }

    setIsDismissed(false);
    setUploadState({
      isUploading: true,
      current: 0,
      total: files.length,
      currentFileName: files[0]?.name || "",
      calendarName: calendarioNombre || "Calendario",
      calendarId: calendarioId,
      isComplete: false,
      successCount: 0,
      failCount: 0,
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      setUploadState((prev) => ({
        ...prev,
        current: i + 1,
        currentFileName: originalFile.name,
      }));

      // Compresión automática de imagen antes de subir
      const compressResult = await compressMediaFile(originalFile);
      const fileToUpload = compressResult.file;

      const res = await uploadMediaFile(calendarioId, fileToUpload);
      if (res.success) {
        successCount++;
        if (compressResult.compressed && compressResult.savedPercentage > 10) {
          toast(
            `"${originalFile.name}" comprimido: ${formatBytes(
              compressResult.originalSize
            )} → ${formatBytes(compressResult.compressedSize)} (-${
              compressResult.savedPercentage
            }%)`,
            {
              icon: (
                <div className="w-6 h-6 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                </div>
              ),
              duration: 3500,
            }
          );
        }
      } else {
        failCount++;
        console.error(`Error subiendo ${originalFile.name}:`, res.error);
      }

      // Notificar a componentes activos (ej. MediaGallery) para refrescar en tiempo real
      listeners.forEach((fn) => fn(calendarioId));
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      isComplete: true,
      successCount,
      failCount,
    }));

    if (successCount > 0) {
      toast.success(
        `¡${successCount} archivo(s) subido(s) a "${calendarioNombre}" con éxito!`,
        {
          icon: (
            <div className="w-6 h-6 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            </div>
          ),
        }
      );
      if (onCompleteCallback) onCompleteCallback();
    }
    if (failCount > 0) {
      toast.error(`${failCount} archivo(s) no se pudieron subir.`);
    }

    // Auto-ocultar banner tras 5 segundos
    setTimeout(() => {
      setUploadState((prev) => {
        if (!prev.isUploading) {
          return { ...prev, isComplete: false };
        }
        return prev;
      });
    }, 5000);
  };

  const percent = Math.round(
    (uploadState.current / (uploadState.total || 1)) * 100
  );

  return (
    <UploadContext.Provider
      value={{
        uploadState,
        startUpload,
        addUploadListener,
        closeWidget: () => setIsDismissed(true),
      }}
    >
      {children}

      {/* FLOATING PERSISTENT UPLOAD PILL WIDGET */}
      {(uploadState.isUploading || uploadState.isComplete) && !isDismissed && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white border border-pink-300 rounded-full px-4 py-2.5 shadow-xl shadow-pink-500/10 flex items-center gap-3 font-sora transition-all hover:border-pink-400">
            {/* Pink Icon Badge */}
            <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shrink-0">
              {uploadState.isUploading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
              )}
            </div>

            {/* Text */}
            <div className="flex items-center gap-2 text-xs font-sora font-extrabold text-gray-900">
              <span>
                {uploadState.isUploading
                  ? `Subiendo ${uploadState.current}/${uploadState.total} (${percent}%)`
                  : `Subida completada (100%)`}
              </span>
              {uploadState.isUploading && uploadState.currentFileName && (
                <span className="text-gray-400 font-normal max-w-[120px] truncate hidden sm:inline">
                  : {uploadState.currentFileName}
                </span>
              )}
            </div>

            {/* Action Control: Close X */}
            <div className="flex items-center border-l border-gray-100 pl-2">
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Ocultar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload debe ser usado dentro de un UploadProvider");
  }
  return context;
}
