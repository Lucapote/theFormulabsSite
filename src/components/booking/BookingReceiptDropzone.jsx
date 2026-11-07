import { Upload, FileCheck2, Loader2 } from "lucide-react";
import { formatBytes } from "@/utils/mediaCompressor";

/**
 * BookingReceiptDropzone
 * Dropzone unificado y compacto de comprobante de pago con soporte para compresión,
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] sm:text-xs font-sora font-bold text-gray-800 uppercase tracking-wider">
          COMPROBANTE DE PAGO REQUERIDO
        </label>
        {isRequired && (
          <span className="text-[10px] sm:text-[11px] font-mono text-[#ef18d6] font-semibold">
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
        <div className="border border-emerald-300 bg-emerald-50/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sora font-bold text-emerald-950 truncate">
                Comprobante registrado
              </p>
              <p className="text-[10px] sm:text-[11px] text-emerald-700 truncate">
                {uploadStats?.compressedSize
                  ? `${formatBytes(uploadStats.compressedSize)} • En validación`
                  : "En validación por The Formulab"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-sora font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-2xs hover:bg-gray-50 cursor-pointer shrink-0 active:scale-[0.98] transition-transform"
          >
            Actualizar
          </button>
        </div>
      ) : pendingReceiptFile ? (
        <div className="border border-sky-300 bg-sky-50/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sora font-bold text-gray-900 truncate">
                {pendingReceiptFile.name}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                {formatBytes(pendingReceiptFile.size)} • Listo para subir
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-sora font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-2xs hover:bg-gray-50 cursor-pointer shrink-0 active:scale-[0.98] transition-transform"
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
          className="relative border-2 border-dashed border-sky-300 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center transition-all cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex flex-row justify-center items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#188ff0] text-white flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform shrink-0">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-sora font-bold text-gray-900 group-hover:text-brand-blue transition-colors truncate">
                {uploading
                  ? "Subiendo comprobante..."
                  : "Subir Comprobante de Pago (Foto o PDF)"}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                Habilita y confirma inmediatamente tu fecha de rodaje
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
