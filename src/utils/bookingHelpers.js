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
    const label = `${formatHour12(startH)} - ${formatHour12(endH)}`;
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
