import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  Activity,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  XCircle,
  CheckCircle2,
  Trash2,
  FileCheck2
} from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import ConfirmDeleteModal from "@/components/dashboard/common/ConfirmDeleteModal";
import {
  updateProduccion,
  deleteProduccion,
  cancelarFechaProduccion
} from "@/services/operationsService";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";
import { checkProductionPaymentRisk } from "@/utils/bookingHelpers";
import SlugPreviewField from "@/components/common/SlugPreviewField";

const STATUS_CONFIG = {
  pendiente_agendamiento: { label: "Pendiente de agendamiento", color: "bg-amber-500" },
  fecha_propuesta: {
    label: "Fecha propuesta por agencia (Requiere comprobante)",
    color: "bg-sky-500"
  },
  pre_reservada: {
    label: "Pre-reservada por cliente (Validando comprobante)",
    color: "bg-indigo-500"
  },
  agendada: { label: "Agendada (Fecha confirmada)", color: "bg-blue-500" },
  rodaje_completado: { label: "Rodaje completado", color: "bg-purple-500" },
  en_edicion: { label: "En edición / post-producción", color: "bg-pink-500" },
  finalizada: { label: "Finalizada y entregada", color: "bg-emerald-500" }
};

/**
 * ProductionDetailModal
 * Modal clínico administrativo para gestionar, actualizar, cancelar o borrar la sesión de rodaje.
 */
