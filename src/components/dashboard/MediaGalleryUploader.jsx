import { UploadCloud, RefreshCw } from "lucide-react";

/**
 * MediaGalleryUploader
 * Drag & drop file uploader box and uploading status indicator.
 */
export default function MediaGalleryUploader({
  isDragging = false,
  fileInputRef,
  isUploading = false,
  uploadProgress = { current: 0, total: 0 },
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadFiles
}) {
  return (
    <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4 lg:sticky lg:top-6">
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

      {/* Uploading Status Panel */}
      {isUploading && (
        <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-sora font-bold text-pink-700">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Subiendo archivos...
            </span>
            <span>
              {uploadProgress.current} de {uploadProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all duration-300"
              style={{
                width: `${
                  uploadProgress.total > 0
                    ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                    : 0
                }%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
