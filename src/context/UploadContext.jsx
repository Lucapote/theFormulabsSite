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
  Film
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
    phase: "idle", // 'compressing' | 'uploading' | 'complete'
    compressPercent: 0,
    uploadPercent: 0,
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
      phase: "compressing",
      compressPercent: 0,
      uploadPercent: 0,
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      const isVideo = originalFile.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi)$/i.test(originalFile.name);

      setUploadState((prev) => ({
        ...prev,
        current: i + 1,
        currentFileName: originalFile.name,
        phase: "compressing",
        compressPercent: isVideo ? 0 : 100,
        uploadPercent: 0,
      }));

      // Paso 1: Progreso real de compresión (vía FFmpeg WebAssembly para videos)
      const compressResult = await compressMediaFile(originalFile, {
        onProgress: (percent) => {
          setUploadState((prev) => ({
            ...prev,
            phase: "compressing",
            compressPercent: percent,
          }));
        },
      });
      const fileToUpload = compressResult.file;

      // Paso 2: Progreso real de subida a Cloudflare R2 (vía XMLHttpRequest)
      setUploadState((prev) => ({
        ...prev,
        phase: "uploading",
        compressPercent: 100,
        uploadPercent: 0,
      }));

      const res = await uploadMediaFile(calendarioId, fileToUpload, {
        onUploadProgress: (percent) => {
          setUploadState((prev) => ({
            ...prev,
            phase: "uploading",
            uploadPercent: percent,
          }));
        },
      });

      if (res.success) {
        successCount++;
        if (compressResult.compressed && compressResult.savedPercentage > 10) {
          toast(
            `"${originalFile.name}" optimizado: ${formatBytes(
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
      phase: "complete",
      compressPercent: 100,
      uploadPercent: 100,
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

  const activePercent =
    uploadState.phase === "compressing"
      ? uploadState.compressPercent
      : uploadState.phase === "uploading"
      ? uploadState.uploadPercent
      : 100;

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
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300 font-inter">
          <div className="bg-white border border-pink-300 rounded-3xl p-3 sm:px-4 sm:py-3 shadow-2xl shadow-pink-500/15 flex flex-col gap-2 font-sora min-w-[280px] sm:min-w-[340px] transition-all hover:border-pink-400">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Status Icon Badge */}
                <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shrink-0">
                  {uploadState.phase === "compressing" ? (
                    <Film className="w-4 h-4 animate-pulse text-pink-500" />
                  ) : uploadState.phase === "uploading" ? (
                    <UploadCloud className="w-4 h-4 animate-bounce text-brand-blue" />
                  ) : uploadState.isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>

                {/* Status Text & Current Phase */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sora font-extrabold text-gray-900 leading-tight">
                      {uploadState.phase === "compressing"
                        ? `Comprimiendo video (${uploadState.compressPercent}%)`
                        : uploadState.phase === "uploading"
                        ? `Subiendo a R2 (${uploadState.uploadPercent}%)`
                        : "Subida completada"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-200">
                      {uploadState.current}/{uploadState.total}
                    </span>
                  </div>

                  {uploadState.isUploading && uploadState.currentFileName && (
                    <p className="text-[11px] text-gray-400 font-normal truncate mt-0.5" title={uploadState.currentFileName}>
                      {uploadState.phase === "compressing" ? "Paso 1/2: " : "Paso 2/2: "}
                      {uploadState.currentFileName}
                    </p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                title="Ocultar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Progress Bar using HTML5 progress element (Zero inline styles) */}
            {uploadState.isUploading && (
              <progress
                value={activePercent}
                max={100}
                className="w-full h-2 rounded-full overflow-hidden accent-pink-500 bg-pink-100 [&::-webkit-progress-bar]:bg-pink-100 [&::-webkit-progress-value]:bg-pink-500 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200 [&::-moz-progress-bar]:bg-pink-500"
              />
            )}
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
