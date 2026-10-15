import { LockKeyhole, MessageCircle, RefreshCw, AlertCircle, Building2, Calendar } from "lucide-react";

/**
 * BookingLockedCard
 * Gatekeeper screen shown when a client opens a production booking link
 * but the session is locked (waiting for initial payment or second payment).
 *
 * @param {object} props
 * @param {object} [props.cliente] - Client info (nombre, empresa, etc.)
 * @param {object} [props.ciclo] - Monthly cycle info (mes, anio, monto_cobrado, estado_pago)
 * @param {number} [props.numeroSesion=1] - Assigned session number
 * @param {string} [props.motivoBloqueo="pago_pendiente"] - "pago_pendiente" | "esperando_segundo_pago"
 */
export default function BookingLockedCard({
  cliente = {},
  ciclo = {},
  numeroSesion = 1,
  motivoBloqueo = "pago_pendiente"
}) {
  const isSegundoPago = motivoBloqueo === "esperando_segundo_pago";

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

  const waMessage = encodeURIComponent(
    isSegundoPago
      ? `Hola The Formulab, ya realicé el segundo abono de mi ciclo de ${periodoLabel} (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la sesión #${numeroSesion}.`
      : `Hola The Formulab, ya realicé el pago de mi ciclo de ${periodoLabel} (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la reserva de rodaje.`
  );
  const waUrl = `https://wa.me/529981234567?text=${waMessage}`;

  return (
    <div className="max-w-xl w-full mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 text-center space-y-6 font-inter">
      {/* Insignia Visual de Estado con Glow Suave */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
        <div className="relative w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-xs">
          <LockKeyhole className="w-7 h-7 text-amber-600" />
        </div>
      </div>

      {/* Títulos y Jerarquía Clínica */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-mono font-bold tracking-wider uppercase border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isSegundoPago
              ? `Segundo Corte • Sesión #${numeroSesion}`
              : "Paso 1 Pendiente • Activación de Cuenta"}
          </span>
        </div>

        <h2 className="font-sora text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {isSegundoPago
            ? "Sesión Reservada para tu Segundo Corte"
            : "Reserva en Espera de Confirmación"}
        </h2>

        <p className="text-xs sm:text-sm font-inter text-gray-500 max-w-md mx-auto leading-relaxed">
          {isSegundoPago
            ? "Esta sesión corresponde a la segunda mitad de tu ciclo operativo mensual. Para asegurar tu slot en agenda, este portal se desbloqueará automáticamente al acreditar tu segundo abono del mes."
            : "Para garantizar la asignación del equipo de filmación y dirección creativa, el sistema requiere la confirmación del pago del ciclo operativo. Una vez validado por la agencia, este portal se desbloqueará automáticamente para seleccionar tu fecha de rodaje."}
        </p>
      </div>

      {/* Tarjeta Resumen Clínico del Ciclo */}
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
                <span className="text-[11px] text-gray-500 block">
                  {displayCompany}
                </span>
              )}
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-gray-200/80 text-gray-700 border border-gray-300">
            Sesión #{numeroSesion}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-200/60 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 font-inter">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="capitalize">{periodoLabel}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{isSegundoPago ? "2do Abono Pendiente" : "Pago Pendiente"}</span>
          </span>
        </div>
      </div>

      {/* Acciones y CTAs */}
      <div className="space-y-3 pt-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{isSegundoPago ? "Notificar 2do Abono por WhatsApp" : "Notificar Pago por WhatsApp"}</span>
        </a>

        <div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer py-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>¿Ya realizaste tu transferencia? Actualizar estado</span>
          </button>
        </div>
      </div>
    </div>
  );
}
