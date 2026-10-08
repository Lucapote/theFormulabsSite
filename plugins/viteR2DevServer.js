import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Plugin de desarrollo para Vite que intercepta las llamadas a:
 * - /api/upload-r2 (subida de archivos binarios o eliminación)
 * - /api/r2-presigned-url (generación de URLs prefirmadas o eliminación de objetos)
 * durante `npm run dev` y opera directamente contra Cloudflare R2 sin exponer credenciales al cliente web.
 */
export function viteR2DevServer() {
  return {
    name: "vite-plugin-r2-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
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
            const targetKey = body.key || urlObj.searchParams.get("key");

            // Acción: ELIMINAR objeto de R2
            if (action === "delete" || req.method === "DELETE") {
              if (!targetKey) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "La clave (key) del objeto es requerida para eliminar." }));
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

            // Acción: GENERAR URL PREFIRMADA
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
