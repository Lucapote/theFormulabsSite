import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getProduccionByToken, confirmarReservaProduccion } from "@/services/operationsService";
import BookingFormCard from "@/components/booking/BookingFormCard";
import BookingSuccessCard from "@/components/booking/BookingSuccessCard";
import BookingLockedCard from "@/components/booking/BookingLockedCard";
import BookingSideContextPanel from "@/components/booking/BookingSideContextPanel";
import BookingHeader from "@/components/booking/BookingHeader";
import { BookingLoadingSkeleton, BookingErrorCard } from "@/components/booking/BookingStates";

/**
 * ProductionBookingPage
 * Self-service booking portal for scheduling client productions.
 * Decoupled under 200 lines per GEMINI.md Rule 4.B and Rule 5.
 */
export default function ProductionBookingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [produccion, setProduccion] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [comprobanteSubidoUrl, setComprobanteSubidoUrl] = useState(null);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!token) {
        setError("No se ha proporcionado un token de reserva válido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await getProduccionByToken(token);
      setLoading(false);

      if (res.success && res.data) {
        setProduccion(res.data);
        const cliente = res.data.cliente || {};
        const ciclo = res.data.ciclo || {};
        const totalSesiones = Math.max(1, cliente.producciones_por_mes || 1);
        const sesionesPrimerPago =
          cliente.sesiones_primer_pago || Math.max(1, Math.floor(totalSesiones / 2));
        const esSegundoTramo =
          cliente.esquema_pago === "dos_pagos" &&
          totalSesiones >= 2 &&
          res.data.numero_sesion > sesionesPrimerPago;

        const receiptParaEsteTramo = esSegundoTramo
          ? ciclo.comprobante_2_url || null
          : ciclo.comprobante_url || null;

        if (receiptParaEsteTramo) {
          setComprobanteSubidoUrl(receiptParaEsteTramo);
        }

        const pagoAcreditado = esSegundoTramo
          ? ciclo.estado_pago === "pagado"
          : ["primer_pago", "pagado"].includes(ciclo.estado_pago);

        const isEnRevision =
          !pagoAcreditado &&
          (res.data.estado === "pre_reservada" ||
            (Boolean(ciclo.comprobante_en_revision) && Boolean(receiptParaEsteTramo)));

        const isAgendada =
          res.data.estado === "agendada" && Boolean(res.data.fecha_produccion);

        if (isEnRevision || (isAgendada && pagoAcreditado)) {
          setShowSuccess(true);
        }
      } else {
        setError(res.error || "Sesión de rodaje no encontrada o token inválido.");
      }
    }

    fetchBookingDetails();
  }, [token]);

  const handleBookingSubmit = async (formData) => {
    setIsSubmitting(true);
    const res = await confirmarReservaProduccion(token, {
      ...formData,
      comprobante_url: formData.comprobante_url || comprobanteSubidoUrl || null
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setProduccion(res.data);
      setShowSuccess(true);
      const esPreReserva = res.data.estado === "pre_reservada";
      toast.success(
        esPreReserva
          ? "¡Pre-reserva registrada! Validaremos tu comprobante en breve."
          : "¡Fecha de rodaje agendada con éxito!"
      );

      // Disparar notificación por email vía Resend en segundo plano (non-blocking)
      try {
        fetch("/api/notify-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteNombre: res.data.cliente?.nombre || "Cliente",
            numeroSesion: res.data.numero_sesion || 1,
            mes: res.data.ciclo?.mes,
            anio: res.data.ciclo?.anio,
            fechaProduccion: res.data.fecha_produccion,
            locacion: res.data.locacion,
            notasBrief: res.data.notas_brief,
            esPreReserva,
            comprobanteUrl: formData.comprobante_url || comprobanteSubidoUrl || null
          })
        }).catch((err) => console.warn("Notice: Booking notification dispatch:", err));
      } catch (err) {
        console.warn("Notice: Booking notification dispatch exception:", err);
      }
    } else {
      toast.error(res.error || "Ocurrió un error al confirmar la reserva.");
    }
  };

  const isLocked = Boolean(
    produccion && !produccion.estaDesbloqueada && !comprobanteSubidoUrl
  );

  return (
    <div className="relative min-h-screen bg-[#f4f4f4] text-gray-900 font-inter antialiased overflow-x-hidden selection:bg-[#ef18d6]/20 selection:text-[#ef18d6]">
      <BookingHeader />

      {/* Gradiente Ambiental de Laboratorio */}
      <div className="absolute top-16 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none" />

      <main className="relative max-w-xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 z-10">
        {loading && <BookingLoadingSkeleton />}
        {!loading && error && <BookingErrorCard error={error} />}

        {!loading && !error && produccion && (
          showSuccess ? (
            <div className="max-w-xl mx-auto">
              <BookingSuccessCard
                produccion={produccion}
                onReschedule={() => setShowSuccess(false)}
                onProduccionUpdated={(updated) => setProduccion(updated)}
              />
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              {/* Columna Izquierda: Panel de Contexto Clínico (Laptop/Desktop) */}
              <div className="hidden lg:block lg:col-span-5">
                <BookingSideContextPanel
                  produccion={produccion}
                  cliente={produccion.cliente}
                  ciclo={produccion.ciclo}
                />
              </div>

              {/* Columna Derecha: Tarjeta de Reserva */}
              <div className="lg:col-span-7">
                {isLocked ? (
                  <BookingLockedCard
                    produccion={produccion}
                    cliente={produccion.cliente}
                    ciclo={produccion.ciclo}
                    numeroSesion={produccion.numero_sesion || 1}
                    motivoBloqueo={produccion.motivoBloqueo || "pago_pendiente"}
                    tokenReserva={token}
                    onReceiptUploaded={(url) => setComprobanteSubidoUrl(url)}
                  />
                ) : (
                  <BookingFormCard
                    initialData={produccion}
                    cliente={produccion.cliente}
                    ciclo={produccion.ciclo}
                    onSubmit={handleBookingSubmit}
                    isSubmitting={isSubmitting}
                    tipo={produccion.tipo || produccion.cliente?.tipo_sesion_default || "organica"}
                    duracionHoras={produccion.duracion_horas}
                    comprobanteSubidoUrl={comprobanteSubidoUrl}
                    onComprobanteUploaded={(url) => setComprobanteSubidoUrl(url)}
                  />
                )}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
