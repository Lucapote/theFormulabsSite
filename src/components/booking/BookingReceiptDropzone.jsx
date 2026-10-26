import { Upload, FileCheck2, Loader2 } from "lucide-react";
import { formatBytes } from "@/utils/mediaCompressor";

/**
 * BookingReceiptDropzone
 * Dropzone unificado de comprobante de pago con soporte para compresión,
 * previsualización de archivo local y estado de comprobante ya registrado.
 */
export default function BookingReceiptDropzone({
  fileInputRef,
  uploading = false,
  uploadStats = null,
  comprobanteUrl = null,
  pendingReceiptFile = null,
  onFileChange,
  isRequired = true,
  disabled = false
}) {
  const isRegistered = Boolean(uploadStats?.publicUrl || comprobanteUrl);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider">
          COMPROBANTE DE PAGO REQUERIDO
        </label>
        {isRequired && (
          <span className="text-[11px] font-mono text-[#ef18d6] font-semibold">
            * obligatorio
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        disabled={disabled || uploading}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onFileChange}
        className="hidden"
      />

      {isRegistered ? (
        <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sora font-bold text-emerald-950 truncate">
                Comprobante registrado en la plataforma
              </p>
              <p className="text-[11px] text-emerald-700">
                {uploadStats?.compressedSize
                  ? `${formatBytes(uploadStats.compressedSize)} • En proceso de validación`
                  : "En proceso de validación por The Formulab"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-sora font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-gray-50 cursor-pointer shrink-0 active:scale-[0.98] transition-transform"
          >
            Actualizar
          </button>
        </div>
      ) : pendingReceiptFile ? (
        <div className="border border-sky-300 bg-sky-50/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sora font-bold text-gray-900 truncate">
                {pendingReceiptFile.name}
              </p>
              <p className="text-[11px] text-gray-500">
                {formatBytes(pendingReceiptFile.size)} • Listo para subir y validar
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-sora font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-gray-50 cursor-pointer shrink-0 active:scale-[0.98] transition-transform"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!disabled && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className="relative border-2 border-dashed border-sky-300 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50/70 rounded-2xl p-5 text-center transition-all cursor-pointer group"
        >
          <div className="flex flex-row justify-center items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#188ff0] text-white flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-sora font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                {uploading
                  ? "Subiendo comprobante a almacenamiento seguro..."
                  : "Subir Comprobante de Pago (Foto o PDF)"}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Habilita y confirma inmediatamente tu fecha de rodaje
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
