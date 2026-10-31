import { useState, useEffect } from "react";
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatters";

/**
 * ReceiptPreviewActionPanel
 * Visor de comprobante (PDF o imagen R2) y barra táctil inferior de dictamen.
 */
export default function ReceiptPreviewActionPanel({
  activeCiclo,
  activeComprobanteUrl,
  isPdf,
  labelAprobacion,
  isProcessing,
  onApprove,
  onReject
}) {
  const [imgError, setImgError] = useState(false);
  const cliente = activeCiclo?.cliente || {};

  useEffect(() => {
    setImgError(false);
  }, [activeComprobanteUrl]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Barra Superior del Documento */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 shrink-0">
        <div>
          <h4 className="font-sora font-bold text-sm text-gray-900 flex items-center gap-2">
            <span>{cliente.nombre || "Cliente"}</span>
            {cliente.empresa && (
              <span className="text-gray-400 text-xs font-normal">({cliente.empresa})</span>
            )}
          </h4>
          <div className="font-inter text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
            <span>Mes: {activeCiclo?.mes}/{activeCiclo?.anio}</span>
            <span>•</span>
            <span>Monto: {formatPrice(activeCiclo?.monto_cobrado || 0)}</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                isPdf
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-blue-50 text-brand-blue border border-blue-200"
              }`}
            >
              {isPdf ? "Documento PDF" : "Imagen Comprobante"}
            </span>
          </div>
        </div>

        {activeComprobanteUrl && (
          <a
            href={activeComprobanteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-sora font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>Abrir en pestaña nueva</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </a>
        )}
      </div>

      {/* Área del Visor */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100/60 flex items-center justify-center min-h-0">
        {!activeComprobanteUrl ? (
          <div className="text-center p-6 text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-inter">No se encontró la URL del archivo.</p>
          </div>
        ) : isPdf ? (
          <div className="w-full h-full min-h-[460px] flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-xs">
            <object
              data={`${activeComprobanteUrl}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="w-full h-full min-h-[460px] flex-1"
            >
              <iframe
                src={`${activeComprobanteUrl}#toolbar=1`}
                title="Visor PDF"
                className="w-full h-full min-h-[460px] flex-1 border-0"
              >
                <div className="p-8 text-center bg-white flex flex-col items-center justify-center h-full">
                  <FileText className="w-12 h-12 text-[#188ff0] mb-3" />
                  <h5 className="font-sora font-bold text-gray-900 text-sm mb-1">
                    Comprobante en formato PDF
                  </h5>
                  <p className="font-inter text-xs text-gray-500 mb-4 max-w-xs">
                    Tu navegador no permite la vista previa de PDF incrustada directamente.
                  </p>
                  <a
                    href={activeComprobanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>Abrir Documento PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        ) : imgError ? (
          <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-xs max-w-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#188ff0] flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h5 className="font-sora font-bold text-gray-900 text-sm mb-1">
              Archivo de Comprobante Adjunto
            </h5>
            <p className="font-inter text-xs text-gray-500 mb-4 leading-relaxed">
              El comprobante se encuentra almacenado de forma segura en Cloudflare R2 pero requiere abrirse directamente.
            </p>
            <a
              href={activeComprobanteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Abrir Documento</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-2">
            <img
              src={activeComprobanteUrl}
              alt="Comprobante de pago"
              onError={() => setImgError(true)}
              className="max-h-[60vh] max-w-full object-contain rounded-xl border border-gray-300 shadow-md bg-white"
            />
          </div>
        )}
      </div>

      {/* Barra de Acciones Inferior (Thumb Zone Ergonomics) */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
          className="h-11 sm:h-10 px-4 rounded-full border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-sora font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Rechazar Comprobante</span>
        </Button>

        <div className="flex items-stretch sm:items-center gap-2">
          <Button
            type="button"
            onClick={onApprove}
            disabled={isProcessing}
            className="w-full sm:w-auto h-11 sm:h-10 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-emerald-200 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? "Validando..." : labelAprobacion}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

