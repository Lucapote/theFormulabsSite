import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_DOMAIN = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/$/, "");
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, x-file-name, x-file-type, x-calendario-id"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "PUT") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const fileName = req.headers["x-file-name"] || req.query.fileName || "archivo";
    const fileType = req.headers["x-file-type"] || req.query.fileType || "application/octet-stream";
    const calendarioId = req.headers["x-calendario-id"] || req.query.calendarioId || "general";

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "El cuerpo de la solicitud no contiene datos binarios." });
    }

    const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const storageKey = req.headers["x-storage-key"] || req.query.storageKey || `calendarios/${calendarioId}/${Date.now()}-${cleanFileName}`;

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      Body: buffer,
      ContentType: fileType,
    });

    await s3Client.send(command);

    const publicUrl = `${R2_PUBLIC_DOMAIN}/${storageKey}`;

    return res.status(200).json({
      success: true,
      publicUrl,
      key: storageKey,
    });
  } catch (error) {
    console.error("Error subiendo a Cloudflare R2 vía API serverless:", error);
    return res.status(500).json({ error: error.message || "Error al procesar subida a R2" });
  }
}
