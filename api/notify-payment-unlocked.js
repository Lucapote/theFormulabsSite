import { Resend } from "resend";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Serverless Function: api/notify-payment-unlocked.js
 * Envía un correo al cliente notificándole que su pago fue validado y entregando
 * el enlace directo para agendar la fecha y hora de su rodaje.
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
      clienteEmail,
      clienteNombre = "Cliente",
      empresa = "",
      montoCobrado = 0,
      mes = null,
      anio = null,
      tokenReserva = "",
      numeroSesion = 1
    } = req.body || {};

    if (!clienteEmail) {
      return res.status(400).json({
        success: false,
        error: "El correo electrónico del cliente (clienteEmail) es obligatorio."
      });
    }

    if (!tokenReserva) {
      return res.status(400).json({
        success: false,
        error: "El token de reserva (tokenReserva) es obligatorio."
      });
    }

    const periodoStr = mes && anio ? `${MESES[mes - 1] || mes} ${anio}` : "Ciclo Activo";
    const montoFormateado = Number(montoCobrado).toLocaleString("es-MX");
    const displayCompany = empresa || clienteNombre;
    const bookingUrl = `https://www.theformulab.io/reservar/produccion?token=${tokenReserva}`;

    const resend = new Resend(apiKey);
    const fromEmail = process.env.LEAD_NOTIFICATION_FROM_EMAIL || "The Formulabs <onboarding@resend.dev>";
    const bccEmail = process.env.LEAD_NOTIFICATION_TO_EMAIL || "theformulab.io@gmail.com";
    const subject = "🎉 ¡Pago acreditado! Elige la fecha de tu rodaje — The Formulabs";

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pago Acreditado - Agenda Desbloqueada</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f17; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Lab -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1f2937; background: linear-gradient(135deg, rgba(24, 143, 240, 0.12) 0%, rgba(239, 24, 214, 0.08) 100%);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #188ff0; margin-bottom: 6px;">
                THE FORMULAB &bull; KICKOFF PROTOCOL
              </div>
              <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 700; color: #10b981; margin-bottom: 10px;">
                ✓ Paso 2 de 2 • Agenda Desbloqueada
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ¡Tu Abono ha sido Acreditado!
              </h1>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #f1f5f9;">
                Hola <strong style="color: #ffffff;">${clienteNombre}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                Hemos validado con éxito tu abono de activación para el ciclo operativo de <strong style="color: #ffffff;">${displayCompany}</strong>.
              </p>

              <!-- Tabla de Resumen de Pago -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Monto Acreditado</div>
                    <div style="font-size: 16px; color: #10b981; font-weight: 800; margin-top: 2px;">
                      $${montoFormateado} MXN
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Periodo Operativo</div>
                    <div style="font-size: 13px; color: #f8fafc; font-weight: 700; margin-top: 2px;">
                      ${periodoStr} &bull; Sesión #${numeroSesion}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Estado de la Cuenta</div>
                    <div style="font-size: 13px; color: #38bdf8; font-weight: 700; margin-top: 2px;">
                      Activa y Habilitada para Filmación
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #cbd5e1;">
                Tu slot de producción ya está garantizado. Puedes ingresar ahora mismo a nuestro portal clínico para seleccionar el día, horario y locación que mejor se adapte a tu equipo:
              </p>

              <!-- Botón CTA Principal -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${bookingUrl}" target="_blank" style="display: inline-block; background-color: #188ff0; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 6px 20px rgba(24, 143, 240, 0.45);">
                      📅 Elegir Fecha de Grabación &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                *Para asegurar la máxima disponibilidad de crew y equipo técnico, te sugerimos agendar con al menos 5 días de anticipación.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0c121e; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #475569;">
              The Formulab &copy; 2026 &bull; Operations &amp; Strategy Hub
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
      to: clienteEmail,
      bcc: bccEmail,
      subject,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API notify-payment-unlocked error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Notificación de pago acreditado enviada exitosamente.",
      emailId: data?.id
    });
  } catch (err) {
    console.error("api/notify-payment-unlocked unexpected error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