export default function ProductionDetailModal({
  isOpen,
  onClose,
  produccion,
  clienteNombre = "",
  ciclo = null,
  onUpdated,
  onDeleted
}) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    estado: "pendiente_agendamiento",
    fecha_produccion: "",
    duracion_horas: 4,
    locacion: "",
    notas_brief: ""
  });

  const totalSesiones = ciclo?.producciones?.length || 1;
  const defaultSuggestedName = produccion
    ? getSessionDisplayName({ ...produccion, nombre: null }, ciclo?.mes, totalSesiones)
    : "Sesión de Producción";

  useEffect(() => {
    if (produccion) {
      let formattedDate = "";
      if (produccion.fecha_produccion) {
        const d = new Date(produccion.fecha_produccion);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          formattedDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        }
      }
      const initialLocacion =
        produccion.locacion ||
        ciclo?.cliente?.locacion_default ||
        produccion?.cliente?.locacion_default ||
        "";

      const suggestedName = getSessionDisplayName(
        { ...produccion, nombre: null },
        ciclo?.mes,
        totalSesiones
      );

      setFormData({
        nombre: produccion.nombre || suggestedName,
        estado: produccion.estado || "pendiente_agendamiento",
        fecha_produccion: formattedDate,
        duracion_horas: produccion.duracion_horas || (produccion.tipo === "profesional" ? 6 : 4),
        locacion: initialLocacion,
        notas_brief: produccion.notas_brief || ""
      });
    }
  }, [produccion, ciclo, totalSesiones]);

  if (!produccion) return null;

  const reservationUrl = getBookingUrl(produccion.token_reserva);
  const riskInfo = checkProductionPaymentRisk(
    produccion,
    ciclo,
    ciclo?.cliente || {},
    totalSesiones
  );

  // Mapeo estricto del comprobante para esta sesión
  const clienteData = ciclo?.cliente || produccion?.cliente || {};
  const sesionesPrimerPago =
    clienteData.sesiones_primer_pago || Math.max(1, Math.floor(totalSesiones / 2));
  const esSegundoTramo =
    clienteData.esquema_pago === "dos_pagos" &&
    totalSesiones >= 2 &&
    produccion.numero_sesion > sesionesPrimerPago;
  const associatedReceiptUrl = esSegundoTramo
    ? ciclo?.comprobante_2_url
    : ciclo?.comprobante_url;

  const handleOpenMaps = () => {
    const loc = formData.locacion.trim();
    if (!loc) return;
    const url =
      loc.startsWith("http://") || loc.startsWith("https://")
        ? loc
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCancelDate = async () => {
    setLoading(true);
    const res = await cancelarFechaProduccion(produccion.id);
    setLoading(false);
    if (res.success) {
      toast.info("Fecha liberada. La sesión regresó a pendiente de agendamiento.");
      setFormData((prev) => ({
        ...prev,
        fecha_produccion: "",
        estado: "pendiente_agendamiento"
      }));
      if (onUpdated) onUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo cancelar la fecha.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteProduccion(produccion.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);

    if (res.success) {
      toast.success(`Sesión #${produccion.numero_sesion} eliminada.`);
      if (onDeleted) onDeleted(produccion.id);
      onClose();
    } else {
      toast.error(res.error || "No se pudo eliminar la sesión.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const resolvedLocacion =
      formData.locacion.trim() ||
      ciclo?.cliente?.locacion_default ||
      produccion?.cliente?.locacion_default ||
      "";
    const payload = {
      nombre: formData.nombre.trim() || defaultSuggestedName,
      estado: formData.estado,
      duracion_horas: Number(formData.duracion_horas) || 4,
      locacion: resolvedLocacion,
      notas_brief: formData.notas_brief.trim(),
      fecha_produccion: formData.fecha_produccion
        ? new Date(formData.fecha_produccion).toISOString()
        : null
    };
    const res = await updateProduccion(produccion.id, payload);
    setLoading(false);
    if (res.success) {
      toast.success("Sesión de producción actualizada");
      if (onUpdated) onUpdated(res.data);
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar la producción.");
    }
  };

  const displayName = formData.nombre.trim() || defaultSuggestedName;

  const headerBadge = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#188ff0] border border-blue-400/30 inline-flex items-center gap-1.5">
        Sesión #{produccion.numero_sesion || 1} • {produccion.tipo?.toUpperCase() || "RODAJE"}
      </span>
      {Boolean(produccion.precio_extra) && (
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 inline-flex items-center gap-1">
          +${Number(produccion.precio_extra).toLocaleString()} Extra
        </span>
      )}
    </div>
  );

  const headerDescription = (
    <span>
      Cliente: <strong className="text-gray-200 font-bold">{clienteNombre || "Cliente"}</strong>
      {ciclo ? ` • Ciclo ${ciclo.mes}/${ciclo.anio}` : ""}
    </span>
  );

  return (
    <>
      <BaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        maxWidth="max-w-lg"
        badge={headerBadge}
        title={displayName}
        description={headerDescription}
        cancelText="Cancelar"
        submitText="Guardar Cambios"
        loadingText="Guardando..."
        isLoading={loading}
        submitButtonClass="bg-[#188ff0] hover:bg-blue-600 text-white shadow-md shadow-blue-200"
        footerExtra={
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (typeof document !== "undefined") document.activeElement?.blur?.();
              setShowDeleteConfirm(true);
            }}
            className="h-9 px-3.5 rounded-full text-rose-600 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200 text-xs font-sora font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Eliminar</span>
          </button>
        }
      >
        <div className="space-y-4 w-full min-w-0 max-w-full overflow-hidden">
          {/* ALERTA OPERATIVA: Menos de 24h sin pago acreditado */}
          {riskInfo.enRiesgo && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-rose-950 space-y-0.5">
                  <span className="font-sora font-bold block">
                    Alerta Operativa: Rodaje en menos de 24h sin pago acreditado
                  </span>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    El cliente aún no tiene validado el pago correspondiente a esta sesión. Puedes liberar el cupo de agenda ahora o mantener la fecha bajo tu autorización.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCancelDate}
                  className="flex-1 h-8 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-sora font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelar y Liberar Fecha</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, estado: "agendada" }));
                    toast.info("Manteniendo fecha activa. Pulsa Guardar Cambios para confirmar.");
                  }}
                  className="h-8 px-3 rounded-full bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 text-[11px] font-sora font-semibold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mantener</span>
                </button>
              </div>
            </div>
          )}

          {/* COMPROBANTE ASOCIADO A ESTE TRAMO (SI EXISTE) */}
          {associatedReceiptUrl && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="w-4 h-4 text-brand-blue shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-sora font-bold text-gray-900 block truncate">
                    Comprobante de Pago ({esSegundoTramo ? "2do Abono" : "1er Abono"})
                  </span>
                  <span className="text-[11px] font-inter text-gray-500 block truncate">
                    Registrado en el ciclo mensual
                  </span>
                </div>
              </div>
              <a
                href={associatedReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-2.5 rounded-md bg-white hover:bg-gray-50 text-brand-blue border border-blue-200 text-[11px] font-sora font-semibold inline-flex items-center gap-1 shrink-0 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver Comprobante</span>
              </a>
            </div>
          )}

          {/* BLOQUE A — Cronograma y Estado */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3 w-full min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
                A. Cronograma y Estado
              </span>
              {formData.fecha_produccion && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCancelDate}
                  className="inline-flex items-center gap-1 text-[11px] font-sora font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  title="Elimina la fecha asignada y deja la sesión en pendiente"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Cancelar Fecha</span>
                </button>
              )}
            </div>

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">
                Nombre de la Sesión
              </label>
              <input
                type="text"
                placeholder={defaultSuggestedName}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-magenta" /> Estado de la Producción
                </label>
                <span className="flex items-center gap-1.5 text-[11px] font-sora font-semibold text-gray-600">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      STATUS_CONFIG[formData.estado]?.color || "bg-gray-400"
                    }`}
                  />
                  {STATUS_CONFIG[formData.estado]?.label.split(" ")[0]}
                </span>
              </div>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0] cursor-pointer"
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full min-w-0">
              <div className="sm:col-span-2 min-w-0">
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_produccion}
                  onChange={(e) => {
                    const newDateVal = e.target.value;
                    const nextEstado =
                      newDateVal && formData.estado === "pendiente_agendamiento"
                        ? "fecha_propuesta"
                        : formData.estado;
                    setFormData({
                      ...formData,
                      fecha_produccion: newDateVal,
                      estado: nextEstado
                    });
                  }}
                  className="w-full min-w-0 h-10 px-2.5 sm:px-3 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
                />
              </div>
              <div className="min-w-0">
                <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> Duración
                </label>
                <div className="relative w-full min-w-0">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.duracion_horas}
                    onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
                    className="w-full min-w-0 h-10 pl-3 pr-8 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 pointer-events-none">
                    hrs
                  </span>
                </div>
              </div>
            </div>

            {formData.estado === "fecha_propuesta" && (
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span>
                  El cliente verá esta fecha propuesta y deberá <strong>adjuntar obligatoriamente su comprobante de pago</strong> para confirmarla en agenda.
                </span>
              </div>
            )}
          </div>

          {/* BLOQUE B — Logística de Grabación */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3 w-full min-w-0">
            <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
              B. Logística de Grabación
            </span>
            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    ciclo?.cliente?.locacion_default ||
                    produccion?.cliente?.locacion_default ||
                    "En las instalaciones del cliente / Dirección de rodaje"
                  }
                  value={formData.locacion}
                  onChange={(e) => setFormData({ ...formData, locacion: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
                />
                {formData.locacion.trim() && (
                  <button
                    type="button"
                    onClick={handleOpenMaps}
                    title="Abrir en Google Maps"
                    className="h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief y Notas de Rodaje
              </label>
              <textarea
                rows={3}
                placeholder="Objetivos de la sesión, equipo requerido, guiones a rodar..."
                value={formData.notas_brief}
                onChange={(e) => setFormData({ ...formData, notas_brief: e.target.value })}
                className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0] resize-none"
              />
            </div>
          </div>

          {/* BLOQUE C — Previsualización Estandarizada de Enlace de Reserva */}
          {reservationUrl && (
            <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-xl p-3 w-full min-w-0 max-w-full overflow-hidden">
              <SlugPreviewField
                label="Enlace público para que el cliente elija o confirme su fecha:"
                prefix="theformulab.io/reservar/produccion?token="
                slug={produccion.token_reserva}
                copyable
                fullUrl={reservationUrl}
              />
            </div>
          )}
        </div>
      </BaseFormModal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (GEMINI.md) */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isProcessing={isDeleting}
        title={`¿Eliminar Sesión #${produccion.numero_sesion}?`}
        message={
          produccion.precio_extra || produccion.comprobante_url
            ? `Esta acción eliminará definitivamente la sesión. ${
                produccion.comprobante_url
                  ? "Se purgará el comprobante de Cloudflare R2 sin dejar archivos huérfanos. "
                  : ""
              }${
                produccion.precio_extra
                  ? `Se descontará su valor ($${Number(produccion.precio_extra).toLocaleString()}) del monto cobrado del ciclo.`
                  : ""
              }`
            : "Esta acción eliminará definitivamente el registro de la sesión de rodaje de la base de datos."
        }
        confirmText="Eliminar Sesión"
      />
    </>
  );
}
