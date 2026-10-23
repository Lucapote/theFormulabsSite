import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  PlusCircle,
  Video,
  DollarSign
} from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { createProduccionExtra } from "@/services/operationsService";
import { getSessionDisplayName, MESES_ANIO } from "@/utils/formatters";

/**
 * CreateProductionModal
 * Modal clínico para crear una nueva sesión de rodaje (extra o reposición) en un ciclo mensual.
 */
export default function CreateProductionModal({
  isOpen,
  onClose,
  ciclo,
  cliente,
  onCreated
}) {
  const [loading, setLoading] = useState(false);
  const totalExisting = ciclo?.producciones?.length || 0;
  const nextNumero = totalExisting + 1;
  const cuotaPautada = Number(cliente?.producciones_por_mes) || 1;
  const isExtra = nextNumero > cuotaPautada;

  const mesNombre = ciclo?.mes && MESES_ANIO[ciclo.mes - 1] ? MESES_ANIO[ciclo.mes - 1] : "Sesión";
  const defaultSuggestedName = isExtra
    ? `${mesNombre} Extra`
    : getSessionDisplayName({ numero_sesion: nextNumero, nombre: null }, ciclo?.mes, nextNumero);

  const [formData, setFormData] = useState({
    nombre: defaultSuggestedName,
    tipo: cliente?.tipo_sesion_default || "organica",
    duracion_horas: cliente?.tipo_sesion_default === "profesional" ? 6 : 4,
    locacion: cliente?.locacion_default || "",
    proponerFecha: false,
    fecha_produccion: "",
    notas_brief: "",
    precio_extra: ""
  });

  useEffect(() => {
    if (isOpen) {
      const isProf = (cliente?.tipo_sesion_default || "organica") === "profesional";
      const currentMesNombre = ciclo?.mes && MESES_ANIO[ciclo.mes - 1] ? MESES_ANIO[ciclo.mes - 1] : "Sesión";
      const suggested = isExtra
        ? `${currentMesNombre} Extra`
        : getSessionDisplayName({ numero_sesion: nextNumero, nombre: null }, ciclo?.mes, nextNumero);

      setFormData({
        nombre: suggested,
        tipo: cliente?.tipo_sesion_default || "organica",
        duracion_horas: isProf ? 6 : 4,
        locacion: cliente?.locacion_default || "",
        proponerFecha: false,
        fecha_produccion: "",
        notas_brief: "",
        precio_extra: ""
      });
    }
  }, [isOpen, ciclo, cliente, nextNumero, isExtra]);

  const handleTipoChange = (newTipo) => {
    setFormData((prev) => ({
      ...prev,
      tipo: newTipo,
      duracion_horas: newTipo === "profesional" ? 6 : 4
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ciclo?.id || !cliente?.id) {
      toast.error("Datos incompletos del ciclo o cliente.");
      return;
    }

    setLoading(true);

    const payload = {
      ciclo_id: ciclo.id,
      cliente_id: cliente.id,
      nombre: formData.nombre.trim() || defaultSuggestedName,
      tipo: formData.tipo,
      duracion_horas: Number(formData.duracion_horas) || 4,
      locacion: formData.locacion.trim() || null,
      fecha_produccion:
        formData.proponerFecha && formData.fecha_produccion
          ? new Date(formData.fecha_produccion).toISOString()
          : null,
      notas_brief: formData.notas_brief.trim(),
      estado:
        formData.proponerFecha && formData.fecha_produccion
          ? "fecha_propuesta"
          : "pendiente_agendamiento",
      precio_extra: isExtra && formData.precio_extra ? Number(formData.precio_extra) : null
    };

    const res = await createProduccionExtra(payload);
    setLoading(false);

    if (res.success) {
      toast.success(`Sesión "${payload.nombre}" agregada exitosamente.`);
      if (onCreated) onCreated(res.data);
      onClose();
    } else {
      toast.error(res.error || "No se pudo crear la sesión.");
    }
  };

  const headerBadge = isExtra ? (
    <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 inline-flex items-center gap-1.5">
      <Sparkles className="w-3 h-3" />
      Sesión Extra #{nextNumero}
    </span>
  ) : (
    <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#188ff0] border border-blue-400/30 inline-flex items-center gap-1.5">
      <PlusCircle className="w-3 h-3" />
      Nueva Sesión #{nextNumero}
    </span>
  );

  const headerDescription = (
    <span>
      Cliente: <strong className="text-gray-200 font-bold">{cliente?.nombre || "Cliente"}</strong>
      {ciclo ? ` • Ciclo ${ciclo.mes}/${ciclo.anio}` : ""}
      {isExtra ? ` • Cuota pactada: ${cuotaPautada}` : ""}
    </span>
  );

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="max-w-lg"
      badge={headerBadge}
      title={isExtra ? "Agregar Sesión Extra" : "Agregar Sesión de Rodaje"}
      description={headerDescription}
      cancelText="Cancelar"
      submitText={isExtra ? "Crear Sesión Extra" : "Crear Sesión de Rodaje"}
      loadingText="Creando..."
      isLoading={loading}
      submitButtonClass="bg-[#188ff0] hover:bg-blue-600 text-white shadow-md shadow-blue-200"
    >
      <div className="space-y-4 w-full min-w-0 max-w-full overflow-hidden font-inter">
        {/* BLOQUE A — Configuración Básica */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
            A. Datos de la Sesión
          </span>

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

          {/* Bloque destacado si excede la cuota de sesiones contratadas */}
          {isExtra && (
            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Sesión Extra ({nextNumero} de {cuotaPautada} contratadas)
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Facturación Adicional</span>
              </div>
              <div>
                <label className="text-[11px] font-sora font-bold text-gray-800 uppercase mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Precio de la Sesión Extra ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.precio_extra}
                    onChange={(e) => setFormData({ ...formData, precio_extra: e.target.value })}
                    className="w-full h-10 pl-7 pr-3 text-xs font-mono font-bold bg-white border border-amber-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                  Este monto se sumará automáticamente a la facturación cobrada del ciclo mensual.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-brand-blue" /> Tipo de Formato
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0] cursor-pointer"
              >
                <option value="organica">Orgánica (4 hrs)</option>
                <option value="profesional">Profesional (6 hrs)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" /> Duración
              </label>
              <div className="relative w-full">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.duracion_horas}
                  onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
                  className="w-full h-10 pl-3 pr-8 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 pointer-events-none">
                  hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE B — Fecha y Agendamiento */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
            B. Fecha y Modalidad de Reserva
          </span>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="toggle-proponer-fecha"
              checked={formData.proponerFecha}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proponerFecha: e.target.checked
                })
              }
              className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
            />
            <label
              htmlFor="toggle-proponer-fecha"
              className="text-xs font-sora font-semibold text-gray-800 cursor-pointer select-none"
            >
              Proponer fecha de inmediato desde la agencia
            </label>
          </div>

          {formData.proponerFecha ? (
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora Propuesta
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_produccion}
                onChange={(e) => setFormData({ ...formData, fecha_produccion: e.target.value })}
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
              />
              <p className="text-[11px] text-sky-800 bg-sky-50 border border-sky-200 p-2 rounded-lg leading-relaxed">
                La sesión quedará en estado <strong>Fecha Propuesta</strong>. El cliente podrá confirmar este horario o ajustarlo desde su enlace público.
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              La sesión se creará en estado <strong>Pendiente de agendamiento</strong>. Se generará un enlace de auto-reserva para que el cliente elija el día y turno que prefiera.
            </p>
          )}
        </div>

        {/* BLOQUE C — Logística y Notas */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
            C. Logística de Rodaje
          </span>

          <div>
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
            </label>
            <input
              type="text"
              placeholder={cliente?.locacion_default || "Instalaciones del cliente / Dirección de rodaje"}
              value={formData.locacion}
              onChange={(e) => setFormData({ ...formData, locacion: e.target.value })}
              className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
            />
          </div>

          <div>
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief Inicial o Notas
            </label>
            <textarea
              rows={2}
              placeholder="Objetivos, guiones o requerimientos para este rodaje extra..."
              value={formData.notas_brief}
              onChange={(e) => setFormData({ ...formData, notas_brief: e.target.value })}
              className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0] resize-none"
            />
          </div>
        </div>
      </div>
    </BaseFormModal>
  );
}
