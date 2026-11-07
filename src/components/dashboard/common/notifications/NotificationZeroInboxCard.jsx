import { CheckCircle2 } from "lucide-react";

/**
 * NotificationZeroInboxCard
 * Estado vacío para cuando no hay asuntos pendientes.
 */
export default function NotificationZeroInboxCard() {
  return (
    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 space-y-2 shadow-2xs my-2">
      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
      <h5 className="font-sora font-bold text-xs text-gray-900">
        ¡Bandeja Despejada!
      </h5>
      <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-relaxed font-inter">
        No hay publicaciones con error en Meta ni pre-reservas pendientes de validación.
      </p>
    </div>
  );
}

