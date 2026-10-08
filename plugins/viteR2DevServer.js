import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Plugin de desarrollo para Vite que intercepta las llamadas a /api/upload-r2
 * durante `npm run dev` y sube los archivos a Cloudflare R2 sin exponer credenciales al cliente web.
 */
export function viteR2DevServer() {
  return {
    name: "vite-plugin-r2-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith("/api/upload-r2")) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");

          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method === "POST" || req.method === "PUT") {
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
              const fileName = req.headers["x-file-name"] || urlObj.searchParams.get("fileName") || "archivo";
              const fileType = req.headers["x-file-type"] || urlObj.searchParams.get("fileType") || "application/octet-stream";
              const calendarioId = req.headers["x-calendario-id"] || urlObj.searchParams.get("calendarioId") || "general";

              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const buffer = Buffer.concat(chunks);

              const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
              const storageKey = `calendarios/${calendarioId}/${Date.now()}-${cleanFileName}`;

              await s3Client.send(
                new PutObjectCommand({
                  Bucket: bucketName,
                  Key: storageKey,
                  Body: buffer,
                  ContentType: fileType,
                })
              );

              const publicUrl = `${publicDomain}/${storageKey}`;
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, publicUrl, key: storageKey }));
              return;
            } catch (err) {
              console.error("Error en Plugin Vite R2 Dev Middleware:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
        }
        next();
      });
    },
  };
}
