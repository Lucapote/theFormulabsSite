import { Resend } from "resend";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Serverless Function: api/notify-booking.js
 * Envía una notificación inmediata vía Resend cuando un cliente agenda su fecha de rodaje.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Método no permitido. Solo se acepta POST."
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "tu_resend_api_key_aqui") {
    console.error("Falta RESEND_API_KEY en variables de entorno.");
    return res.status(500).json({
      success: false,
      error: "No se ha configurado la variable de entorno RESEND_API_KEY en el servidor."
    });
  }

  try {
    const {
      clienteNombre = "Cliente",
      numeroSesion = 1,
      mes = null,
      anio = null,
      fechaProduccion = null,
      locacion = "Sin especificar",
      notasBrief = "Sin notas adicionales",
      esPreReserva = false,
      comprobanteUrl = null
    } = req.body || {};

    let fechaFormateada = "Por definir";
    if (fechaProduccion) {
      try {
        const d = new Date(fechaProduccion);
        fechaFormateada = d.toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch (err) {
        fechaFormateada = String(fechaProduccion);
      }
    }

    const periodoStr = mes && anio ? `${MESES[mes - 1] || mes} ${anio}` : "Ciclo Activo";
    const resend = new Resend(apiKey);

    const fromEmail = process.env.LEAD_NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.LEAD_NOTIFICATION_TO_EMAIL || "theformulab.io@gmail.com";
    const subject = esPreReserva
      ? `🧾 Pre-Reserva + Comprobante: ${clienteNombre} solicitó la Sesión #${numeroSesion}`
      : `🎬 ¡Rodaje Confirmado! ${clienteNombre} agendó la Sesión #${numeroSesion}`;

    const headerTitle = esPreReserva
      ? "¡Pre-Reserva y Comprobante Recibidos!"
      : "¡Sesión de Rodaje Confirmada!";

    const introParagraph = esPreReserva
      ? `El cliente <strong style="color: #ffffff;">${clienteNombre}</strong> ha subido un comprobante de pago y solicitó una <strong style="color: #38bdf8;">Pre-Reserva Temporal</strong> sujeta a tu validación.`
      : `El cliente <strong style="color: #ffffff;">${clienteNombre}</strong> ha completado la confirmación para su sesión de grabación mensual.`;

    const comprobanteButtonHtml = comprobanteUrl
      ? `
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${comprobanteUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 12px 28px; border-radius: 9999px;">
                      📄 Ver Comprobante Subido &rarr;
                    </a>
                  </td>
                </tr>`
      : "";

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f17; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Lab -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1f2937; background: linear-gradient(135deg, rgba(239, 24, 214, 0.08) 0%, rgba(24, 143, 240, 0.08) 100%);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #188ff0; margin-bottom: 6px;">
                THE FORMULAB &bull; OPERATIONS PROTOCOL
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${headerTitle}
              </h1>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                ${introParagraph}
              </p>

              <!-- Tabla de Parámetros de la Sesión -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Cliente &amp; Periodo</div>
                    <div style="font-size: 14px; color: #f8fafc; font-weight: 700; margin-top: 2px;">
                      ${clienteNombre} <span style="color: #188ff0;">(${periodoStr})</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Sesión Asignada</div>
                    <div style="font-size: 14px; color: #ef18d6; font-weight: 700; margin-top: 2px;">
                      Sesión de Rodaje #${numeroSesion} ${esPreReserva ? "(Pre-Reserva Pendiente de Validar)" : ""}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Fecha y Hora Agendada</div>
                    <div style="font-size: 14px; color: #10b981; font-weight: 700; margin-top: 2px;">
                      📅 ${fechaFormateada}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Locación / Dirección</div>
                    <div style="font-size: 13px; color: #e2e8f0; margin-top: 2px;">
                      📍 ${locacion || "Sin especificar"}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Notas y Brief del Cliente</div>
                    <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px; line-height: 20px; white-space: pre-wrap;">
                      ${notasBrief || "Sin observaciones adicionales"}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Botón CTA a Dashboard -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${comprobanteButtonHtml}
                <tr>
                  <td align="center">
                    <a href="https://www.theformulab.io/dashboard" target="_blank" style="display: inline-block; background-color: #188ff0; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(24, 143, 240, 0.4);">
                      Ver Operaciones en el Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0c121e; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #475569;">
              Notificación automática del Sistema de Operaciones &bull; The Formulab &copy; 2026
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Notificación de rodaje enviada correctamente.",
      emailId: data?.id
    });
  } catch (err) {
    console.error("api/notify-booking unexpected error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
