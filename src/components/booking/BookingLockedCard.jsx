import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  LockKeyhole,
  MessageCircle,
  AlertCircle,
  Building2,
  Calendar,
  Upload,
  Copy,
  Check,
  FileCheck2,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { getDatosBancarios } from "@/services/configService";
import { uploadComprobantePublico } from "@/services/r2Service";
import { formatBytes } from "@/utils/mediaCompressor";

/**
 * BookingLockedCard
 * Gatekeeper screen shown when a client opens a production booking link
 * and payment is required to unlock the session.
 * Allows direct compressed receipt upload (via mediaCompressor.js) to enable a temporary pre-reservation.
 */
export default function BookingLockedCard({
  cliente = {},
  ciclo = {},
  numeroSesion = 1,
  motivoBloqueo = "pago_pendiente",
  tokenReserva = "",
  onReceiptUploaded
}) {
  const [bankDetails, setBankDetails] = useState({
    banco: "BBVA México",
    beneficiario: "The Formulabs",
    clabe: "012345678901234567",
    concepto_default: "Servicio de Contenido",
    telefono: "529981234567"
  });
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const fileInputRef = useRef(null);

  const isSegundoPago = motivoBloqueo === "esperando_segundo_pago";
  const isDosPagos =
    cliente?.esquema_pago === "quincenal" ||
    cliente?.esquema_pago === "dos_pagos" ||
    Boolean(cliente?.dia_corte_pago_2);

  const montoTotal = Number(ciclo?.monto_cobrado || cliente?.monto_retainer) || 0;
  const montoAbono = isDosPagos ? Math.round(montoTotal / 2) : montoTotal;

  useEffect(() => {
    getDatosBancarios().then((res) => {
      if (res?.success && res?.data) {
        setBankDetails((prev) => ({ ...prev, ...res.data }));
      }
    });
  }, []);

  const formatPeriod = (mes, anio) => {
    if (!mes) return "Ciclo Actual";
    try {
      const d = new Date(anio || new Date().getFullYear(), Number(mes) - 1, 1);
      return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    } catch {
      return `Mes ${mes} • ${anio}`;
    }
  };

  const clientName = cliente?.nombre || "Cliente Estimado";
  const displayCompany = cliente?.empresa && cliente.empresa !== clientName ? cliente.empresa : null;
  const periodoLabel = formatPeriod(ciclo?.mes, ciclo?.anio);

  const handleCopyClabe = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bankDetails.clabe);
      setCopiedClabe(true);
      toast.success("Cuenta CLABE copiada al portapapeles");
      setTimeout(() => setCopiedClabe(false), 2000);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!tokenReserva) {
      toast.error("Token de reserva no encontrado.");
      return;
    }

    setUploading(true);
    const res = await uploadComprobantePublico({ file, tokenReserva });
    setUploading(false);

    if (!res.success) {
      toast.error(res.error || "No se pudo subir el comprobante.");
      return;
    }

    setUploadStats({
      publicUrl: res.publicUrl,
      fileName: file.name,
      originalSize: res.originalSize,
      compressedSize: res.compressedSize,
      savedPercentage: res.savedPercentage
    });

    toast.success("Comprobante comprimido y cargado. ¡Ya puedes pre-reservar tu fecha!");
  };

  const cleanPhone = (bankDetails.telefono || "529981234567").replace(/\D/g, "") || "529981234567";
  const waMessage = encodeURIComponent(
    isSegundoPago
      ? `Hola The Formulab, ya realicé el segundo abono de mi ciclo de ${periodoLabel} (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la sesión #${numeroSesion}.`
      : `Hola The Formulab, ya realicé el pago de mi ciclo de ${periodoLabel} (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la reserva de rodaje.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <div className="max-w-xl w-full mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 text-center space-y-5 font-inter">
      {/* Insignia Visual de Estado */}
      <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
        <div className="relative w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-xs">
          <LockKeyhole className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Títulos y Jerarquía Clínica */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-mono font-bold tracking-wider uppercase border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isSegundoPago
              ? `Segundo Corte • Sesión #${numeroSesion}`
              : `Activación de Sesión #${numeroSesion}`}
          </span>
        </div>

        <h2 className="font-sora text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {isSegundoPago
            ? "Sube tu 2do Abono para Pre-Reservar"
            : "Sube tu Comprobante para Pre-Reservar"}
        </h2>

        <p className="text-xs sm:text-sm font-inter text-gray-500 max-w-md mx-auto leading-relaxed">
          {isSegundoPago
            ? "Esta sesión se libera con el segundo pago de tu ciclo. Adjunta aquí tu comprobante de transferencia para habilitar inmediatamente la pre-reserva de tu horario."
            : "Para reservar tu fecha (con al menos 3 días hábiles de anticipación), adjunta tu comprobante de pago. Esto habilitará tu pre-reserva al instante mientras nuestro equipo lo valida."}
        </p>
      </div>

      {/* Tarjeta Resumen Clínico del Ciclo + Datos Bancarios */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
                Cuenta / Proyecto
              </span>
              <span className="text-xs sm:text-sm font-sora font-bold text-gray-900">
                {clientName}
              </span>
              {displayCompany && (
                <span className="text-[11px] text-gray-500 block">{displayCompany}</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-gray-400 block">
              {isDosPagos ? (isSegundoPago ? "2do Abono (50%)" : "1er Abono (50%)") : "Monto del Ciclo"}
            </span>
            {montoAbono > 0 ? (
              <span className="font-sora font-bold text-sm text-gray-900">
                ${montoAbono.toLocaleString("es-MX")} <span className="text-[10px] text-gray-400">MXN</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-gray-200/80 text-gray-700 border border-gray-300">
                Sesión #{numeroSesion}
              </span>
            )}
          </div>
        </div>

        {/* Datos Bancarios Compactos */}
        <div className="pt-2.5 border-t border-gray-200/70 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-600 flex-wrap gap-1">
            <span>
              Banco: <strong className="text-gray-900">{bankDetails.banco}</strong>
            </span>
            <span>
              Beneficiario: <strong className="text-gray-900">{bankDetails.beneficiario}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <div>
              <span className="text-[9px] font-mono uppercase text-gray-400 block">CLABE Interbancaria</span>
              <span className="font-mono text-xs font-bold text-gray-900 tracking-wider">
                {bankDetails.clabe}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyClabe}
              className="h-7 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-[10px] font-sora font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedClabe ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedClabe ? "Copiada" : "Copiar CLABE"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 font-inter">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="capitalize">{periodoLabel}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{isSegundoPago ? "2do Abono Requerido" : "1er Abono Requerido"}</span>
          </span>
        </div>
      </div>

      {/* Dropzone / Carga de Comprobante Comprimido */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {!uploadStats ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-brand-blue/40 bg-blue-50/30 hover:bg-blue-50/70 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
                <span className="text-xs font-sora font-bold text-gray-900">
                  Comprimiendo y subiendo comprobante...
                </span>
                <span className="text-[11px] text-gray-500">
                  Optimizando archivo para carga instantánea
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-sm shadow-blue-200">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-sora font-bold text-gray-900">
                  Subir Comprobante de Pago (Foto o PDF)
                </span>
                <span className="text-[11px] text-gray-500">
                  Habilita inmediatamente la pre-reserva de tu fecha de rodaje
                </span>
              </>
            )}
          </button>
        ) : (
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-left space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-sora font-bold text-emerald-950 block truncate">
                    Comprobante listo para validación
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700">
                    {formatBytes(uploadStats.compressedSize)}
                    {uploadStats.savedPercentage > 0
                      ? ` • Optimizado (-${uploadStats.savedPercentage}%)`
                      : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-sora font-semibold text-emerald-700 hover:underline shrink-0 cursor-pointer"
              >
                Cambiar
              </button>
            </div>

            <button
              type="button"
              onClick={() => onReceiptUploaded && onReceiptUploaded(uploadStats.publicUrl)}
              className="w-full h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Elegir Fecha y Pre-Reservar Rodaje</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Soporte por WhatsApp como alternativa */}
      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span className="text-gray-400 text-[11px]">¿Dudas con tu facturación o transferencia?</span>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-600 hover:text-brand-blue transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Contactar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
