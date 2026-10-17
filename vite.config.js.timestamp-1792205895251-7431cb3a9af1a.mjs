// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/node_modules/@vitejs/plugin-react-swc/index.js";
import path2 from "path";

// plugins/viteR2DevServer.js
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "file:///C:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";
import { getSignedUrl } from "file:///C:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/node_modules/@aws-sdk/s3-request-presigner/dist-cjs/index.js";

// api/notify-lead.js
import { Resend } from "file:///C:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/node_modules/resend/dist/index.mjs";
var QUESTION_TITLES = {
  objetivo: "Necesidad Principal",
  nicho: "Industria o Nicho",
  operacion: "Etapa Operativa",
  gestion: "Gesti\xF3n Actual de Redes",
  inversion: "Inversi\xF3n Mensual Actual"
};
async function handler(req, res) {
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
      error: "M\xE9todo no permitido. Solo se acepta POST."
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
      route_name = "Mentor\xEDa Cl\xEDnica",
      suggested_range = "$650 \u2013 $5,000 MXN",
      answers = {},
      ubicacion = null,
      cuando = null,
      utm_source = null
    } = req.body || {};
    const cleanPhone = (whatsapp || "").replace(/\D/g, "");
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
    const cleanIg = (instagram || "").replace(/^@/, "").trim();
    const igLink = cleanIg ? `https://instagram.com/${cleanIg}` : null;
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const folioStr = id ? String(id).slice(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
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
    const answerRows = Object.entries(answers || {}).map(([key, val]) => {
      const title = QUESTION_TITLES[key] || key;
      const label = val?.label || (typeof val === "string" ? val : "\u2014");
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
    }).join("");
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagn\xF3stico Cl\xEDnico - The Formulab</title>
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
          
          <!-- Encabezado de Laboratorio (Logo Oficial con Imagen + Metadatos de Emisi\xF3n) -->
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
                      Laboratorio Cl\xEDnico de Estrategia
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
                      INFORME DE ADMISI\xD3N Y ASIGNACI\xD3N
                    </div>
                    <h1 style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                      Expediente Cl\xEDnico de Resultados y Diagn\xF3stico
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
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Tel\xE9fono / WhatsApp:</span><br/>
                    ${cleanPhone ? `<a href="${waLink}" target="_blank" style="color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 700; font-family: monospace; display: inline-block; margin-top: 2px;">+${cleanPhone}</a>` : `<span style="font-size: 12px; color: #64748b;">Sin especificar</span>`}
                  </td>
                  <td style="width: 50%; vertical-align: top; padding: 8px 0 6px 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Perfil de Instagram:</span><br/>
                    ${cleanIg ? `<a href="${igLink}" target="_blank" style="color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 700; font-family: monospace; display: inline-block; margin-top: 2px;">@${cleanIg}</a>` : `<span style="font-size: 12px; color: #64748b;">Sin especificar</span>`}
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top; padding: 8px 12px 4px 0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Ubicaci\xF3n:</span><br/>
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

          <!-- 2. Tabla de Resultados Cl\xEDnicos (Analitos / Respuestas Reportadas) -->
          ${answerRows ? `
          <tr>
            <td class="content-pad" style="padding: 0 28px 18px 28px;">
              <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                AN\xC1LISIS DE RESPUESTAS REPORTADAS
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
          </tr>` : ""}

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
                  ${waLink ? `
                  <td style="padding-right: 8px; width: 50%;">
                    <a href="${waLink}" target="_blank" style="display: block; text-align: center; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 11px 16px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                      ${whatsappSvg} Abrir WhatsApp
                    </a>
                  </td>` : ""}
                  ${igLink ? `
                  <td style="padding-left: ${waLink ? "8px" : "0"}; width: ${waLink ? "50%" : "100%"};">
                    <a href="${igLink}" target="_blank" style="display: block; text-align: center; background-color: #E1306C; color: #ffffff; text-decoration: none; padding: 11px 16px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                      ${instagramSvg} Abrir Instagram
                    </a>
                  </td>` : ""}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie Institucional de Laboratorio -->
          <tr>
            <td class="content-pad" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 10px; color: #64748b; text-align: center; font-family: monospace; line-height: 1.6;">
              THE FORMULAB S.A. DE C.V. \xB7 CERTIFICACI\xD3N DE DIAGN\xD3STICO ESTRAT\xC9GICO<br/>
              Canc\xFAn, Quintana Roo \xB7 M\xE9xico \xB7 theformulab.io
              ${utm_source ? `<br/><span style="color: #94a3b8;">Atribuci\xF3n: utm_source=${utm_source}</span>` : ""}
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
    const subject = `Nuevo Expediente Cl\xEDnico: ${nombre} \xB7 ${route_name}`;
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
      message: "Notificaci\xF3n de lead enviada con \xE9xito.",
      emailId: data?.id
    });
  } catch (err) {
    console.error("Error inesperado en api/notify-lead:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Error interno del servidor al procesar la notificaci\xF3n."
    });
  }
}

// plugins/viteR2DevServer.js
function reloadLocalEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          if (key && val && val !== "tu_resend_api_key_aqui") {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (e) {
    console.warn("No se pudo recargar .env:", e);
  }
}
function viteR2DevServer() {
  return {
    name: "vite-plugin-r2-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/notify-lead")) {
          reloadLocalEnv();
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");
          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
          }
          res.status = function(code) {
            this.statusCode = code;
            return this;
          };
          res.json = function(data) {
            this.setHeader("Content-Type", "application/json");
            this.end(JSON.stringify(data));
            return this;
          };
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const bodyBuffer = Buffer.concat(chunks);
          try {
            req.body = bodyBuffer.length > 0 ? JSON.parse(bodyBuffer.toString("utf-8")) : {};
          } catch {
            req.body = {};
          }
          try {
            await handler(req, res);
          } catch (err) {
            console.error("Error en local dev /api/notify-lead:", err);
            res.status(500).json({ success: false, error: err.message });
          }
          return;
        }
        const isUploadR2 = req.url.startsWith("/api/upload-r2");
        const isPresignedR2 = req.url.startsWith("/api/r2-presigned-url");
        if (!isUploadR2 && !isPresignedR2) {
          return next();
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "*");
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }
        try {
          const accountId = process.env.R2_ACCOUNT_ID;
          const bucketName = process.env.R2_BUCKET_NAME;
          const accessKeyId = process.env.R2_ACCESS_KEY_ID;
          const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
          const publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/$/, "");
          const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
          if (!accessKeyId || !secretAccessKey || !bucketName) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Faltan variables de entorno R2 en el servidor local (.env)" }));
            return;
          }
          const s3Client = new S3Client({
            region: "auto",
            endpoint,
            credentials: {
              accessKeyId,
              secretAccessKey
            }
          });
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBuffer = Buffer.concat(chunks);
          if (isPresignedR2) {
            let body = {};
            if (rawBuffer.length > 0) {
              try {
                body = JSON.parse(rawBuffer.toString("utf-8"));
              } catch (_) {
              }
            }
            const action = body.action || urlObj.searchParams.get("action") || (req.method === "DELETE" ? "delete" : "put");
            const rawTargetKey = body.key || urlObj.searchParams.get("key");
            const targetKey = rawTargetKey && typeof rawTargetKey === "string" && !rawTargetKey.includes("..") && !rawTargetKey.startsWith("/") && !rawTargetKey.includes("\\") ? rawTargetKey.trim() : null;
            if (action === "delete" || req.method === "DELETE") {
              if (!targetKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave (key) del objeto es requerida y debe ser v\xE1lida." }));
                return;
              }
              console.log(`[Vite R2 Dev] Eliminando objeto de Cloudflare R2: ${targetKey}`);
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: targetKey
                })
              );
              console.log(`[Vite R2 Dev] Objeto eliminado exitosamente de R2: ${targetKey}`);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, message: `Objeto ${targetKey} eliminado de Cloudflare R2.` }));
              return;
            }
            if (action === "download" || action === "get") {
              const downloadKey = targetKey || (body.url && body.url.includes("calendarios/") ? body.url.substring(body.url.indexOf("calendarios/")).split("?")[0] : null);
              if (!downloadKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave (key) o URL del objeto es requerida para descargar." }));
                return;
              }
              const downloadName = body.fileName || urlObj.searchParams.get("fileName") || "archivo";
              const cleanDownloadName = decodeURIComponent(downloadName).replace(/[\r\n"]/g, "").replace(/\s+/g, "_");
              const getCmd = new GetObjectCommand({
                Bucket: bucketName,
                Key: downloadKey,
                ResponseContentDisposition: `attachment; filename="${cleanDownloadName}"`
              });
              const downloadUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                success: true,
                downloadUrl,
                key: downloadKey,
                fileName: cleanDownloadName,
                expiresIn: 3600
              }));
              return;
            }
            const fileName = body.fileName || urlObj.searchParams.get("fileName");
            const fileType = body.fileType || urlObj.searchParams.get("fileType") || "application/octet-stream";
            const calendarioId = body.calendarioId || urlObj.searchParams.get("calendarioId") || "general";
            if (!fileName) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "fileName es requerido para generar la URL prefirmada." }));
              return;
            }
            const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
            const storageKey = `calendarios/${calendarioId}/${Date.now()}-${cleanFileName}`;
            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: storageKey,
              ContentType: fileType
            });
            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            const publicUrl = `${publicDomain}/${storageKey}`;
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ uploadUrl, publicUrl, key: storageKey, expiresIn: 3600 }));
            return;
          }
          if (isUploadR2) {
            if (req.method === "DELETE" || req.headers["x-action"] === "delete") {
              const targetKey = req.headers["x-storage-key"] || urlObj.searchParams.get("key") || urlObj.searchParams.get("storageKey");
              if (!targetKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave del objeto es requerida para eliminar." }));
                return;
              }
              console.log(`[Vite R2 Dev] Eliminando objeto de Cloudflare R2 v\xEDa upload-r2: ${targetKey}`);
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: targetKey
                })
              );
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, message: `Objeto ${targetKey} eliminado.` }));
              return;
            }
            const fileName = req.headers["x-file-name"] || urlObj.searchParams.get("fileName") || "archivo";
            const fileType = req.headers["x-file-type"] || urlObj.searchParams.get("fileType") || "application/octet-stream";
            const calendarioId = req.headers["x-calendario-id"] || urlObj.searchParams.get("calendarioId") || "general";
            const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
            const storageKey = req.headers["x-storage-key"] || urlObj.searchParams.get("storageKey") || `calendarios/${calendarioId}/${Date.now()}-${cleanFileName}`;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: storageKey,
                Body: rawBuffer,
                ContentType: fileType
              })
            );
            const publicUrl = `${publicDomain}/${storageKey}`;
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, publicUrl, key: storageKey }));
            return;
          }
        } catch (err) {
          console.error("Error en Plugin Vite R2 Dev Middleware:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
        next();
      });
    }
  };
}

