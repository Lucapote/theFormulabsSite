import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import notifyLeadHandler from "../api/notify-lead.js";
import metaCallbackHandler from "../api/meta-callback.js";
import cronPublishHandler from "../api/cron-publish.js";
import publishNowHandler from "../api/publish-now.js";

function reloadLocalEnv() {
  const envFiles = [".env", ".env.local"];
  for (const file of envFiles) {
    try {
      const envPath = path.resolve(process.cwd(), file);
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
      console.warn(`No se pudo recargar ${file}:`, e);
    }
  }
}

/**
 * Plugin de desarrollo para Vite que intercepta las llamadas a:
 * - /api/upload-r2 (subida de archivos binarios o eliminación)
 * - /api/r2-presigned-url (generación de URLs prefirmadas o eliminación de objetos)
 * - /api/notify-lead (notificación por correo con Resend)
 * durante `npm run dev` y opera directamente en Node.js sin exponer credenciales al cliente web.
 */
export function viteR2DevServer() {
  return {
    name: "vite-plugin-r2-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Interceptar notificación de leads con Resend en desarrollo local
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

          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
          res.json = function (data) {
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
            await notifyLeadHandler(req, res);
          } catch (err) {
            console.error("Error en local dev /api/notify-lead:", err);
            res.status(500).json({ success: false, error: err.message });
          }
          return;
        }



        // Interceptar callback OAuth de Meta en desarrollo local
        if (req.url && req.url.startsWith("/api/meta-callback")) {
          reloadLocalEnv();

          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");

          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
          }

          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
          res.send = function (data) {
            this.end(data);
            return this;
          };
          res.json = function (data) {
            this.setHeader("Content-Type", "application/json");
            this.end(JSON.stringify(data));
            return this;
          };

          try {
            await metaCallbackHandler(req, res);
          } catch (err) {
            console.error("Error en local dev /api/meta-callback:", err);
            res.status(500).send(`Error en /api/meta-callback: ${err.message}`);
          }
          return;
        }

        // Interceptar /api/cron-publish en desarrollo local
        if (req.url && req.url.startsWith("/api/cron-publish")) {
          reloadLocalEnv();

          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");

          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
          }

          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
          res.json = function (data) {
            this.setHeader("Content-Type", "application/json");
            this.end(JSON.stringify(data));
            return this;
          };

          try {
            await cronPublishHandler(req, res);
          } catch (err) {
            console.error("Error en local dev /api/cron-publish:", err);
            res.status(500).json({ success: false, error: err.message });
          }
          return;
        }

        // Interceptar /api/publish-now en desarrollo local
        if (req.url && req.url.startsWith("/api/publish-now")) {
          reloadLocalEnv();

          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");

          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
          }

          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
          res.json = function (data) {
            this.setHeader("Content-Type", "application/json");
            this.end(JSON.stringify(data));
            return this;
          };

          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString();
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody);
            } catch {
              req.body = {};
            }
          }

          try {
            await publishNowHandler(req, res);
          } catch (err) {
            console.error("Error en local dev /api/publish-now:", err);
            res.status(500).json({ success: false, error: err.message });
          }
          return;
        }

        const isUploadR2 = req.url.startsWith("/api/upload-r2");
        const isPresignedR2 = req.url.startsWith("/api/r2-presigned-url");
        const isUploadComprobante = req.url.startsWith("/api/upload-comprobante");

        if (!isUploadR2 && !isPresignedR2 && !isUploadComprobante) {
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
              secretAccessKey,
            },
          });

          const urlObj = new URL(req.url, `http://${req.headers.host}`);

          // Leer cuerpo de la solicitud
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBuffer = Buffer.concat(chunks);

          // 1. MANEJO DE /api/r2-presigned-url
          if (isPresignedR2) {
            let body = {};
            if (rawBuffer.length > 0) {
              try {
                body = JSON.parse(rawBuffer.toString("utf-8"));
              } catch (_) {}
            }

            const action = body.action || urlObj.searchParams.get("action") || (req.method === "DELETE" ? "delete" : "put");
            const rawTargetKey = body.key || urlObj.searchParams.get("key");
            const targetKey = (rawTargetKey && typeof rawTargetKey === "string" && !rawTargetKey.includes("..") && !rawTargetKey.startsWith("/") && !rawTargetKey.includes("\\"))
              ? rawTargetKey.trim()
              : null;

            // Acción: ELIMINAR objeto de R2
            if (action === "delete" || req.method === "DELETE") {
              if (!targetKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave (key) del objeto es requerida y debe ser válida." }));
                return;
              }

              console.log(`[Vite R2 Dev] Eliminando objeto de Cloudflare R2: ${targetKey}`);
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: targetKey,
                })
              );
              console.log(`[Vite R2 Dev] Objeto eliminado exitosamente de R2: ${targetKey}`);

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, message: `Objeto ${targetKey} eliminado de Cloudflare R2.` }));
              return;
            }

            // Acción: GENERAR URL DE DESCARGA FORZADA (Content-Disposition: attachment)
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
                ResponseContentDisposition: `attachment; filename="${cleanDownloadName}"`,
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

            // Acción: SUBIDA DE COMPROBANTE PÚBLICO (put_comprobante)
            if (action === "put_comprobante") {
              const tokenReserva = (body.tokenReserva || urlObj.searchParams.get("tokenReserva") || "").trim();
              const fileName = body.fileName || urlObj.searchParams.get("fileName") || "comprobante.webp";
              const fileType = body.fileType || urlObj.searchParams.get("fileType") || "image/webp";

              let cicloId = "general";
              try {
                const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
                if (supabaseUrl && supabaseKey) {
                  const { createClient } = await import("@supabase/supabase-js");
                  const sbClient = createClient(supabaseUrl, supabaseKey);
                  const { data: prodRow } = await sbClient
                    .from("producciones")
                    .select("ciclo_id")
                    .eq("token_reserva", tokenReserva)
                    .maybeSingle();
                  if (prodRow?.ciclo_id) {
                    cicloId = String(prodRow.ciclo_id);
                  }
                }
              } catch (sbErr) {
                console.warn("[Vite R2 Dev] No se pudo consultar ciclo_id en Supabase:", sbErr.message);
              }

              const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
              const storageKey = `comprobantes/${cicloId}/${Date.now()}-${cleanFileName}`;

              const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: storageKey,
                ContentType: fileType,
              });

              const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
              const publicUrl = `${publicDomain}/${storageKey}`;

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ uploadUrl, publicUrl, key: storageKey, expiresIn: 900 }));
              return;
            }

            // Acción: GENERAR URL PREFIRMADA (SUBIDA DE CONTENIDO GENERAL)
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
              ContentType: fileType,
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            const publicUrl = `${publicDomain}/${storageKey}`;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ uploadUrl, publicUrl, key: storageKey, expiresIn: 3600 }));
            return;
          }

          // 2. MANEJO DE /api/upload-r2
          if (isUploadR2) {
            // Manejar DELETE en /api/upload-r2 si se invoca
            if (req.method === "DELETE" || req.headers["x-action"] === "delete") {
              const targetKey = req.headers["x-storage-key"] || urlObj.searchParams.get("key") || urlObj.searchParams.get("storageKey");
              if (!targetKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave del objeto es requerida para eliminar." }));
                return;
              }

              console.log(`[Vite R2 Dev] Eliminando objeto de Cloudflare R2 vía upload-r2: ${targetKey}`);
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: targetKey,
                })
              );

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, message: `Objeto ${targetKey} eliminado.` }));
              return;
            }

            // Subida binaria (POST / PUT)
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
                ContentType: fileType,
              })
            );

            const publicUrl = `${publicDomain}/${storageKey}`;
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, publicUrl, key: storageKey }));
            return;
          }

          // 3. MANEJO DE /api/upload-comprobante (Subida binaria de comprobantes de pago pública)
          if (isUploadComprobante) {
            const tokenReserva = (req.headers["x-token-reserva"] || urlObj.searchParams.get("tokenReserva") || "").trim();
            const fileName = req.headers["x-file-name"] || urlObj.searchParams.get("fileName") || "comprobante.webp";
            const fileType = req.headers["x-file-type"] || urlObj.searchParams.get("fileType") || "image/webp";

            if (!tokenReserva) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Token de reserva es requerido." }));
              return;
            }

            let cicloId = "general";
            try {
              const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
              const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
              if (supabaseUrl && supabaseKey) {
                const { createClient } = await import("@supabase/supabase-js");
                const sbClient = createClient(supabaseUrl, supabaseKey);
                const { data: prodRow } = await sbClient
                  .from("producciones")
                  .select("ciclo_id")
                  .eq("token_reserva", tokenReserva)
                  .maybeSingle();
                if (prodRow?.ciclo_id) {
                  cicloId = String(prodRow.ciclo_id);
                }
              }
            } catch (sbErr) {
              console.warn("[Vite R2 Dev] No se pudo consultar ciclo_id para comprobante:", sbErr.message);
            }

            const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
            const storageKey = `comprobantes/${cicloId}/${Date.now()}-${cleanFileName}`;

            await s3Client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: storageKey,
                Body: rawBuffer,
                ContentType: fileType,
              })
            );

            const publicUrl = `${publicDomain}/${storageKey}`;

            // Auto-vincular inmediatamente en Supabase para que aparezca en el Dashboard en desarrollo local
            if (cicloId !== "general") {
              try {
                const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
                if (supabaseUrl && supabaseKey) {
                  const { createClient } = await import("@supabase/supabase-js");
                  const sbClient = createClient(supabaseUrl, supabaseKey);
                  const { data: cicloRow } = await sbClient
                    .from("ciclos_mensuales")
                    .select("id, estado_pago, cliente:clientes(esquema_pago)")
                    .eq("id", cicloId)
                    .maybeSingle();

                  const isSegundoPago =
                    cicloRow?.cliente?.esquema_pago === "dos_pagos" &&
                    cicloRow?.estado_pago === "primer_pago";

                  const updatePayload = {
                    comprobante_en_revision: true,
                  };
                  if (isSegundoPago) {
                    updatePayload.comprobante_2_url = publicUrl;
                  } else {
                    updatePayload.comprobante_url = publicUrl;
                  }

                  await sbClient
                    .from("ciclos_mensuales")
                    .update(updatePayload)
                    .eq("id", cicloId);

                  console.log(`[Vite R2 Dev] Comprobante auto-vinculado exitosamente al ciclo ${cicloId}`);
                }
              } catch (dbErr) {
                console.warn("[Vite R2 Dev] Aviso al auto-vincular ciclo en local:", dbErr.message);
              }
            }

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
    },
  };
}
