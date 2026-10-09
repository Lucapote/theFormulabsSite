import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_DOMAIN = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/$/, "");
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

function getS3Client() {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error("Missing required environment variables: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY or R2_BUCKET_NAME");
  }

  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }
    const params = { ...(req.query || {}), ...body };
    const { fileName, fileType, calendarioId, key } = params;
    const action = params.action || (req.method === "DELETE" ? "delete" : "put");
    const s3Client = getS3Client();

    // Manejar eliminación de objeto en R2 si se solicita action = 'delete'
    if (action === "delete" || req.method === "DELETE") {
      const targetKey = key || params.key;
      if (!targetKey) {
        return res.status(400).json({ error: "La clave (key) del objeto es requerida para eliminar." });
      }

      const deleteCmd = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: targetKey,
      });

      await s3Client.send(deleteCmd);
      return res.status(200).json({ success: true, message: `Objeto ${targetKey} eliminado de Cloudflare R2.` });
    }

    if (!fileName || !calendarioId) {
      return res.status(400).json({ error: "Parámetros obligatorios faltantes: fileName, calendarioId" });
    }

    const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const storageKey = `calendarios/${calendarioId}/${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: fileType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${storageKey}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      key: storageKey,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generando URL prefirmada de Cloudflare R2:", error);
    return res.status(500).json({ error: error.message || "Error interno al firmar URL R2" });
  }
}
