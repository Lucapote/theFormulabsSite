import { Link as LinkIcon, ExternalLink, Upload, Loader2, X } from "lucide-react";

/**
 * ReceiptUploaderField
 * Subcomponente atómico para visualizar, pegar URL o subir comprobantes a Cloudflare R2.
 */
export default function ReceiptUploaderField({
  label,
  value,
  isUploading,
  accentColor = "text-brand-blue",
  buttonHoverBorder = "hover:border-brand-blue",
  spinnerColor = "text-brand-blue",
  onChange,
  onUpload,
  onClear
}) {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <LinkIcon className={`w-3.5 h-3.5 ${accentColor}`} />
          <span>{label}</span>
        </label>
        {Boolean(value) && (
          <div className="flex items-center gap-2">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-sora font-bold text-brand-blue hover:underline bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100"
            >
              <span>Ver archivo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
              title="Quitar comprobante"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://... o sube un archivo"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
        />
        <label
          className={`px-3 py-2 rounded-lg text-xs font-sora font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
            isUploading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ${buttonHoverBorder} shadow-xs`
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className={`w-3.5 h-3.5 animate-spin ${spinnerColor}`} />
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <Upload className={`w-3.5 h-3.5 ${accentColor}`} />
              <span>Subir</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            disabled={isUploading}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

