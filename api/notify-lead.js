import { Resend } from "resend";

const QUESTION_TITLES = {
  objetivo: "Necesidad Principal",
  nicho: "Industria o Nicho",
  operacion: "Etapa Operativa",
  gestion: "Gestión Actual de Redes",
  inversion: "Inversión Mensual Actual"
};

/**
 * Serverless Function: api/notify-lead.js
 * Envía una notificación de diagnóstico formal con estética "Clinical Lab Report"
 * idéntica a ProposalLabPdfReport.jsx.
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
      id = null,
      nombre = "Prospecto",
      whatsapp = "",
      instagram = "",
      route = "C",
      route_name = "Mentoría Clínica",
      suggested_range = "$650 – $5,000 MXN",
      answers = {},
      ubicacion = null,
      cuando = null,
      utm_source = null
    } = req.body || {};

    const cleanPhone = (whatsapp || "").replace(/\D/g, "");
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
    const cleanIg = (instagram || "").replace(/^@/, "").trim();
    const igLink = cleanIg ? `https://instagram.com/${cleanIg}` : null;

    // Fechas y folio clínico
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const folioStr = id ? String(id).slice(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();

    // Logotipos oficiales SVG inline para los canales directos
    const whatsappSvg = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align: middle; margin-right: 6px; display: inline-block;">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;

    const instagramSvg = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align: middle; margin-right: 6px; display: inline-block;">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    `;

    // Generar filas de respuestas de diagnóstico
    const answerRows = Object.entries(answers || {})
      .map(([key, val]) => {
        const title = QUESTION_TITLES[key] || key;
        const label = val?.label || (typeof val === "string" ? val : "—");
        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 14px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: monospace; width: 40%; vertical-align: top;">
              ${title}
            </td>
            <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 60%;">
              ${label}
            </td>
          </tr>
        `;
      })
      .join("");

    // Plantilla HTML inspirada en ProposalLabPdfReport.jsx
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico Clínico - The Formulab</title>
  <style>
    @media only screen and (max-width: 540px) {
      .outer-pad {
        padding: 12px 6px !important;
      }
      .content-pad {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }
      .header-stack-cell {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .header-meta-col {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
        margin-top: 10px !important;
        padding-top: 10px !important;
        border-top: 1px dashed #cbd5e1 !important;
      }
      .header-meta-table {
        width: 100% !important;
        margin-left: 0 !important;
      }
      .header-meta-table td {
        font-size: 10px !important;
        padding: 2px 2px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="outer-pad" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0">
          
          <!-- Encabezado de Laboratorio (Logo Oficial con Imagen + Metadatos de Emisión) -->
          <tr>
            <td class="content-pad" style="padding: 22px 28px 18px 28px; border-bottom: 2px solid #e2e8f0; background-color: #ffffff;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header-stack-cell" style="vertical-align: middle;">
                    <a href="https://theformulab.io" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="https://www.theformulab.io/logo.png"
                        alt="the formulab"
                        height="38"
                        style="height: 38px; width: auto; max-width: 180px; display: block; border: 0;"
                      />
                    </a>
                    <div style="font-size: 10px; font-family: monospace; font-weight: 700; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                      Laboratorio Clínico de Estrategia
                    </div>
                  </td>
                  <td align="right" class="header-meta-col" style="vertical-align: top; font-family: monospace; font-size: 11px; color: #64748b;">
                    <table cellspacing="0" cellpadding="0" style="margin-left: auto;" class="header-meta-table">
                      <tr>
                        <td style="white-space: nowrap; padding: 1px 8px 1px 0; text-align: left; color: #64748b;">
                          Fecha: <strong style="color: #0f172a;">${dateStr}</strong>
                        </td>
                        <td style="white-space: nowrap; padding: 1px 0 1px 8px; text-align: left; color: #64748b;">
                          Hora: <strong style="color: #0f172a;">${timeStr}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="white-space: nowrap; padding: 1px 8px 1px 0; text-align: left; color: #64748b;">
                          Folio: <strong style="color: #0f172a;">#EXP-${folioStr}</strong>
                        </td>
                        <td style="white-space: nowrap; padding: 1px 0 1px 8px; text-align: left; color: #64748b;">
                          Vigencia: <strong style="color: #0f172a;">Inmediata</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Titular Principal con Fondo Oscuro de Laboratorio -->
          <tr>
            <td class="content-pad" style="padding: 16px 28px 0 28px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 6px;">
                <tr>
                  <td style="padding: 12px 18px; text-align: center;">
                    <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #ef18d6; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 2px;">
                      INFORME DE ADMISIÓN Y ASIGNACIÓN
                    </div>
                    <h1 style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                      Expediente Clínico de Resultados y Diagnóstico
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 1. Ficha de Prospecto / Metadatos (con Servicio Asignado Centrado) -->
          <tr>
            <td class="content-pad" style="padding: 16px 28px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding: 6px 12px 6px 0; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Prospecto / Cliente:</div>
                    <strong style="font-size: 14px; color: #0f172a; text-transform: uppercase; display: inline-block; margin-top: 2px;">${nombre}</strong>
                  </td>
                  <td align="center" style="width: 50%; vertical-align: middle; text-align: center; padding: 6px 0 6px 12px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 600; text-align: center; margin-bottom: 4px;">Servicio Asignado:</div>
                    <span style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #188ff0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; text-align: center;">
                      ${route_name}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top; padding: 8px 12px 6px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Teléfono / WhatsApp:</span><br/>
                    ${
                      cleanPhone
                        ? `<a href="${waLink}" target="_blank" style="color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 700; font-family: monospace; display: inline-block; margin-top: 2px;">+${cleanPhone}</a>`
                        : `<span style="font-size: 12px; color: #64748b;">Sin especificar</span>`
                    }
                  </td>
                  <td style="width: 50%; vertical-align: top; padding: 8px 0 6px 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Perfil de Instagram:</span><br/>
                    ${
                      cleanIg
                        ? `<a href="${igLink}" target="_blank" style="color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 700; font-family: monospace; display: inline-block; margin-top: 2px;">@${cleanIg}</a>`
                        : `<span style="font-size: 12px; color: #64748b;">Sin especificar</span>`
                    }
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top; padding: 8px 12px 4px 0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Ubicación:</span><br/>
                    <strong style="font-size: 12px; color: #0f172a; display: inline-block; margin-top: 2px;">${ubicacion || "Sin especificar"}</strong>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding: 8px 0 4px 12px;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Disponibilidad de Inicio:</span><br/>
                    <strong style="font-size: 12px; color: #0f172a; display: inline-block; margin-top: 2px;">${cuando || "Flexible"}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Tabla de Resultados Clínicos (Analitos / Respuestas Reportadas) -->
          ${
            answerRows
              ? `
          <tr>
            <td class="content-pad" style="padding: 0 28px 18px 28px;">
              <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                ANÁLISIS DE RESPUESTAS REPORTADAS
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 8px 14px; text-align: left; font-family: monospace; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; width: 40%;">
                      Analito / Pregunta
                    </th>
                    <th style="padding: 8px 14px; text-align: left; font-family: monospace; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; width: 60%;">
                      Resultado Reportado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${answerRows}
                </tbody>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- 3. Dictamen Financiero / Rango de Propuesta -->
          <tr>
            <td class="content-pad" style="padding: 0 28px 18px 28px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #188ff0; border-radius: 6px; padding: 12px 16px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-family: monospace; font-weight: 700; color: #64748b; text-transform: uppercase;">
                      DICTAMEN COMERCIAL SUGERIDO
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                      ${suggested_range}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      Servicio recomendado: <strong style="color: #0f172a;">${route_name}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. Canales Directos de Contacto (Botones Limpios al Final) -->
          <tr>
            <td class="content-pad" style="padding: 0 28px 20px 28px;">
              <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                ACCIONES DIRECTAS DE CONTACTO
              </div>
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  ${
                    waLink
                      ? `
                  <td style="padding-right: 8px; width: 50%;">
                    <a href="${waLink}" target="_blank" style="display: block; text-align: center; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 11px 16px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                      ${whatsappSvg} Abrir WhatsApp
                    </a>
                  </td>`
                      : ""
                  }
                  ${
                    igLink
                      ? `
                  <td style="padding-left: ${waLink ? "8px" : "0"}; width: ${waLink ? "50%" : "100%"};">
                    <a href="${igLink}" target="_blank" style="display: block; text-align: center; background-color: #E1306C; color: #ffffff; text-decoration: none; padding: 11px 16px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                      ${instagramSvg} Abrir Instagram
                    </a>
                  </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie Institucional de Laboratorio -->
          <tr>
            <td class="content-pad" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 10px; color: #64748b; text-align: center; font-family: monospace; line-height: 1.6;">
              THE FORMULAB S.A. DE C.V. · CERTIFICACIÓN DE DIAGNÓSTICO ESTRATÉGICO<br/>
              Cancún, Quintana Roo · México · theformulab.io
              ${utm_source ? `<br/><span style="color: #94a3b8;">Atribución: utm_source=${utm_source}</span>` : ""}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const fromEmail = process.env.LEAD_NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.LEAD_NOTIFICATION_TO_EMAIL || "theformulab.io@gmail.com";
    const subject = `Nuevo Expediente Clínico: ${nombre} · ${route_name}`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html
    });

    if (error) {
      console.error("Error al enviar email con Resend:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error al despachar el correo con Resend."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notificación de lead enviada con éxito.",
      emailId: data?.id
    });
  } catch (err) {
    console.error("Error inesperado en api/notify-lead:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Error interno del servidor al procesar la notificación."
    });
  }
}
