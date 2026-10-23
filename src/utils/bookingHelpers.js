  /**
 * Helper utilities for booking validations and scheduling rules.
 * Pure JS functions conforming to GEMINI.md standards.
 */

/**
 * Horas de inicio permitidas para reservas de grabación (09:00 AM a 02:00 PM).
 */
export const BOOKING_START_HOURS = [9, 10, 11, 12, 13, 14];

/**
 * Formatea una hora numérica a formato de 12 horas con AM/PM (ej. "09:00 AM", "01:00 PM").
 *
 * @param {number|string} hour - Hora en formato 24h (0-23)
 * @param {number} [minutes=0] - Minutos
 * @returns {string}
 */
export function formatHour12(hour, minutes = 0) {
  const rawH = typeof hour === "string" ? parseInt(hour, 10) : Number(hour);
  const normalizedH = isNaN(rawH) ? 9 : ((rawH % 24) + 24) % 24;
  const period = normalizedH >= 12 ? "PM" : "AM";
  const h12 = normalizedH % 12 === 0 ? 12 : normalizedH % 12;
  const hStr = String(h12).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  return `${hStr}:${mStr} ${period}`;
}

/**
 * Formatea un rango de horario exacto (horas y minutos) calculando la hora final
 * en base a la duración de la sesión.
 * Ej: "09:30", 5 -> "09:30 AM - 02:30 PM (5 hrs)"
 *
 * @param {string} startHHMM - Hora de inicio en formato "HH:MM"
 * @param {number} [durationHours=4] - Duración de la sesión en horas
 * @returns {string}
 */
export function formatTimeRange(startHHMM, durationHours = 4) {
  if (!startHHMM) return "";
  const parts = String(startHHMM).split(":");
  const startH = parseInt(parts[0], 10) || 0;
  const startM = parseInt(parts[1], 10) || 0;
  const duration = Number(durationHours) || 4;

  const totalStartMinutes = startH * 60 + startM;
  const totalEndMinutes = totalStartMinutes + Math.round(duration * 60);

  const endH = Math.floor(totalEndMinutes / 60) % 24;
  const endM = totalEndMinutes % 60;

  const startFormatted = formatHour12(startH, startM);
  const endFormatted = formatHour12(endH, endM);
  const durLabel = duration === 1 ? "1 hr" : `${duration} hrs`;

  return `${startFormatted} - ${endFormatted} (${durLabel})`;
}

/**
 * Genera la lista de turnos de grabación hora por hora de 9:00 AM a 2:00 PM (14:00),
 * calculando la hora de finalización sumando la cantidad de horas de sesión.
 *
 * @param {number} [durationHours=4] - Duración de la sesión en horas.
 * @returns {Array<{ value: string, label: string, startHour: number, endHour: number }>}
 */
export function getRecordingShifts(durationHours = 4) {
  const duration = Math.max(1, Number(durationHours) || 4);

  return BOOKING_START_HOURS.map((startH) => {
    const endH = startH + duration;
    const value = `${String(startH).padStart(2, "0")}:00`;
    const label = formatTimeRange(value, duration);
    return {
      value,
      label,
      startHour: startH,
      endHour: endH
    };
  });
}

/**
 * Normaliza y resuelve la información de tipo de sesión, duración y descripción técnica
 * para garantizar 100% de consistencia entre la vista pública y el modal de SLA.
 *
 * @param {string} [tipo="organica"] - Tipo de sesión registrado.
 * @param {number|null} [duracionHoras=null] - Horas explícitas de duración si existen.
 * @returns {{ isProfesional: boolean, hours: number, title: string, badge: string, technicalDescription: string }}
 */
export function getSessionTypeInfo(tipo = "organica", duracionHoras = null) {
  const isProfesional = tipo === "profesional" || tipo === "hibrido" || Number(duracionHoras) === 6;
  const hours = Number(duracionHoras) > 0 ? Number(duracionHoras) : (isProfesional ? 6 : 4);
  const title = isProfesional ? "Profesional" : "Orgánica";
  const badge = isProfesional
    ? `Profesional • ${hours}h de levantamiento`
    : `Orgánica • ${hours}h de levantamiento`;
  const technicalDescription = isProfesional
    ? "Despliegue de equipo completo y crew técnico (cámara, iluminación y audio)."
    : "Producción ágil para formatos cortos verticales con equipamiento especializado.";

  return {
    isProfesional,
    hours,
    title,
    badge,
    technicalDescription
  };
}