// vite.config.js
var __vite_injected_original_dirname = "C:\\Users\\ASUS\\OneDrive\\Escritorio\\Proyectos\\theFormulabsSite";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);
  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ""
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
      )
    },
    envPrefix: ["VITE_"],
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false
      }
    },
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
    },
    plugins: [react(), viteR2DevServer()],
    resolve: {
      alias: {
        "@": path2.resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy92aXRlUjJEZXZTZXJ2ZXIuanMiLCAiYXBpL25vdGlmeS1sZWFkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQVNVU1xcXFxPbmVEcml2ZVxcXFxFc2NyaXRvcmlvXFxcXFByb3llY3Rvc1xcXFx0aGVGb3JtdWxhYnNTaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBU1VTXFxcXE9uZURyaXZlXFxcXEVzY3JpdG9yaW9cXFxcUHJveWVjdG9zXFxcXHRoZUZvcm11bGFic1NpdGVcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FTVVMvT25lRHJpdmUvRXNjcml0b3Jpby9Qcm95ZWN0b3MvdGhlRm9ybXVsYWJzU2l0ZS92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHZpdGVSMkRldlNlcnZlciB9IGZyb20gXCIuL3BsdWdpbnMvdml0ZVIyRGV2U2VydmVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gQ2FyZ2FyIHZhcmlhYmxlcyBkZSAuZW52IGVuIHByb2Nlc3MuZW52IHBhcmEgTm9kZS5qcyBsb2NhbCBzaW4gZXhwb25lcmxhcyBhbCBidW5kbGUgd2ViIGNsaWVudGVcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgT2JqZWN0LmFzc2lnbihwcm9jZXNzLmVudiwgZW52KTtcblxuICByZXR1cm4ge1xuICAgIGRlZmluZToge1xuICAgICAgXCJpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9VUkxcIjogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTCB8fCBcIlwiXG4gICAgICApLFxuICAgICAgXCJpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWVwiOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSB8fCBwcm9jZXNzLmVudi5TVVBBQkFTRV9BTk9OX0tFWSB8fCBcIlwiXG4gICAgICApXG4gICAgfSxcbiAgICBlbnZQcmVmaXg6IFtcIlZJVEVfXCJdLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBleGNsdWRlOiBbXCJAZmZtcGVnL2ZmbXBlZ1wiLCBcIkBmZm1wZWcvdXRpbFwiXSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB2aXRlUjJEZXZTZXJ2ZXIoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIilcbiAgICAgIH0sXG4gICAgICBkZWR1cGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3QvanN4LXJ1bnRpbWVcIiwgXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIl1cbiAgICB9XG4gIH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQVNVU1xcXFxPbmVEcml2ZVxcXFxFc2NyaXRvcmlvXFxcXFByb3llY3Rvc1xcXFx0aGVGb3JtdWxhYnNTaXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFTVVNcXFxcT25lRHJpdmVcXFxcRXNjcml0b3Jpb1xcXFxQcm95ZWN0b3NcXFxcdGhlRm9ybXVsYWJzU2l0ZVxcXFxwbHVnaW5zXFxcXHZpdGVSMkRldlNlcnZlci5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQVNVUy9PbmVEcml2ZS9Fc2NyaXRvcmlvL1Byb3llY3Rvcy90aGVGb3JtdWxhYnNTaXRlL3BsdWdpbnMvdml0ZVIyRGV2U2VydmVyLmpzXCI7aW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IFMzQ2xpZW50LCBQdXRPYmplY3RDb21tYW5kLCBEZWxldGVPYmplY3RDb21tYW5kLCBHZXRPYmplY3RDb21tYW5kIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xuaW1wb3J0IHsgZ2V0U2lnbmVkVXJsIH0gZnJvbSBcIkBhd3Mtc2RrL3MzLXJlcXVlc3QtcHJlc2lnbmVyXCI7XG5pbXBvcnQgbm90aWZ5TGVhZEhhbmRsZXIgZnJvbSBcIi4uL2FwaS9ub3RpZnktbGVhZC5qc1wiO1xuXG5mdW5jdGlvbiByZWxvYWRMb2NhbEVudigpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbnZQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwiLmVudlwiKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhlbnZQYXRoKSkge1xuICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhlbnZQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGNvbnRlbnQuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICBpZiAodHJpbW1lZCAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKFwiI1wiKSAmJiB0cmltbWVkLmluY2x1ZGVzKFwiPVwiKSkge1xuICAgICAgICAgIGNvbnN0IGlkeCA9IHRyaW1tZWQuaW5kZXhPZihcIj1cIik7XG4gICAgICAgICAgY29uc3Qga2V5ID0gdHJpbW1lZC5zbGljZSgwLCBpZHgpLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCB2YWwgPSB0cmltbWVkLnNsaWNlKGlkeCArIDEpLnRyaW0oKS5yZXBsYWNlKC9eW1wiJ118W1wiJ10kL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChrZXkgJiYgdmFsICYmIHZhbCAhPT0gXCJ0dV9yZXNlbmRfYXBpX2tleV9hcXVpXCIpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52W2tleV0gPSB2YWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS53YXJuKFwiTm8gc2UgcHVkbyByZWNhcmdhciAuZW52OlwiLCBlKTtcbiAgfVxufVxuXG4vKipcbiAqIFBsdWdpbiBkZSBkZXNhcnJvbGxvIHBhcmEgVml0ZSBxdWUgaW50ZXJjZXB0YSBsYXMgbGxhbWFkYXMgYTpcbiAqIC0gL2FwaS91cGxvYWQtcjIgKHN1YmlkYSBkZSBhcmNoaXZvcyBiaW5hcmlvcyBvIGVsaW1pbmFjaVx1MDBGM24pXG4gKiAtIC9hcGkvcjItcHJlc2lnbmVkLXVybCAoZ2VuZXJhY2lcdTAwRjNuIGRlIFVSTHMgcHJlZmlybWFkYXMgbyBlbGltaW5hY2lcdTAwRjNuIGRlIG9iamV0b3MpXG4gKiAtIC9hcGkvbm90aWZ5LWxlYWQgKG5vdGlmaWNhY2lcdTAwRjNuIHBvciBjb3JyZW8gY29uIFJlc2VuZClcbiAqIGR1cmFudGUgYG5wbSBydW4gZGV2YCB5IG9wZXJhIGRpcmVjdGFtZW50ZSBlbiBOb2RlLmpzIHNpbiBleHBvbmVyIGNyZWRlbmNpYWxlcyBhbCBjbGllbnRlIHdlYi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpdGVSMkRldlNlcnZlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLXIyLWRldi1zZXJ2ZXJcIixcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAvLyBJbnRlcmNlcHRhciBub3RpZmljYWNpXHUwMEYzbiBkZSBsZWFkcyBjb24gUmVzZW5kIGVuIGRlc2Fycm9sbG8gbG9jYWxcbiAgICAgICAgaWYgKHJlcS51cmwgJiYgcmVxLnVybC5zdGFydHNXaXRoKFwiL2FwaS9ub3RpZnktbGVhZFwiKSkge1xuICAgICAgICAgIHJlbG9hZExvY2FsRW52KCk7XG5cbiAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiLCBcIlBPU1QsIE9QVElPTlNcIik7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIiwgXCIqXCIpO1xuXG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiT1BUSU9OU1wiKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMuc3RhdHVzID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzQ29kZSA9IGNvZGU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJlcy5qc29uID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgICAgIHRoaXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlcSkge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBib2R5QnVmZmVyID0gQnVmZmVyLmNvbmNhdChjaHVua3MpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXEuYm9keSA9IGJvZHlCdWZmZXIubGVuZ3RoID4gMCA/IEpTT04ucGFyc2UoYm9keUJ1ZmZlci50b1N0cmluZyhcInV0Zi04XCIpKSA6IHt9O1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmVxLmJvZHkgPSB7fTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbm90aWZ5TGVhZEhhbmRsZXIocmVxLCByZXMpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGVuIGxvY2FsIGRldiAvYXBpL25vdGlmeS1sZWFkOlwiLCBlcnIpO1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1VwbG9hZFIyID0gcmVxLnVybC5zdGFydHNXaXRoKFwiL2FwaS91cGxvYWQtcjJcIik7XG4gICAgICAgIGNvbnN0IGlzUHJlc2lnbmVkUjIgPSByZXEudXJsLnN0YXJ0c1dpdGgoXCIvYXBpL3IyLXByZXNpZ25lZC11cmxcIik7XG5cbiAgICAgICAgaWYgKCFpc1VwbG9hZFIyICYmICFpc1ByZXNpZ25lZFIyKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiLCBcIkdFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlNcIik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCIsIFwiKlwiKTtcblxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJPUFRJT05TXCIpIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBhY2NvdW50SWQgPSBwcm9jZXNzLmVudi5SMl9BQ0NPVU5UX0lEO1xuICAgICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBwcm9jZXNzLmVudi5SMl9CVUNLRVRfTkFNRTtcbiAgICAgICAgICBjb25zdCBhY2Nlc3NLZXlJZCA9IHByb2Nlc3MuZW52LlIyX0FDQ0VTU19LRVlfSUQ7XG4gICAgICAgICAgY29uc3Qgc2VjcmV0QWNjZXNzS2V5ID0gcHJvY2Vzcy5lbnYuUjJfU0VDUkVUX0FDQ0VTU19LRVk7XG4gICAgICAgICAgY29uc3QgcHVibGljRG9tYWluID0gKHByb2Nlc3MuZW52LlIyX1BVQkxJQ19ET01BSU4gfHwgXCJcIikucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xuICAgICAgICAgIGNvbnN0IGVuZHBvaW50ID0gcHJvY2Vzcy5lbnYuUjJfRU5EUE9JTlQgfHwgYGh0dHBzOi8vJHthY2NvdW50SWR9LnIyLmNsb3VkZmxhcmVzdG9yYWdlLmNvbWA7XG5cbiAgICAgICAgICBpZiAoIWFjY2Vzc0tleUlkIHx8ICFzZWNyZXRBY2Nlc3NLZXkgfHwgIWJ1Y2tldE5hbWUpIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiRmFsdGFuIHZhcmlhYmxlcyBkZSBlbnRvcm5vIFIyIGVuIGVsIHNlcnZpZG9yIGxvY2FsICguZW52KVwiIH0pKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7XG4gICAgICAgICAgICByZWdpb246IFwiYXV0b1wiLFxuICAgICAgICAgICAgZW5kcG9pbnQsXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICBhY2Nlc3NLZXlJZCxcbiAgICAgICAgICAgICAgc2VjcmV0QWNjZXNzS2V5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwocmVxLnVybCwgYGh0dHA6Ly8ke3JlcS5oZWFkZXJzLmhvc3R9YCk7XG5cbiAgICAgICAgICAvLyBMZWVyIGN1ZXJwbyBkZSBsYSBzb2xpY2l0dWRcbiAgICAgICAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlcSkge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByYXdCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGNodW5rcyk7XG5cbiAgICAgICAgICAvLyAxLiBNQU5FSk8gREUgL2FwaS9yMi1wcmVzaWduZWQtdXJsXG4gICAgICAgICAgaWYgKGlzUHJlc2lnbmVkUjIpIHtcbiAgICAgICAgICAgIGxldCBib2R5ID0ge307XG4gICAgICAgICAgICBpZiAocmF3QnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShyYXdCdWZmZXIudG9TdHJpbmcoXCJ1dGYtOFwiKSk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGJvZHkuYWN0aW9uIHx8IHVybE9iai5zZWFyY2hQYXJhbXMuZ2V0KFwiYWN0aW9uXCIpIHx8IChyZXEubWV0aG9kID09PSBcIkRFTEVURVwiID8gXCJkZWxldGVcIiA6IFwicHV0XCIpO1xuICAgICAgICAgICAgY29uc3QgcmF3VGFyZ2V0S2V5ID0gYm9keS5rZXkgfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoXCJrZXlcIik7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRLZXkgPSAocmF3VGFyZ2V0S2V5ICYmIHR5cGVvZiByYXdUYXJnZXRLZXkgPT09IFwic3RyaW5nXCIgJiYgIXJhd1RhcmdldEtleS5pbmNsdWRlcyhcIi4uXCIpICYmICFyYXdUYXJnZXRLZXkuc3RhcnRzV2l0aChcIi9cIikgJiYgIXJhd1RhcmdldEtleS5pbmNsdWRlcyhcIlxcXFxcIikpXG4gICAgICAgICAgICAgID8gcmF3VGFyZ2V0S2V5LnRyaW0oKVxuICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICAgIC8vIEFjY2lcdTAwRjNuOiBFTElNSU5BUiBvYmpldG8gZGUgUjJcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwiZGVsZXRlXCIgfHwgcmVxLm1ldGhvZCA9PT0gXCJERUxFVEVcIikge1xuICAgICAgICAgICAgICBpZiAoIXRhcmdldEtleSkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJMYSBjbGF2ZSAoa2V5KSBkZWwgb2JqZXRvIGVzIHJlcXVlcmlkYSB5IGRlYmUgc2VyIHZcdTAwRTFsaWRhLlwiIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1ZpdGUgUjIgRGV2XSBFbGltaW5hbmRvIG9iamV0byBkZSBDbG91ZGZsYXJlIFIyOiAke3RhcmdldEtleX1gKTtcbiAgICAgICAgICAgICAgYXdhaXQgczNDbGllbnQuc2VuZChcbiAgICAgICAgICAgICAgICBuZXcgRGVsZXRlT2JqZWN0Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgICBLZXk6IHRhcmdldEtleSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1ZpdGUgUjIgRGV2XSBPYmpldG8gZWxpbWluYWRvIGV4aXRvc2FtZW50ZSBkZSBSMjogJHt0YXJnZXRLZXl9YCk7XG5cbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogYE9iamV0byAke3RhcmdldEtleX0gZWxpbWluYWRvIGRlIENsb3VkZmxhcmUgUjIuYCB9KSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWNjaVx1MDBGM246IEdFTkVSQVIgVVJMIERFIERFU0NBUkdBIEZPUlpBREEgKENvbnRlbnQtRGlzcG9zaXRpb246IGF0dGFjaG1lbnQpXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBcImRvd25sb2FkXCIgfHwgYWN0aW9uID09PSBcImdldFwiKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkS2V5ID0gdGFyZ2V0S2V5IHx8IChib2R5LnVybCAmJiBib2R5LnVybC5pbmNsdWRlcyhcImNhbGVuZGFyaW9zL1wiKSA/IGJvZHkudXJsLnN1YnN0cmluZyhib2R5LnVybC5pbmRleE9mKFwiY2FsZW5kYXJpb3MvXCIpKS5zcGxpdChcIj9cIilbMF0gOiBudWxsKTtcbiAgICAgICAgICAgICAgaWYgKCFkb3dubG9hZEtleSkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJMYSBjbGF2ZSAoa2V5KSBvIFVSTCBkZWwgb2JqZXRvIGVzIHJlcXVlcmlkYSBwYXJhIGRlc2Nhcmdhci5cIiB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgZG93bmxvYWROYW1lID0gYm9keS5maWxlTmFtZSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcImZpbGVOYW1lXCIpIHx8IFwiYXJjaGl2b1wiO1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbkRvd25sb2FkTmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudChkb3dubG9hZE5hbWUpLnJlcGxhY2UoL1tcXHJcXG5cIl0vZywgXCJcIikucmVwbGFjZSgvXFxzKy9nLCBcIl9cIik7XG5cbiAgICAgICAgICAgICAgY29uc3QgZ2V0Q21kID0gbmV3IEdldE9iamVjdENvbW1hbmQoe1xuICAgICAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgICAgICAgICAgICBLZXk6IGRvd25sb2FkS2V5LFxuICAgICAgICAgICAgICAgIFJlc3BvbnNlQ29udGVudERpc3Bvc2l0aW9uOiBgYXR0YWNobWVudDsgZmlsZW5hbWU9XCIke2NsZWFuRG93bmxvYWROYW1lfVwiYCxcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgY29uc3QgZG93bmxvYWRVcmwgPSBhd2FpdCBnZXRTaWduZWRVcmwoczNDbGllbnQsIGdldENtZCwgeyBleHBpcmVzSW46IDM2MDAgfSk7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkb3dubG9hZFVybCxcbiAgICAgICAgICAgICAgICBrZXk6IGRvd25sb2FkS2V5LFxuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBjbGVhbkRvd25sb2FkTmFtZSxcbiAgICAgICAgICAgICAgICBleHBpcmVzSW46IDM2MDBcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFjY2lcdTAwRjNuOiBHRU5FUkFSIFVSTCBQUkVGSVJNQURBIChTVUJJREEpXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGJvZHkuZmlsZU5hbWUgfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoXCJmaWxlTmFtZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUeXBlID0gYm9keS5maWxlVHlwZSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcImZpbGVUeXBlXCIpIHx8IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCI7XG4gICAgICAgICAgICBjb25zdCBjYWxlbmRhcmlvSWQgPSBib2R5LmNhbGVuZGFyaW9JZCB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcImNhbGVuZGFyaW9JZFwiKSB8fCBcImdlbmVyYWxcIjtcblxuICAgICAgICAgICAgaWYgKCFmaWxlTmFtZSkge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJmaWxlTmFtZSBlcyByZXF1ZXJpZG8gcGFyYSBnZW5lcmFyIGxhIFVSTCBwcmVmaXJtYWRhLlwiIH0pKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjbGVhbkZpbGVOYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVOYW1lKS5yZXBsYWNlKC9cXHMrL2csIFwiX1wiKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8uLV0vZywgXCJcIik7XG4gICAgICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gYGNhbGVuZGFyaW9zLyR7Y2FsZW5kYXJpb0lkfS8ke0RhdGUubm93KCl9LSR7Y2xlYW5GaWxlTmFtZX1gO1xuXG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0gbmV3IFB1dE9iamVjdENvbW1hbmQoe1xuICAgICAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgIEtleTogc3RvcmFnZUtleSxcbiAgICAgICAgICAgICAgQ29udGVudFR5cGU6IGZpbGVUeXBlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVwbG9hZFVybCA9IGF3YWl0IGdldFNpZ25lZFVybChzM0NsaWVudCwgY29tbWFuZCwgeyBleHBpcmVzSW46IDM2MDAgfSk7XG4gICAgICAgICAgICBjb25zdCBwdWJsaWNVcmwgPSBgJHtwdWJsaWNEb21haW59LyR7c3RvcmFnZUtleX1gO1xuXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHVwbG9hZFVybCwgcHVibGljVXJsLCBrZXk6IHN0b3JhZ2VLZXksIGV4cGlyZXNJbjogMzYwMCB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gMi4gTUFORUpPIERFIC9hcGkvdXBsb2FkLXIyXG4gICAgICAgICAgaWYgKGlzVXBsb2FkUjIpIHtcbiAgICAgICAgICAgIC8vIE1hbmVqYXIgREVMRVRFIGVuIC9hcGkvdXBsb2FkLXIyIHNpIHNlIGludm9jYVxuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiREVMRVRFXCIgfHwgcmVxLmhlYWRlcnNbXCJ4LWFjdGlvblwiXSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRLZXkgPSByZXEuaGVhZGVyc1tcIngtc3RvcmFnZS1rZXlcIl0gfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoXCJrZXlcIikgfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoXCJzdG9yYWdlS2V5XCIpO1xuICAgICAgICAgICAgICBpZiAoIXRhcmdldEtleSkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJMYSBjbGF2ZSBkZWwgb2JqZXRvIGVzIHJlcXVlcmlkYSBwYXJhIGVsaW1pbmFyLlwiIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1ZpdGUgUjIgRGV2XSBFbGltaW5hbmRvIG9iamV0byBkZSBDbG91ZGZsYXJlIFIyIHZcdTAwRURhIHVwbG9hZC1yMjogJHt0YXJnZXRLZXl9YCk7XG4gICAgICAgICAgICAgIGF3YWl0IHMzQ2xpZW50LnNlbmQoXG4gICAgICAgICAgICAgICAgbmV3IERlbGV0ZU9iamVjdENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgICAgS2V5OiB0YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBgT2JqZXRvICR7dGFyZ2V0S2V5fSBlbGltaW5hZG8uYCB9KSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3ViaWRhIGJpbmFyaWEgKFBPU1QgLyBQVVQpXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHJlcS5oZWFkZXJzW1wieC1maWxlLW5hbWVcIl0gfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoXCJmaWxlTmFtZVwiKSB8fCBcImFyY2hpdm9cIjtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUeXBlID0gcmVxLmhlYWRlcnNbXCJ4LWZpbGUtdHlwZVwiXSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcImZpbGVUeXBlXCIpIHx8IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCI7XG4gICAgICAgICAgICBjb25zdCBjYWxlbmRhcmlvSWQgPSByZXEuaGVhZGVyc1tcIngtY2FsZW5kYXJpby1pZFwiXSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcImNhbGVuZGFyaW9JZFwiKSB8fCBcImdlbmVyYWxcIjtcblxuICAgICAgICAgICAgY29uc3QgY2xlYW5GaWxlTmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudChmaWxlTmFtZSkucmVwbGFjZSgvXFxzKy9nLCBcIl9cIikucmVwbGFjZSgvW15hLXpBLVowLTlfLi1dL2csIFwiXCIpO1xuICAgICAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9IHJlcS5oZWFkZXJzW1wieC1zdG9yYWdlLWtleVwiXSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldChcInN0b3JhZ2VLZXlcIikgfHwgYGNhbGVuZGFyaW9zLyR7Y2FsZW5kYXJpb0lkfS8ke0RhdGUubm93KCl9LSR7Y2xlYW5GaWxlTmFtZX1gO1xuXG4gICAgICAgICAgICBhd2FpdCBzM0NsaWVudC5zZW5kKFxuICAgICAgICAgICAgICBuZXcgUHV0T2JqZWN0Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgIEtleTogc3RvcmFnZUtleSxcbiAgICAgICAgICAgICAgICBCb2R5OiByYXdCdWZmZXIsXG4gICAgICAgICAgICAgICAgQ29udGVudFR5cGU6IGZpbGVUeXBlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgcHVibGljVXJsID0gYCR7cHVibGljRG9tYWlufS8ke3N0b3JhZ2VLZXl9YDtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSwgcHVibGljVXJsLCBrZXk6IHN0b3JhZ2VLZXkgfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGVuIFBsdWdpbiBWaXRlIFIyIERldiBNaWRkbGV3YXJlOlwiLCBlcnIpO1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFTVVNcXFxcT25lRHJpdmVcXFxcRXNjcml0b3Jpb1xcXFxQcm95ZWN0b3NcXFxcdGhlRm9ybXVsYWJzU2l0ZVxcXFxhcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFTVVNcXFxcT25lRHJpdmVcXFxcRXNjcml0b3Jpb1xcXFxQcm95ZWN0b3NcXFxcdGhlRm9ybXVsYWJzU2l0ZVxcXFxhcGlcXFxcbm90aWZ5LWxlYWQuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FTVVMvT25lRHJpdmUvRXNjcml0b3Jpby9Qcm95ZWN0b3MvdGhlRm9ybXVsYWJzU2l0ZS9hcGkvbm90aWZ5LWxlYWQuanNcIjtpbXBvcnQgeyBSZXNlbmQgfSBmcm9tIFwicmVzZW5kXCI7XG5cbmNvbnN0IFFVRVNUSU9OX1RJVExFUyA9IHtcbiAgb2JqZXRpdm86IFwiTmVjZXNpZGFkIFByaW5jaXBhbFwiLFxuICBuaWNobzogXCJJbmR1c3RyaWEgbyBOaWNob1wiLFxuICBvcGVyYWNpb246IFwiRXRhcGEgT3BlcmF0aXZhXCIsXG4gIGdlc3Rpb246IFwiR2VzdGlcdTAwRjNuIEFjdHVhbCBkZSBSZWRlc1wiLFxuICBpbnZlcnNpb246IFwiSW52ZXJzaVx1MDBGM24gTWVuc3VhbCBBY3R1YWxcIlxufTtcblxuLyoqXG4gKiBTZXJ2ZXJsZXNzIEZ1bmN0aW9uOiBhcGkvbm90aWZ5LWxlYWQuanNcbiAqIEVudlx1MDBFRGEgdW5hIG5vdGlmaWNhY2lcdTAwRjNuIGRlIGRpYWduXHUwMEYzc3RpY28gZm9ybWFsIGNvbiBlc3RcdTAwRTl0aWNhIFwiQ2xpbmljYWwgTGFiIFJlcG9ydFwiXG4gKiBpZFx1MDBFOW50aWNhIGEgUHJvcG9zYWxMYWJQZGZSZXBvcnQuanN4LlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiLCB0cnVlKTtcbiAgcmVzLnNldEhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XG4gIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCIsIFwiUE9TVCxPUFRJT05TXCIpO1xuICByZXMuc2V0SGVhZGVyKFxuICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiLFxuICAgIFwiWC1DU1JGLVRva2VuLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIEFjY2VwdC1WZXJzaW9uLCBDb250ZW50LUxlbmd0aCwgQ29udGVudC1NRDUsIENvbnRlbnQtVHlwZSwgRGF0ZSwgWC1BcGktVmVyc2lvblwiXG4gICk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09IFwiT1BUSU9OU1wiKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5lbmQoKTtcbiAgfVxuXG4gIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwNSkuanNvbih7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIk1cdTAwRTl0b2RvIG5vIHBlcm1pdGlkby4gU29sbyBzZSBhY2VwdGEgUE9TVC5cIlxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgYXBpS2V5ID0gcHJvY2Vzcy5lbnYuUkVTRU5EX0FQSV9LRVk7XG4gIGlmICghYXBpS2V5IHx8IGFwaUtleSA9PT0gXCJ0dV9yZXNlbmRfYXBpX2tleV9hcXVpXCIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRmFsdGEgUkVTRU5EX0FQSV9LRVkgZW4gdmFyaWFibGVzIGRlIGVudG9ybm8uXCIpO1xuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIk5vIHNlIGhhIGNvbmZpZ3VyYWRvIGxhIHZhcmlhYmxlIGRlIGVudG9ybm8gUkVTRU5EX0FQSV9LRVkgZW4gZWwgc2Vydmlkb3IuXCJcbiAgICB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3Qge1xuICAgICAgaWQgPSBudWxsLFxuICAgICAgbm9tYnJlID0gXCJQcm9zcGVjdG9cIixcbiAgICAgIHdoYXRzYXBwID0gXCJcIixcbiAgICAgIGluc3RhZ3JhbSA9IFwiXCIsXG4gICAgICByb3V0ZSA9IFwiQ1wiLFxuICAgICAgcm91dGVfbmFtZSA9IFwiTWVudG9yXHUwMEVEYSBDbFx1MDBFRG5pY2FcIixcbiAgICAgIHN1Z2dlc3RlZF9yYW5nZSA9IFwiJDY1MCBcdTIwMTMgJDUsMDAwIE1YTlwiLFxuICAgICAgYW5zd2VycyA9IHt9LFxuICAgICAgdWJpY2FjaW9uID0gbnVsbCxcbiAgICAgIGN1YW5kbyA9IG51bGwsXG4gICAgICB1dG1fc291cmNlID0gbnVsbFxuICAgIH0gPSByZXEuYm9keSB8fCB7fTtcblxuICAgIGNvbnN0IGNsZWFuUGhvbmUgPSAod2hhdHNhcHAgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgIGNvbnN0IHdhTGluayA9IGNsZWFuUGhvbmUgPyBgaHR0cHM6Ly93YS5tZS8ke2NsZWFuUGhvbmV9YCA6IG51bGw7XG4gICAgY29uc3QgY2xlYW5JZyA9IChpbnN0YWdyYW0gfHwgXCJcIikucmVwbGFjZSgvXkAvLCBcIlwiKS50cmltKCk7XG4gICAgY29uc3QgaWdMaW5rID0gY2xlYW5JZyA/IGBodHRwczovL2luc3RhZ3JhbS5jb20vJHtjbGVhbklnfWAgOiBudWxsO1xuXG4gICAgLy8gRmVjaGFzIHkgZm9saW8gY2xcdTAwRURuaWNvXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBkYXRlU3RyID0gbm93LnRvTG9jYWxlRGF0ZVN0cmluZyhcImVzLU1YXCIsIHsgZGF5OiBcIjItZGlnaXRcIiwgbW9udGg6IFwiMi1kaWdpdFwiLCB5ZWFyOiBcIm51bWVyaWNcIiB9KTtcbiAgICBjb25zdCB0aW1lU3RyID0gbm93LnRvTG9jYWxlVGltZVN0cmluZyhcImVzLU1YXCIsIHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIgfSk7XG4gICAgY29uc3QgZm9saW9TdHIgPSBpZCA/IFN0cmluZyhpZCkuc2xpY2UoMCwgOCkudG9VcHBlckNhc2UoKSA6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgLy8gTG9nb3RpcG9zIG9maWNpYWxlcyBTVkcgaW5saW5lIHBhcmEgbG9zIGNhbmFsZXMgZGlyZWN0b3NcbiAgICBjb25zdCB3aGF0c2FwcFN2ZyA9IGBcbiAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCIjZmZmZmZmXCIgc3R5bGU9XCJ2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyBtYXJnaW4tcmlnaHQ6IDZweDsgZGlzcGxheTogaW5saW5lLWJsb2NrO1wiPlxuICAgICAgICA8cGF0aCBkPVwiTTE3LjQ3MiAxNC4zODJjLS4yOTctLjE0OS0xLjc1OC0uODY3LTIuMDMtLjk2Ny0uMjczLS4wOTktLjQ3MS0uMTQ4LS42Ny4xNS0uMTk3LjI5Ny0uNzY3Ljk2Ni0uOTQgMS4xNjQtLjE3My4xOTktLjM0Ny4yMjMtLjY0NC4wNzUtLjI5Ny0uMTUtMS4yNTUtLjQ2My0yLjM5LTEuNDc1LS44ODMtLjc4OC0xLjQ4LTEuNzYxLTEuNjUzLTIuMDU5LS4xNzMtLjI5Ny0uMDE4LS40NTguMTMtLjYwNi4xMzQtLjEzMy4yOTgtLjM0Ny40NDYtLjUyLjE0OS0uMTc0LjE5OC0uMjk4LjI5OC0uNDk3LjA5OS0uMTk4LjA1LS4zNzEtLjAyNS0uNTItLjA3NS0uMTQ5LS42NjktMS42MTItLjkxNi0yLjIwNy0uMjQyLS41NzktLjQ4Ny0uNS0uNjY5LS41MS0uMTczLS4wMDgtLjM3MS0uMDEtLjU3LS4wMS0uMTk4IDAtLjUyLjA3NC0uNzkyLjM3Mi0uMjcyLjI5Ny0xLjA0IDEuMDE2LTEuMDQgMi40NzkgMCAxLjQ2MiAxLjA2NSAyLjg3NSAxLjIxMyAzLjA3NC4xNDkuMTk4IDIuMDk2IDMuMiA1LjA3NyA0LjQ4Ny43MDkuMzA2IDEuMjYyLjQ4OSAxLjY5NC42MjUuNzEyLjIyNyAxLjM2LjE5NSAxLjg3MS4xMTguNTcxLS4wODUgMS43NTgtLjcxOSAyLjAwNi0xLjQxMy4yNDgtLjY5NC4yNDgtMS4yODkuMTczLTEuNDEzLS4wNzQtLjEyNC0uMjcyLS4xOTgtLjU3LS4zNDdtLTUuNDIxIDcuNDAzaC0uMDA0YTkuODcgOS44NyAwIDAxLTUuMDMxLTEuMzc4bC0uMzYxLS4yMTQtMy43NDEuOTgyLjk5OC0zLjY0OC0uMjM1LS4zNzRhOS44NiA5Ljg2IDAgMDEtMS41MS01LjI2Yy4wMDEtNS40NSA0LjQzNi05Ljg4NCA5Ljg4OC05Ljg4NCAyLjY0IDAgNS4xMjIgMS4wMyA2Ljk4OCAyLjg5OGE5LjgyNSA5LjgyNSAwIDAxMi44OTMgNi45OTRjLS4wMDMgNS40NS00LjQzNyA5Ljg4NC05Ljg4NSA5Ljg4NG04LjQxMy0xOC4yOTdBMTEuODE1IDExLjgxNSAwIDAwMTIuMDUgMEM1LjQ5NSAwIC4xNiA1LjMzNS4xNTcgMTEuODkyYzAgMi4wOTYuNTQ3IDQuMTQyIDEuNTg4IDUuOTQ1TC4wNTcgMjRsNi4zMDUtMS42NTRhMTEuODgyIDExLjg4MiAwIDAwNS42ODMgMS40NDhoLjAwNWM2LjU1NCAwIDExLjg5LTUuMzM1IDExLjg5My0xMS44OTNhMTEuODIxIDExLjgyMSAwIDAwLTMuNDgtOC40MTNaXCIvPlxuICAgICAgPC9zdmc+XG4gICAgYDtcblxuICAgIGNvbnN0IGluc3RhZ3JhbVN2ZyA9IGBcbiAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCIjZmZmZmZmXCIgc3R5bGU9XCJ2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyBtYXJnaW4tcmlnaHQ6IDZweDsgZGlzcGxheTogaW5saW5lLWJsb2NrO1wiPlxuICAgICAgICA8cGF0aCBkPVwiTTEyIDIuMTYzYzMuMjA0IDAgMy41ODQuMDEyIDQuODUuMDcgMy4yNTIuMTQ4IDQuNzcxIDEuNjkxIDQuOTE5IDQuOTE5LjA1OCAxLjI2NS4wNjkgMS42NDUuMDY5IDQuODQ5IDAgMy4yMDUtLjAxMiAzLjU4NC0uMDY5IDQuODQ5LS4xNDkgMy4yMjUtMS42NjQgNC43NzEtNC45MTkgNC45MTktMS4yNjYuMDU4LTEuNjQ0LjA3LTQuODUuMDctMy4yMDQgMC0zLjU4NC0uMDEyLTQuODQ5LS4wNy0zLjI2LS4xNDktNC43NzEtMS42OTktNC45MTktNC45Mi0uMDU4LTEuMjY1LS4wNy0xLjY0NC0uMDctNC44NDkgMC0zLjIwNC4wMTMtMy41ODMuMDctNC44NDkuMTQ5LTMuMjI3IDEuNjY0LTQuNzcxIDQuOTE5LTQuOTE5IDEuMjY2LS4wNTcgMS42NDUtLjA2OSA0Ljg0OS0uMDY5em0wLTIuMTYzYy0zLjI1OSAwLTMuNjY3LjAxNC00Ljk0Ny4wNzItNC4zNTguMi02Ljc4IDIuNjE4LTYuOTggNi45OC0uMDU5IDEuMjgxLS4wNzMgMS42ODktLjA3MyA0Ljk0OCAwIDMuMjU5LjAxNCAzLjY2OC4wNzIgNC45NDguMiA0LjM1OCAyLjYxOCA2Ljc4IDYuOTggNi45OCAxLjI4MS4wNTggMS42ODkuMDcyIDQuOTQ4LjA3MiAzLjI1OSAwIDMuNjY4LS4wMTQgNC45NDgtLjA3MiA0LjM1NC0uMiA2Ljc4Mi0yLjYxOCA2Ljk3OS02Ljk4LjA1OS0xLjI4LjA3My0xLjY4OS4wNzMtNC45NDggMC0zLjI1OS0uMDE0LTMuNjY3LS4wNzItNC45NDctLjE5Ni00LjM1NC0yLjYxNy02Ljc4LTYuOTc5LTYuOTgtMS4yODEtLjA1OS0xLjY5LS4wNzMtNC45NDktLjA3M3ptMCA1LjgzOGMtMy40MDMgMC02LjE2MiAyLjc1OS02LjE2MiA2LjE2MnMyLjc1OSA2LjE2MyA2LjE2MiA2LjE2MyA2LjE2Mi0yLjc1OSA2LjE2Mi02LjE2M2MwLTMuNDAzLTIuNzU5LTYuMTYyLTYuMTYyLTYuMTYyem0wIDEwLjE2MmMtMi4yMDkgMC00LTEuNzktNC00IDAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDRjMCAyLjIxLTEuNzkxIDQtNCA0em02LjQwNi0xMS44NDVjLS43OTYgMC0xLjQ0MS42NDUtMS40NDEgMS40NHMuNjQ1IDEuNDQgMS40NDEgMS40NGMuNzk1IDAgMS40MzktLjY0NSAxLjQzOS0xLjQ0cy0uNjQ0LTEuNDQtMS40MzktMS40NHpcIi8+XG4gICAgICA8L3N2Zz5cbiAgICBgO1xuXG4gICAgLy8gR2VuZXJhciBmaWxhcyBkZSByZXNwdWVzdGFzIGRlIGRpYWduXHUwMEYzc3RpY29cbiAgICBjb25zdCBhbnN3ZXJSb3dzID0gT2JqZWN0LmVudHJpZXMoYW5zd2VycyB8fCB7fSlcbiAgICAgIC5tYXAoKFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBRVUVTVElPTl9USVRMRVNba2V5XSB8fCBrZXk7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gdmFsPy5sYWJlbCB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiA/IHZhbCA6IFwiXHUyMDE0XCIpO1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgIDx0ciBzdHlsZT1cImJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZjFmNWY5O1wiPlxuICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTBweCAxNHB4OyBjb2xvcjogIzQ3NTU2OTsgZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBmb250LWZhbWlseTogbW9ub3NwYWNlOyB3aWR0aDogNDAlOyB2ZXJ0aWNhbC1hbGlnbjogdG9wO1wiPlxuICAgICAgICAgICAgICAke3RpdGxlfVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDEwcHggMTRweDsgY29sb3I6ICMwZjE3MmE7IGZvbnQtc2l6ZTogMTNweDsgZm9udC13ZWlnaHQ6IDYwMDsgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmOyB3aWR0aDogNjAlO1wiPlxuICAgICAgICAgICAgICAke2xhYmVsfVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICBgO1xuICAgICAgfSlcbiAgICAgIC5qb2luKFwiXCIpO1xuXG4gICAgLy8gUGxhbnRpbGxhIEhUTUwgaW5zcGlyYWRhIGVuIFByb3Bvc2FsTGFiUGRmUmVwb3J0LmpzeFxuICAgIGNvbnN0IGh0bWwgPSBgXG48IURPQ1RZUEUgaHRtbD5cbjxodG1sIGxhbmc9XCJlc1wiPlxuPGhlYWQ+XG4gIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPlxuICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiPlxuICA8dGl0bGU+RGlhZ25cdTAwRjNzdGljbyBDbFx1MDBFRG5pY28gLSBUaGUgRm9ybXVsYWI8L3RpdGxlPlxuICA8c3R5bGU+XG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1NDBweCkge1xuICAgICAgLm91dGVyLXBhZCB7XG4gICAgICAgIHBhZGRpbmc6IDEycHggNnB4ICFpbXBvcnRhbnQ7XG4gICAgICB9XG4gICAgICAuY29udGVudC1wYWQge1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDE0cHggIWltcG9ydGFudDtcbiAgICAgICAgcGFkZGluZy1yaWdodDogMTRweCAhaW1wb3J0YW50O1xuICAgICAgfVxuICAgICAgLmhlYWRlci1zdGFjay1jZWxsIHtcbiAgICAgICAgZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDtcbiAgICAgICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveCAhaW1wb3J0YW50O1xuICAgICAgfVxuICAgICAgLmhlYWRlci1tZXRhLWNvbCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrICFpbXBvcnRhbnQ7XG4gICAgICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG4gICAgICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDtcbiAgICAgICAgbWFyZ2luLXRvcDogMTBweCAhaW1wb3J0YW50O1xuICAgICAgICBwYWRkaW5nLXRvcDogMTBweCAhaW1wb3J0YW50O1xuICAgICAgICBib3JkZXItdG9wOiAxcHggZGFzaGVkICNjYmQ1ZTEgIWltcG9ydGFudDtcbiAgICAgIH1cbiAgICAgIC5oZWFkZXItbWV0YS10YWJsZSB7XG4gICAgICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAwICFpbXBvcnRhbnQ7XG4gICAgICB9XG4gICAgICAuaGVhZGVyLW1ldGEtdGFibGUgdGQge1xuICAgICAgICBmb250LXNpemU6IDEwcHggIWltcG9ydGFudDtcbiAgICAgICAgcGFkZGluZzogMnB4IDJweCAhaW1wb3J0YW50O1xuICAgICAgfVxuICAgIH1cbiAgPC9zdHlsZT5cbjwvaGVhZD5cbjxib2R5IHN0eWxlPVwibWFyZ2luOiAwOyBwYWRkaW5nOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjFmNWY5OyBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7IGNvbG9yOiAjMzM0MTU1O1wiPlxuICA8dGFibGUgcm9sZT1cInByZXNlbnRhdGlvblwiIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIGNsYXNzPVwib3V0ZXItcGFkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZjFmNWY5OyBwYWRkaW5nOiAzMHB4IDE1cHg7XCI+XG4gICAgPHRyPlxuICAgICAgPHRkIGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgIDwhLS0gTWFpbiBDb250YWluZXIgLS0+XG4gICAgICAgIDx0YWJsZSByb2xlPVwicHJlc2VudGF0aW9uXCIgd2lkdGg9XCIxMDAlXCIgc3R5bGU9XCJtYXgtd2lkdGg6IDYyMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmZmZmOyBib3JkZXI6IDFweCBzb2xpZCAjY2JkNWUxOyBib3JkZXItcmFkaXVzOiAxMnB4OyBvdmVyZmxvdzogaGlkZGVuOyBib3gtc2hhZG93OiAwIDRweCAxNnB4IHJnYmEoMCwwLDAsMC4wNik7XCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCI+XG4gICAgICAgICAgXG4gICAgICAgICAgPCEtLSBFbmNhYmV6YWRvIGRlIExhYm9yYXRvcmlvIChMb2dvIE9maWNpYWwgY29uIEltYWdlbiArIE1ldGFkYXRvcyBkZSBFbWlzaVx1MDBGM24pIC0tPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNvbnRlbnQtcGFkXCIgc3R5bGU9XCJwYWRkaW5nOiAyMnB4IDI4cHggMThweCAyOHB4OyBib3JkZXItYm90dG9tOiAycHggc29saWQgI2UyZThmMDsgYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjtcIj5cbiAgICAgICAgICAgICAgPHRhYmxlIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImhlYWRlci1zdGFjay1jZWxsXCIgc3R5bGU9XCJ2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1wiPlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly90aGVmb3JtdWxhYi5pb1wiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwidGV4dC1kZWNvcmF0aW9uOiBub25lOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjPVwiaHR0cHM6Ly93d3cudGhlZm9ybXVsYWIuaW8vbG9nby5wbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PVwidGhlIGZvcm11bGFiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjM4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAzOHB4OyB3aWR0aDogYXV0bzsgbWF4LXdpZHRoOiAxODBweDsgZGlzcGxheTogYmxvY2s7IGJvcmRlcjogMDtcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC13ZWlnaHQ6IDcwMDsgY29sb3I6ICM2NDc0OGI7IGxldHRlci1zcGFjaW5nOiAxLjVweDsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgbWFyZ2luLXRvcDogNHB4O1wiPlxuICAgICAgICAgICAgICAgICAgICAgIExhYm9yYXRvcmlvIENsXHUwMEVEbmljbyBkZSBFc3RyYXRlZ2lhXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZCBhbGlnbj1cInJpZ2h0XCIgY2xhc3M9XCJoZWFkZXItbWV0YS1jb2xcIiBzdHlsZT1cInZlcnRpY2FsLWFsaWduOiB0b3A7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6ICM2NDc0OGI7XCI+XG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiBhdXRvO1wiIGNsYXNzPVwiaGVhZGVyLW1ldGEtdGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogbm93cmFwOyBwYWRkaW5nOiAxcHggOHB4IDFweCAwOyB0ZXh0LWFsaWduOiBsZWZ0OyBjb2xvcjogIzY0NzQ4YjtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgRmVjaGE6IDxzdHJvbmcgc3R5bGU9XCJjb2xvcjogIzBmMTcyYTtcIj4ke2RhdGVTdHJ9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwid2hpdGUtc3BhY2U6IG5vd3JhcDsgcGFkZGluZzogMXB4IDAgMXB4IDhweDsgdGV4dC1hbGlnbjogbGVmdDsgY29sb3I6ICM2NDc0OGI7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEhvcmE6IDxzdHJvbmcgc3R5bGU9XCJjb2xvcjogIzBmMTcyYTtcIj4ke3RpbWVTdHJ9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwid2hpdGUtc3BhY2U6IG5vd3JhcDsgcGFkZGluZzogMXB4IDhweCAxcHggMDsgdGV4dC1hbGlnbjogbGVmdDsgY29sb3I6ICM2NDc0OGI7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZvbGlvOiA8c3Ryb25nIHN0eWxlPVwiY29sb3I6ICMwZjE3MmE7XCI+I0VYUC0ke2ZvbGlvU3RyfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3dyYXA7IHBhZGRpbmc6IDFweCAwIDFweCA4cHg7IHRleHQtYWxpZ246IGxlZnQ7IGNvbG9yOiAjNjQ3NDhiO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBWaWdlbmNpYTogPHN0cm9uZyBzdHlsZT1cImNvbG9yOiAjMGYxNzJhO1wiPklubWVkaWF0YTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuXG4gICAgICAgICAgPCEtLSBUaXR1bGFyIFByaW5jaXBhbCBjb24gRm9uZG8gT3NjdXJvIGRlIExhYm9yYXRvcmlvIC0tPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNvbnRlbnQtcGFkXCIgc3R5bGU9XCJwYWRkaW5nOiAxNnB4IDI4cHggMCAyOHB4O1wiPlxuICAgICAgICAgICAgICA8dGFibGUgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjMGYxNzJhOyBib3JkZXItcmFkaXVzOiA2cHg7XCI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTJweCAxOHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogbW9ub3NwYWNlOyBmb250LXNpemU6IDEwcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiAjZWYxOGQ2OyBsZXR0ZXItc3BhY2luZzogMS44cHg7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IG1hcmdpbi1ib3R0b206IDJweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICBJTkZPUk1FIERFIEFETUlTSVx1MDBEM04gWSBBU0lHTkFDSVx1MDBEM05cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMSBzdHlsZT1cIm1hcmdpbjogMDsgZm9udC1zaXplOiAxM3B4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogI2ZmZmZmZjsgbGV0dGVyLXNwYWNpbmc6IDAuNXB4OyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1wiPlxuICAgICAgICAgICAgICAgICAgICAgIEV4cGVkaWVudGUgQ2xcdTAwRURuaWNvIGRlIFJlc3VsdGFkb3MgeSBEaWFnblx1MDBGM3N0aWNvXG4gICAgICAgICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG5cbiAgICAgICAgICA8IS0tIDEuIEZpY2hhIGRlIFByb3NwZWN0byAvIE1ldGFkYXRvcyAoY29uIFNlcnZpY2lvIEFzaWduYWRvIENlbnRyYWRvKSAtLT5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQgY2xhc3M9XCJjb250ZW50LXBhZFwiIHN0eWxlPVwicGFkZGluZzogMTZweCAyOHB4O1wiPlxuICAgICAgICAgICAgICA8dGFibGUgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmYWZjOyBib3JkZXI6IDFweCBzb2xpZCAjZTJlOGYwOyBib3JkZXItcmFkaXVzOiA4cHg7IHBhZGRpbmc6IDEycHggMTZweDtcIj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJ3aWR0aDogNTAlOyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyBwYWRkaW5nOiA2cHggMTJweCA2cHggMDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlMmU4ZjA7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGNvbG9yOiAjNjQ3NDhiOyBmb250LXdlaWdodDogNjAwO1wiPlByb3NwZWN0byAvIENsaWVudGU6PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgc3R5bGU9XCJmb250LXNpemU6IDE0cHg7IGNvbG9yOiAjMGYxNzJhOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IG1hcmdpbi10b3A6IDJweDtcIj4ke25vbWJyZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQgYWxpZ249XCJjZW50ZXJcIiBzdHlsZT1cIndpZHRoOiA1MCU7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogNnB4IDAgNnB4IDEycHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTJlOGYwO1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBjb2xvcjogIzY0NzQ4YjsgZm9udC13ZWlnaHQ6IDYwMDsgdGV4dC1hbGlnbjogY2VudGVyOyBtYXJnaW4tYm90dG9tOiA0cHg7XCI+U2VydmljaW8gQXNpZ25hZG86PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWJsb2NrOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWZmNmZmOyBib3JkZXI6IDFweCBzb2xpZCAjYmZkYmZlOyBjb2xvcjogIzE4OGZmMDsgZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyBwYWRkaW5nOiA0cHggMTJweDsgYm9yZGVyLXJhZGl1czogOTk5OXB4OyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgJHtyb3V0ZV9uYW1lfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwid2lkdGg6IDUwJTsgdmVydGljYWwtYWxpZ246IHRvcDsgcGFkZGluZzogOHB4IDEycHggNnB4IDA7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTJlOGYwO1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgY29sb3I6ICM2NDc0OGI7IGZvbnQtd2VpZ2h0OiA2MDA7XCI+VGVsXHUwMEU5Zm9ubyAvIFdoYXRzQXBwOjwvc3Bhbj48YnIvPlxuICAgICAgICAgICAgICAgICAgICAke1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFuUGhvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYDxhIGhyZWY9XCIke3dhTGlua31cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiAjMGYxNzJhOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtc2l6ZTogMTNweDsgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBtYXJnaW4tdG9wOiAycHg7XCI+KyR7Y2xlYW5QaG9uZX08L2E+YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDEycHg7IGNvbG9yOiAjNjQ3NDhiO1wiPlNpbiBlc3BlY2lmaWNhcjwvc3Bhbj5gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJ3aWR0aDogNTAlOyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyBwYWRkaW5nOiA4cHggMCA2cHggMTJweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlMmU4ZjA7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBjb2xvcjogIzY0NzQ4YjsgZm9udC13ZWlnaHQ6IDYwMDtcIj5QZXJmaWwgZGUgSW5zdGFncmFtOjwvc3Bhbj48YnIvPlxuICAgICAgICAgICAgICAgICAgICAke1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFuSWdcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYDxhIGhyZWY9XCIke2lnTGlua31cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImNvbG9yOiAjMGYxNzJhOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtc2l6ZTogMTNweDsgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBtYXJnaW4tdG9wOiAycHg7XCI+QCR7Y2xlYW5JZ308L2E+YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDEycHg7IGNvbG9yOiAjNjQ3NDhiO1wiPlNpbiBlc3BlY2lmaWNhcjwvc3Bhbj5gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJ3aWR0aDogNTAlOyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyBwYWRkaW5nOiA4cHggMTJweCA0cHggMDtcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGNvbG9yOiAjNjQ3NDhiOyBmb250LXdlaWdodDogNjAwO1wiPlViaWNhY2lcdTAwRjNuOjwvc3Bhbj48YnIvPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4OyBjb2xvcjogIzBmMTcyYTsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBtYXJnaW4tdG9wOiAycHg7XCI+JHt1YmljYWNpb24gfHwgXCJTaW4gZXNwZWNpZmljYXJcIn08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJ3aWR0aDogNTAlOyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyBwYWRkaW5nOiA4cHggMCA0cHggMTJweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGNvbG9yOiAjNjQ3NDhiOyBmb250LXdlaWdodDogNjAwO1wiPkRpc3BvbmliaWxpZGFkIGRlIEluaWNpbzo8L3NwYW4+PGJyLz5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgY29sb3I6ICMwZjE3MmE7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgbWFyZ2luLXRvcDogMnB4O1wiPiR7Y3VhbmRvIHx8IFwiRmxleGlibGVcIn08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5cblxuICAgICAgICAgIDwhLS0gMi4gVGFibGEgZGUgUmVzdWx0YWRvcyBDbFx1MDBFRG5pY29zIChBbmFsaXRvcyAvIFJlc3B1ZXN0YXMgUmVwb3J0YWRhcykgLS0+XG4gICAgICAgICAgJHtcbiAgICAgICAgICAgIGFuc3dlclJvd3NcbiAgICAgICAgICAgICAgPyBgXG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiY29udGVudC1wYWRcIiBzdHlsZT1cInBhZGRpbmc6IDAgMjhweCAxOHB4IDI4cHg7XCI+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogbW9ub3NwYWNlOyBmb250LXNpemU6IDEwcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiAjNjQ3NDhiOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBsZXR0ZXItc3BhY2luZzogMS41cHg7IG1hcmdpbi1ib3R0b206IDhweDtcIj5cbiAgICAgICAgICAgICAgICBBTlx1MDBDMUxJU0lTIERFIFJFU1BVRVNUQVMgUkVQT1JUQURBU1xuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHRhYmxlIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjsgYm9yZGVyOiAxcHggc29saWQgI2UyZThmMDsgYm9yZGVyLXJhZGl1czogOHB4OyBvdmVyZmxvdzogaGlkZGVuOyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1wiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgIDx0ciBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICNmOGZhZmM7IGJvcmRlci1ib3R0b206IDJweCBzb2xpZCAjY2JkNWUxO1wiPlxuICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9XCJwYWRkaW5nOiA4cHggMTRweDsgdGV4dC1hbGlnbjogbGVmdDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC1zaXplOiAxMHB4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogIzQ3NTU2OTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgd2lkdGg6IDQwJTtcIj5cbiAgICAgICAgICAgICAgICAgICAgICBBbmFsaXRvIC8gUHJlZ3VudGFcbiAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVwicGFkZGluZzogOHB4IDE0cHg7IHRleHQtYWxpZ246IGxlZnQ7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7IGZvbnQtc2l6ZTogMTBweDsgZm9udC13ZWlnaHQ6IDcwMDsgY29sb3I6ICM0NzU1Njk7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IHdpZHRoOiA2MCU7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgUmVzdWx0YWRvIFJlcG9ydGFkb1xuICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICR7YW5zd2VyUm93c31cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPmBcbiAgICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgPCEtLSAzLiBEaWN0YW1lbiBGaW5hbmNpZXJvIC8gUmFuZ28gZGUgUHJvcHVlc3RhIC0tPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNvbnRlbnQtcGFkXCIgc3R5bGU9XCJwYWRkaW5nOiAwIDI4cHggMThweCAyOHB4O1wiPlxuICAgICAgICAgICAgICA8dGFibGUgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmYWZjOyBib3JkZXI6IDFweCBzb2xpZCAjY2JkNWUxOyBib3JkZXItbGVmdDogNHB4IHNvbGlkICMxODhmZjA7IGJvcmRlci1yYWRpdXM6IDZweDsgcGFkZGluZzogMTJweCAxNnB4O1wiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC13ZWlnaHQ6IDcwMDsgY29sb3I6ICM2NDc0OGI7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgRElDVEFNRU4gQ09NRVJDSUFMIFNVR0VSSURPXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxNnB4OyBmb250LXdlaWdodDogODAwOyBjb2xvcjogIzBmMTcyYTsgbWFyZ2luLXRvcDogMnB4O1wiPlxuICAgICAgICAgICAgICAgICAgICAgICR7c3VnZ2VzdGVkX3JhbmdlfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgY29sb3I6ICM2NDc0OGI7IG1hcmdpbi10b3A6IDJweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICBTZXJ2aWNpbyByZWNvbWVuZGFkbzogPHN0cm9uZyBzdHlsZT1cImNvbG9yOiAjMGYxNzJhO1wiPiR7cm91dGVfbmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG5cbiAgICAgICAgICA8IS0tIDQuIENhbmFsZXMgRGlyZWN0b3MgZGUgQ29udGFjdG8gKEJvdG9uZXMgTGltcGlvcyBhbCBGaW5hbCkgLS0+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiY29udGVudC1wYWRcIiBzdHlsZT1cInBhZGRpbmc6IDAgMjhweCAyMHB4IDI4cHg7XCI+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LWZhbWlseTogbW9ub3NwYWNlOyBmb250LXNpemU6IDEwcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiAjNjQ3NDhiOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBsZXR0ZXItc3BhY2luZzogMS41cHg7IG1hcmdpbi1ib3R0b206IDhweDtcIj5cbiAgICAgICAgICAgICAgICBBQ0NJT05FUyBESVJFQ1RBUyBERSBDT05UQUNUT1xuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHRhYmxlIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICR7XG4gICAgICAgICAgICAgICAgICAgIHdhTGlua1xuICAgICAgICAgICAgICAgICAgICAgID8gYFxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZy1yaWdodDogOHB4OyB3aWR0aDogNTAlO1wiPlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt3YUxpbmt9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgc3R5bGU9XCJkaXNwbGF5OiBibG9jazsgdGV4dC1hbGlnbjogY2VudGVyOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMjVEMzY2OyBjb2xvcjogI2ZmZmZmZjsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBwYWRkaW5nOiAxMXB4IDE2cHg7IGJvcmRlci1yYWRpdXM6IDhweDsgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAxM3B4O1wiPlxuICAgICAgICAgICAgICAgICAgICAgICR7d2hhdHNhcHBTdmd9IEFicmlyIFdoYXRzQXBwXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+YFxuICAgICAgICAgICAgICAgICAgICAgIDogXCJcIlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgJHtcbiAgICAgICAgICAgICAgICAgICAgaWdMaW5rXG4gICAgICAgICAgICAgICAgICAgICAgPyBgXG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nLWxlZnQ6ICR7d2FMaW5rID8gXCI4cHhcIiA6IFwiMFwifTsgd2lkdGg6ICR7d2FMaW5rID8gXCI1MCVcIiA6IFwiMTAwJVwifTtcIj5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7aWdMaW5rfVwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IGNlbnRlcjsgYmFja2dyb3VuZC1jb2xvcjogI0UxMzA2QzsgY29sb3I6ICNmZmZmZmY7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgcGFkZGluZzogMTFweCAxNnB4OyBib3JkZXItcmFkaXVzOiA4cHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGZvbnQtc2l6ZTogMTNweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAke2luc3RhZ3JhbVN2Z30gQWJyaXIgSW5zdGFncmFtXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+YFxuICAgICAgICAgICAgICAgICAgICAgIDogXCJcIlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG5cbiAgICAgICAgICA8IS0tIFBpZSBJbnN0aXR1Y2lvbmFsIGRlIExhYm9yYXRvcmlvIC0tPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNvbnRlbnQtcGFkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmYWZjOyBib3JkZXItdG9wOiAxcHggc29saWQgI2UyZThmMDsgcGFkZGluZzogMTZweCAyOHB4OyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiAjNjQ3NDhiOyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7IGxpbmUtaGVpZ2h0OiAxLjY7XCI+XG4gICAgICAgICAgICAgIFRIRSBGT1JNVUxBQiBTLkEuIERFIEMuVi4gXHUwMEI3IENFUlRJRklDQUNJXHUwMEQzTiBERSBESUFHTlx1MDBEM1NUSUNPIEVTVFJBVFx1MDBDOUdJQ088YnIvPlxuICAgICAgICAgICAgICBDYW5jXHUwMEZBbiwgUXVpbnRhbmEgUm9vIFx1MDBCNyBNXHUwMEU5eGljbyBcdTAwQjcgdGhlZm9ybXVsYWIuaW9cbiAgICAgICAgICAgICAgJHt1dG1fc291cmNlID8gYDxici8+PHNwYW4gc3R5bGU9XCJjb2xvcjogIzk0YTNiODtcIj5BdHJpYnVjaVx1MDBGM246IHV0bV9zb3VyY2U9JHt1dG1fc291cmNlfTwvc3Bhbj5gIDogXCJcIn1cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5cblxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC90ZD5cbiAgICA8L3RyPlxuICA8L3RhYmxlPlxuPC9ib2R5PlxuPC9odG1sPlxuICAgIGA7XG5cbiAgICBjb25zdCBmcm9tRW1haWwgPSBwcm9jZXNzLmVudi5MRUFEX05PVElGSUNBVElPTl9GUk9NX0VNQUlMIHx8IFwib25ib2FyZGluZ0ByZXNlbmQuZGV2XCI7XG4gICAgY29uc3QgdG9FbWFpbCA9IHByb2Nlc3MuZW52LkxFQURfTk9USUZJQ0FUSU9OX1RPX0VNQUlMIHx8IFwidGhlZm9ybXVsYWIuaW9AZ21haWwuY29tXCI7XG4gICAgY29uc3Qgc3ViamVjdCA9IGBOdWV2byBFeHBlZGllbnRlIENsXHUwMEVEbmljbzogJHtub21icmV9IFx1MDBCNyAke3JvdXRlX25hbWV9YDtcblxuICAgIGNvbnN0IHJlc2VuZCA9IG5ldyBSZXNlbmQoYXBpS2V5KTtcbiAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCByZXNlbmQuZW1haWxzLnNlbmQoe1xuICAgICAgZnJvbTogZnJvbUVtYWlsLFxuICAgICAgdG86IHRvRW1haWwsXG4gICAgICBzdWJqZWN0LFxuICAgICAgaHRtbFxuICAgIH0pO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgYWwgZW52aWFyIGVtYWlsIGNvbiBSZXNlbmQ6XCIsIGVycm9yKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCBcIkVycm9yIGFsIGRlc3BhY2hhciBlbCBjb3JyZW8gY29uIFJlc2VuZC5cIlxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtZXNzYWdlOiBcIk5vdGlmaWNhY2lcdTAwRjNuIGRlIGxlYWQgZW52aWFkYSBjb24gXHUwMEU5eGl0by5cIixcbiAgICAgIGVtYWlsSWQ6IGRhdGE/LmlkXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBpbmVzcGVyYWRvIGVuIGFwaS9ub3RpZnktbGVhZDpcIiwgZXJyKTtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oe1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyLm1lc3NhZ2UgfHwgXCJFcnJvciBpbnRlcm5vIGRlbCBzZXJ2aWRvciBhbCBwcm9jZXNhciBsYSBub3RpZmljYWNpXHUwMEYzbi5cIlxuICAgIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9YLFNBQVMsY0FBYyxlQUFlO0FBQzFaLE9BQU8sV0FBVztBQUNsQixPQUFPQSxXQUFVOzs7QUNGcVksT0FBTyxRQUFRO0FBQ3JhLE9BQU8sVUFBVTtBQUNqQixTQUFTLFVBQVUsa0JBQWtCLHFCQUFxQix3QkFBd0I7QUFDbEYsU0FBUyxvQkFBb0I7OztBQ0hxVyxTQUFTLGNBQWM7QUFFelosSUFBTSxrQkFBa0I7QUFBQSxFQUN0QixVQUFVO0FBQUEsRUFDVixPQUFPO0FBQUEsRUFDUCxXQUFXO0FBQUEsRUFDWCxTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQ2I7QUFPQSxlQUFPLFFBQStCLEtBQUssS0FBSztBQUM5QyxNQUFJLFVBQVUsb0NBQW9DLElBQUk7QUFDdEQsTUFBSSxVQUFVLCtCQUErQixHQUFHO0FBQ2hELE1BQUksVUFBVSxnQ0FBZ0MsY0FBYztBQUM1RCxNQUFJO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsTUFBSSxJQUFJLFdBQVcsV0FBVztBQUM1QixXQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSTtBQUFBLEVBQzdCO0FBRUEsTUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixXQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSztBQUFBLE1BQzFCLFNBQVM7QUFBQSxNQUNULE9BQU87QUFBQSxJQUNULENBQUM7QUFBQSxFQUNI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
