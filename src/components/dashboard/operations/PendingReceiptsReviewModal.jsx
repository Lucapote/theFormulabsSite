import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  Building,
  User,
  AlertCircle,
  Clock,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/utils/formatters";
import { validarPagoYDesbloquear, rechazarComprobanteCiclo } from "@/services/operationsService";

/**
 * PendingReceiptsReviewModal
 * Modal centralizado en dos columnas (Split View) para revisar y dictaminar
 * los comprobantes de pago subidos por los clientes en sus ciclos mensuales.
 */
export default function PendingReceiptsReviewModal({
  isOpen,
  onClose,
  pendingCycles = [],
  initialSelectedCicloId = null,
  onCycleUpdated
}) {
  const [selectedCicloId, setSelectedCicloId] = useState(initialSelectedCicloId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (initialSelectedCicloId) {
      setSelectedCicloId(initialSelectedCicloId);
    } else if (pendingCycles.length > 0) {
      setSelectedCicloId(pendingCycles[0].id);
    }
  }, [initialSelectedCicloId, isOpen, pendingCycles]);

  // Ciclo activo seleccionado (o el primero de la lista por defecto)
  const activeCiclo = useMemo(() => {
    if (!pendingCycles.length) return null;
    const found = pendingCycles.find((c) => c.id === selectedCicloId);
    return found || pendingCycles[0];
  }, [pendingCycles, selectedCicloId]);

  const cliente = activeCiclo?.cliente || {};
  const isDosPagos = cliente.esquema_pago === "dos_pagos";
  const producciones = activeCiclo?.producciones || [];
  const totalSessions = Math.max(1, cliente.producciones_por_mes || producciones.length || 1);
  const firstPaymentSessions = isDosPagos
    ? Math.min(
        totalSessions - 1,
        Math.max(1, cliente.sesiones_primer_pago || Math.floor(totalSessions / 2))
      )
    : totalSessions;

  // Determinar URL del comprobante según estado
  const activeComprobanteUrl =
    isDosPagos && activeCiclo?.estado_pago === "primer_pago"
      ? activeCiclo.comprobante_2_url || activeCiclo.comprobante_url
      : activeCiclo?.comprobante_url || activeCiclo?.comprobante_2_url;

  useEffect(() => {
    setImgError(false);
  }, [activeComprobanteUrl]);

  const isPdf = Boolean(
    activeComprobanteUrl &&
    (activeComprobanteUrl.toLowerCase().includes(".pdf") || activeComprobanteUrl.toLowerCase().includes("pdf"))
  );
  const targetStatus = isDosPagos && activeCiclo?.estado_pago === "pendiente" ? "primer_pago" : "pagado";
  const labelAprobacion =
    targetStatus === "primer_pago"
      ? `Aprobar 1er Abono (${firstPaymentSessions} ses.)`
      : "Aprobar Pago Completo";

  const handleApprove = async () => {
    if (!activeCiclo || isProcessing) return;
    setIsProcessing(true);

    const prodParaNotificar =
      targetStatus === "pagado" && isDosPagos && producciones[firstPaymentSessions]
        ? producciones[firstPaymentSessions]
        : producciones[0] || null;

    const res = await validarPagoYDesbloquear({
      cicloId: activeCiclo.id,
      cliente,
      produccionPrincipal: prodParaNotificar,
      montoCobrado: activeCiclo.monto_cobrado,
      mes: activeCiclo.mes,
      anio: activeCiclo.anio,
      nuevoEstado: targetStatus
    });

    setIsProcessing(false);

    if (res.success) {
      toast.success(
        targetStatus === "primer_pago"
          ? `1er Abono validado. Se habilitaron ${firstPaymentSessions} sesión(es) para ${cliente.nombre || "el cliente"}.`
          : `Pago completo acreditado. Se confirmaron todas las sesiones de ${cliente.nombre || "el cliente"}.`
      );
      if (onCycleUpdated) onCycleUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo validar el pago.");
    }
  };

  const handleReject = async () => {
    if (!activeCiclo || isProcessing) return;
    setIsProcessing(true);

    const esSegundo = isDosPagos && activeCiclo.estado_pago === "primer_pago";
    const res = await rechazarComprobanteCiclo(activeCiclo.id, esSegundo);
    setIsProcessing(false);

    if (res.success) {
      toast.info(`Comprobante descartado para ${cliente.nombre || "el cliente"}. Pre-reserva liberada.`);
      if (onCycleUpdated) onCycleUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo rechazar el comprobante.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] max-h-[90vh] p-0 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
        {/* Cabecera Clínica Oscura */}
        <DialogHeader className="bg-slate-950 text-white px-6 py-4 flex flex-row items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-[#188ff0] flex items-center justify-center border border-blue-400/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-sora font-bold text-base text-white flex items-center gap-2">
                <span>Bandeja de Pagos por Validar</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-[#188ff0] border border-blue-400/40 text-[11px] font-mono">
                  {pendingCycles.length} {pendingCycles.length === 1 ? "pendiente" : "pendientes"}
                </span>
              </DialogTitle>
              <p className="font-inter text-xs text-slate-400">
                Auditoría y acreditación directa de comprobantes subidos por los clientes
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido Split-View (2 Columnas) */}
        {pendingCycles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/60">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-sora font-bold text-gray-900 text-base mb-1">
              ¡Al día! No hay comprobantes pendientes
            </h3>
            <p className="font-inter text-xs text-gray-500 max-w-sm mb-6">
              Todos los comprobantes subidos por tus clientes para este periodo han sido validados o dictaminados.
            </p>
            <Button
              type="button"
              onClick={onClose}
              className="h-9 px-6 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-semibold uppercase tracking-wider"
            >
              Cerrar Bandeja
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Columna Izquierda: Lista de Clientes con Comprobantes */}
            <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-gray-50/70 flex flex-col min-h-0">
              <div className="p-3 border-b border-gray-200 bg-white">
                <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider">
                  Clientes Pendientes ({pendingCycles.length})
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {pendingCycles.map((cicloItem) => {
                  const cl = cicloItem.cliente || {};
                  const isSelected = activeCiclo?.id === cicloItem.id;
                  const itemIsDosPagos = cl.esquema_pago === "dos_pagos";
                  const itemTarget =
                    itemIsDosPagos && cicloItem.estado_pago === "pendiente"
                      ? "1er Abono"
                      : "Pago Total";

                  return (
                    <button
                      key={cicloItem.id}
                      type="button"
                      onClick={() => setSelectedCicloId(cicloItem.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#188ff0] shadow-sm ring-1 ring-[#188ff0]/20"
                          : "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-sora font-bold text-xs text-gray-900 line-clamp-1">
                          {cl.nombre || "Cliente sin nombre"}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-[#188ff0] border border-blue-200 text-[10px] font-mono font-bold">
                          {itemTarget}
                        </span>
                      </div>
                      {cl.empresa && (
                        <p className="font-inter text-[11px] text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
                          <Building className="w-3 h-3 text-gray-400 shrink-0" />
                          {cl.empresa}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 pt-1.5 border-t border-gray-100">
                        <span>Retainer: {formatPrice(cicloItem.monto_cobrado || cl.monto_retainer || 0)}</span>
                        <span className="text-[10px] text-gray-400 uppercase">
                          Ciclo {cicloItem.mes}/{cicloItem.anio}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Visor en Vivo & Acciones */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Barra Superior del Documento */}
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
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
                    <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isPdf
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-brand-blue border border-blue-200"
                    }`}>
                      {isPdf ? "Documento PDF" : "Imagen Comprobante"}
                    </span>
                  </div>
                </div>

                {activeComprobanteUrl && (
                  <a
                    href={activeComprobanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-sora font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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
                            className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-sm transition-all"
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
                      className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-sm transition-all"
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

              {/* Barra de Acciones Inferior */}
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="h-10 px-4 rounded-full border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-sora font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Rechazar Comprobante</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="h-10 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-emerald-200 inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProcessing ? "Validando..." : labelAprobacion}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
