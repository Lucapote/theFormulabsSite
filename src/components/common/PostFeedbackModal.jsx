import { useState } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { solicitarCambiosPost } from "@/services/calendarService";

/**
 * PostFeedbackModal
 * Modal ergonómico construido sobre BaseFormModal para registrar observaciones
 * de cambios solicitados por el cliente en una publicación 'en_aprobacion'.
 */
export default function PostFeedbackModal({
  isOpen,
  onClose,
  post,
  onSuccess
}) {
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!observaciones || !observaciones.trim()) {
      toast.error("Por favor escribe las observaciones o ajustes que necesitas.");
      return;
    }

    setIsSubmitting(true);
    const res = await solicitarCambiosPost(post.id, observaciones);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("¡Observaciones enviadas a la agencia! El post pasó a 'En edición'.");
      setObservaciones("");
      if (onSuccess) {
        onSuccess({
          ...post,
          estado: "en_edicion",
          notas_cambios: observaciones.trim(),
          fecha_cambios: new Date().toISOString()
        });
      }
      onClose();
    } else {
      toast.error(res.error || "No se pudo registrar la solicitud de cambios.");
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      eyebrow="REVISIÓN EDITORIAL"
      eyebrowColor="text-amber-500"
      icon={MessageSquare}
      title="Solicitar Cambios en la Publicación"
      description="Detalla con precisión las correcciones de copy, encuadre o visuales que debe realizar el equipo."
      maxWidth="max-w-lg"
      cancelText="Cancelar"
      submitText={isSubmitting ? "Enviando..." : "Enviar Observaciones"}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4 font-inter">
        {/* Banner informativo */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Al enviar este formulario, el estado de la publicación pasará automáticamente a{" "}
            <strong className="font-semibold text-amber-950 font-sora">En edición (Amarillo)</strong>{" "}
            y se notificará al equipo de producción de The Formulab.
          </p>
        </div>

        {/* Textarea de Observaciones */}
        <div className="space-y-1.5">
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide">
            Observaciones o Ajustes Requeridos *
          </label>
          <textarea
            rows={5}
            required
            autoFocus
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Modificar la segunda línea del copy para mencionar la promoción de temporada. En el carrusel, cambiar el orden de las fotos 2 y 3..."
            className="w-full p-3.5 rounded-2xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 outline-none text-sm text-gray-900 font-medium transition-all leading-relaxed font-inter"
          />
          <span className="text-[11px] font-mono text-gray-400 block text-right">
            {observaciones.length} caracteres
          </span>
        </div>
      </div>
    </BaseFormModal>
  );
}
