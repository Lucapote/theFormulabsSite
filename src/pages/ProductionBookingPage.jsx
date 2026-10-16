import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProduccionByToken, confirmarReservaProduccion } from "@/services/operationsService";
import { getSessionDisplayName } from "@/utils/formatters";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingFormCard from "@/components/booking/BookingFormCard";
import BookingSuccessCard from "@/components/booking/BookingSuccessCard";
import BookingLockedCard from "@/components/booking/BookingLockedCard";

export default function ProductionBookingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [produccion, setProduccion] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        const estaPagado = res.data.estaDesbloqueada || res.data.ciclo?.estado_pago === "pagado";
        // Si el ciclo está pagado y la producción ya está agendada, mostrar confirmación
        if (estaPagado && res.data.estado === "agendada" && res.data.fecha_produccion) {
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
    const res = await confirmarReservaProduccion(token, formData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setProduccion(res.data);
      setShowSuccess(true);
      toast.success("¡Fecha de rodaje agendada con éxito!");

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
            notasBrief: res.data.notas_brief
          })
        }).catch((err) => console.warn("Notice: Booking notification dispatch:", err));
      } catch (err) {
        console.warn("Notice: Booking notification dispatch exception:", err);
      }
    } else {
      toast.error(res.error || "Ocurrió un error al confirmar la reserva.");
    }
  };

  const isLocked = Boolean(produccion && !produccion.estaDesbloqueada);

  return (
    <div className="relative min-h-screen bg-[#f4f4f4] text-gray-900 font-inter antialiased overflow-x-hidden selection:bg-[#ef18d6]/20 selection:text-[#ef18d6]">
      {/* Top Navbar Institucional (Logo anclado y barra de navegación) */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center">
            <img src="/logo.png" alt="The Formulab" className="h-8 sm:h-9 w-auto object-contain" />
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
            <span>Auto-Reserva de Producción</span>
          </span>
        </div>
      </header>

      {/* Gradiente Ambiental de Laboratorio */}
      <div className="absolute top-16 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none" />

      <main className="relative max-w-xl mx-auto px-4 py-8 sm:py-12 z-10">
        {/* Estado: Cargando con Skeletons */}
        {loading && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-2 mb-6">
              <Skeleton className="h-5 w-48 mx-auto rounded-full bg-gray-200" />
              <Skeleton className="h-8 w-64 mx-auto rounded-xl bg-gray-200" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl bg-gray-200" />
          </div>
        )}

        {/* Estado: Error de Token */}
        {!loading && error && (
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-sora font-bold text-gray-900 text-lg mb-2">
              Enlace de Reserva Inválido
            </h2>
            <p className="font-inter text-xs text-gray-500 mb-6">
              {error} Verifica que el enlace esté completo o solicita a tu gestor de cuenta un nuevo link de reserva.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ir al Inicio</span>
            </Link>
          </div>
        )}

        {/* Estado: Vista Activa de Reserva */}
        {!loading && !error && produccion && (
          <div>
            {isLocked ? (
              <BookingLockedCard
                cliente={produccion.cliente}
                ciclo={produccion.ciclo}
                numeroSesion={produccion.numero_sesion || 1}
                motivoBloqueo={produccion.motivoBloqueo || "pago_pendiente"}
              />
            ) : (
              <div>
                <BookingHeader
                  sessionTitle={getSessionDisplayName(
                    produccion,
                    produccion.ciclo?.mes,
                    produccion.cliente?.producciones_por_mes || 1
                  )}
                  numeroSesion={produccion.numero_sesion || 1}
                  clienteNombre={produccion.cliente?.nombre || ""}
                  empresa={produccion.cliente?.empresa || ""}
                  tipo={produccion.tipo || produccion.cliente?.tipo_sesion_default || "organica"}
                  duracionHoras={produccion.duracion_horas}
                />

                {showSuccess ? (
                  <BookingSuccessCard
                    produccion={produccion}
                    onReschedule={() => setShowSuccess(false)}
                  />
                ) : (
                  <BookingFormCard
                    initialData={produccion}
                    cliente={produccion.cliente}
                    onSubmit={handleBookingSubmit}
                    isSubmitting={isSubmitting}
                    tipo={produccion.tipo || produccion.cliente?.tipo_sesion_default || "organica"}
                    duracionHoras={produccion.duracion_horas}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
