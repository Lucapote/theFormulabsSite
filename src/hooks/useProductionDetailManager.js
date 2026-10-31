import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateProduccion,
  deleteProduccion,
  cancelarFechaProduccion
} from "@/services/operationsService";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";
import { checkProductionPaymentRisk } from "@/utils/bookingHelpers";

/**
 * useProductionDetailManager
 * Encapsulates state, form lifecycle, deletion, and update operations for a production session.
 */
export function useProductionDetailManager({
  produccion,
  ciclo,
  onUpdated,
  onDeleted,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalSesiones = ciclo?.producciones?.length || 1;
  const defaultSuggestedName = produccion
    ? getSessionDisplayName({ ...produccion, nombre: null }, ciclo?.mes, totalSesiones)
    : "Sesión de Producción";

  const [formData, setFormData] = useState({
    nombre: "",
    estado: "pendiente_agendamiento",
    fecha_produccion: "",
    duracion_horas: 4,
    locacion: "",
    notas_brief: ""
  });

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

  const reservationUrl = produccion ? getBookingUrl(produccion.token_reserva) : null;
  const riskInfo = checkProductionPaymentRisk(
    produccion,
    ciclo,
    ciclo?.cliente || {},
    totalSesiones
  );

  const clienteData = ciclo?.cliente || produccion?.cliente || {};
  const sesionesPrimerPago =
    clienteData.sesiones_primer_pago || Math.max(1, Math.floor(totalSesiones / 2));
  const esSegundoTramo =
    clienteData.esquema_pago === "dos_pagos" &&
    totalSesiones >= 2 &&
    produccion?.numero_sesion > sesionesPrimerPago;
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

  return {
    loading,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    formData,
    setFormData,
    defaultSuggestedName,
    displayName,
    reservationUrl,
    riskInfo,
    associatedReceiptUrl,
    esSegundoTramo,
    handleOpenMaps,
    handleCancelDate,
    handleDelete,
    handleSubmit
  };
}