/**
 * Turnos oficiales de grabación de la agencia The Formulab (por defecto 4h).
 */
export const RECORDING_SHIFTS = getRecordingShifts(4);

/**
 * Calcula la fecha mínima de reserva sumando N días hábiles (Lunes a Viernes).
 *
 * @param {Date} [startDate=new Date()]
 * @param {number} [businessDays=3]
 * @returns {Date}
 */
export function getMinBusinessBookingDate(startDate = new Date(), businessDays = 3) {
  let count = 0;
  const current = new Date(startDate);
  current.setHours(12, 0, 0, 0);

  while (count < businessDays) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return current;
}

/**
 * Formatea una fecha local a YYYY-MM-DD sin desviaciones de zona horaria.
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatLocalDateToYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calcula cuántas sesiones por defecto libera el 1er pago en un esquema de 2 pagos.
 * Conservador por defecto: floor(total / 2) (ej. 2 -> 1, 3 -> 1, 4 -> 2).
 *
 * @param {number} [totalSesiones=2]
 * @returns {number}
 */
export function getDefaultFirstPaymentSessions(totalSesiones = 2) {
  const total = Math.max(1, Number(totalSesiones) || 1);
  if (total <= 1) return 1;
  return Math.max(1, Math.floor(total / 2));
}

/**
 * Genera las opciones de reparto de sesiones entre 1er Pago y 2do Pago
 * cuando un cliente tiene 2 pagos mensuales y 2, 3 o 4 sesiones.
 *
 * @param {number} [totalSesiones=2]
 * @returns {Array<{ firstPaymentSessions: number, secondPaymentSessions: number, label: string, shortLabel: string }>}
 */
export function getPaymentSplitOptions(totalSesiones = 2) {
  const total = Math.max(1, Number(totalSesiones) || 1);
  if (total <= 1) {
    return [
      {
        firstPaymentSessions: 1,
        secondPaymentSessions: 0,
        label: "1er Pago: 1 sesión",
        shortLabel: "1 sesión"
      }
    ];
  }

  if (total === 2) {
    return [
      {
        firstPaymentSessions: 1,
        secondPaymentSessions: 1,
        label: "1er Pago: 1 ses. • 2do Pago: 1 ses.",
        shortLabel: "1 y 1 ses."
      }
    ];
  }

  if (total === 3) {
    return [
      {
        firstPaymentSessions: 1,
        secondPaymentSessions: 2,
        label: "1er Pago: 1 ses. • 2do Pago: 2 ses.",
        shortLabel: "1ª: 1 ses • 2ª: 2 ses"
      },
      {
        firstPaymentSessions: 2,
        secondPaymentSessions: 1,
        label: "1er Pago: 2 ses. • 2do Pago: 1 ses.",
        shortLabel: "1ª: 2 ses • 2ª: 1 ses"
      }
    ];
  }

  // total >= 4
  return [
    {
      firstPaymentSessions: 2,
      secondPaymentSessions: total - 2,
      label: `1er Pago: 2 ses. • 2do Pago: ${total - 2} ses.`,
      shortLabel: `1ª: 2 ses • 2ª: ${total - 2} ses`
    },
    {
      firstPaymentSessions: 1,
      secondPaymentSessions: total - 1,
      label: `1er Pago: 1 ses. • 2do Pago: ${total - 1} ses.`,
      shortLabel: `1ª: 1 ses • 2ª: ${total - 1} ses`
    },
    {
      firstPaymentSessions: 3,
      secondPaymentSessions: Math.max(1, total - 3),
      label: `1er Pago: 3 ses. • 2do Pago: ${Math.max(1, total - 3)} ses.`,
      shortLabel: `1ª: 3 ses • 2ª: ${Math.max(1, total - 3)} ses`
    }
  ];
}

/**
 * Determina si el tramo de pago requerido para una sesión específica ya fue acreditado.
 *
 * @param {object} produccion - { numero_sesion }
 * @param {object} ciclo - { estado_pago }
 * @param {object} cliente - { esquema_pago, dia_corte_pago_2, producciones_por_mes, sesiones_primer_pago }
 * @param {number} [totalCount]
 * @returns {{ pagoAcreditado: boolean, requiereSegundoPago: boolean, maxPrimerPago: number }}
 */
