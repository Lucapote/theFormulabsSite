import { UploadCloud, RefreshCw, Film } from "lucide-react";

/**
 * MediaGalleryUploader
 * Drag & drop file uploader box and uploading status indicator with 2-phase real progress.
 */
export default function MediaGalleryUploader({
  isDragging = false,
  fileInputRef,
  isUploading = false,
  uploadProgress = { current: 0, total: 0, phase: "uploading", compressPercent: 0, uploadPercent: 0, currentFileName: "" },
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadFiles
}) {
  const isCompressing = uploadProgress.phase === "compressing";
  const activePercent = isCompressing
    ? (uploadProgress.compressPercent || 0)
    : (uploadProgress.uploadPercent || 0);

  const phaseTitle = isCompressing
    ? `Comprimiendo video (${uploadProgress.compressPercent || 0}%)`
    : `Subiendo a R2 (${uploadProgress.uploadPercent || 0}%)`;

  const phaseStep = isCompressing
    ? "Paso 1/2: Optimizando calidad"
    : "Paso 2/2: Subiendo a la nube";

  return (
    <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4 lg:sticky lg:top-6 font-inter">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-pink-500" />
          <h3 className="font-sora font-bold text-gray-900 text-sm">Subir Nuevos Medios</h3>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
          isDragging
            ? "border-pink-500 bg-pink-50/50 scale-[1.02]"
            : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/20"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUploadFiles(e.target.files);
            }
          }}
        />
        <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-xs font-sora font-bold text-gray-800 mb-1">
          Arrastra tus archivos aquí
        </p>
        <p className="text-[11px] text-gray-400">
          o haz clic para examinar desde tu equipo (Imágenes o Videos)
        </p>
      </div>

      {/* Uploading Status Panel with 2-Phase Progress */}
      {isUploading && (
        <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-sora font-bold text-pink-700">
            <span className="flex items-center gap-1.5 truncate pr-2">
              {isCompressing ? (
                <Film className="w-3.5 h-3.5 animate-pulse text-pink-600 shrink-0" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-600 shrink-0" />
              )}
              <span className="truncate">{phaseTitle}</span>
            </span>
            <span className="shrink-0 text-[11px] font-mono">
              {uploadProgress.current} de {uploadProgress.total}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
            <span>{phaseStep}</span>
            {uploadProgress.currentFileName && (
              <span className="max-w-[130px] truncate font-mono text-gray-600">
                {uploadProgress.currentFileName}
              </span>
            )}
          </div>

          <progress
            value={activePercent}
            max={100}
            className="w-full h-2 rounded-full overflow-hidden accent-pink-500 bg-pink-200 [&::-webkit-progress-bar]:bg-pink-200 [&::-webkit-progress-value]:bg-pink-500 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200 [&::-moz-progress-bar]:bg-pink-500"
          />
        </div>
      )}
    </div>
  );
}