export function isSessionPaymentSatisfied(produccion, ciclo, cliente = {}, totalCount = null) {
  const cuotaPautada = Math.max(1, Number(cliente?.producciones_por_mes) || 1);
  const numSesion = Number(produccion?.numero_sesion) || 1;
  const esSesionExtra =
    Boolean(produccion?.precio_extra) ||
    numSesion > cuotaPautada ||
    Boolean(produccion?.nombre && produccion.nombre.toLowerCase().includes("extra"));

  // 1. Si es sesión extra, su cobro es independiente del ciclo mensual base
  if (esSesionExtra) {
    const estaAgendadaOFinal =
      produccion?.estado === "agendada" ||
      ["rodaje_completado", "en_edicion", "finalizada"].includes(produccion?.estado);

    return {
      pagoAcreditado: estaAgendadaOFinal,
      esSesionExtra: true,
      requiereSegundoPago: false,
      maxPrimerPago: cuotaPautada
    };
  }

  // 2. Sesiones regulares cubiertas por el retainer / cuota mensual
  const estadoPago = ciclo?.estado_pago || "pendiente";
  const total = cuotaPautada;
  const isDosPagos =
    (cliente?.esquema_pago === "quincenal" ||
      cliente?.esquema_pago === "dos_pagos" ||
      Boolean(cliente?.dia_corte_pago_2)) &&
    total >= 2;

  const configuredFirst = Number(cliente?.sesiones_primer_pago);
  const maxPrimerPago =
    isDosPagos && configuredFirst >= 1 && configuredFirst < total
      ? configuredFirst
      : getDefaultFirstPaymentSessions(total);

  if (estadoPago === "pagado") {
    return { pagoAcreditado: true, esSesionExtra: false, requiereSegundoPago: false, maxPrimerPago };
  }

  if (!isDosPagos) {
    return { pagoAcreditado: false, esSesionExtra: false, requiereSegundoPago: false, maxPrimerPago: total };
  }

  if (numSesion <= maxPrimerPago) {
    return {
      pagoAcreditado: estadoPago === "primer_pago",
      esSesionExtra: false,
      requiereSegundoPago: false,
      maxPrimerPago
    };
  }

  return {
    pagoAcreditado: false,
    esSesionExtra: false,
    requiereSegundoPago: true,
    maxPrimerPago
  };
}

/**
 * Evalúa si una sesión con fecha programada (propuesta por agencia, pre-reservada o agendada)
 * se encuentra "En riesgo / Falta pago" por estar a menos de 24 horas del rodaje sin pago acreditado.
 *
 * @param {object} produccion - { estado, fecha_produccion, numero_sesion }
 * @param {object} ciclo - { estado_pago }
 * @param {object} cliente - Configuración del cliente
 * @param {number} [totalCount]
 * @returns {{ enRiesgo: boolean, horasRestantes: number | null, plazoVencido: boolean }}
 */
export function checkProductionPaymentRisk(produccion, ciclo, cliente = {}, totalCount = null) {
  if (!produccion || !produccion.fecha_produccion) {
    return { enRiesgo: false, horasRestantes: null, plazoVencido: false };
  }

  if (["rodaje_completado", "en_edicion", "finalizada"].includes(produccion.estado)) {
    return { enRiesgo: false, horasRestantes: null, plazoVencido: false };
  }

  const { pagoAcreditado } = isSessionPaymentSatisfied(produccion, ciclo, cliente, totalCount);
  if (pagoAcreditado) {
    return { enRiesgo: false, horasRestantes: null, plazoVencido: false };
  }

  const targetTime = new Date(produccion.fecha_produccion).getTime();
  if (isNaN(targetTime)) {
    return { enRiesgo: false, horasRestantes: null, plazoVencido: false };
  }

  const diffMs = targetTime - Date.now();
  const horasRestantes = Math.round(diffMs / (1000 * 60 * 60));

  // Si faltan 24 horas o menos para la grabación y el pago aún no está acreditado
  if (horasRestantes <= 24) {
    return {
      enRiesgo: true,
      horasRestantes,
      plazoVencido: horasRestantes <= 0
    };
  }

  return {
    enRiesgo: false,
    horasRestantes,
    plazoVencido: false
  };
}
