import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

function sanitizeStorageKey(key) {
  if (!key || typeof key !== "string") return null;
  if (key.includes("..") || key.startsWith("/") || key.includes("\\")) return null;
  return key.trim();
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_DOMAIN = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/$/, "");
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

function getS3Client() {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error("Missing required environment variables for Cloudflare R2");
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-token-reserva, x-file-name, x-file-type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Utiliza POST." });
  }

  try {
    const tokenReserva = (req.headers["x-token-reserva"] || req.query.tokenReserva || "").trim();
    const rawFileName = req.headers["x-file-name"] || req.query.fileName || "comprobante.webp";
    const fileType = (req.headers["x-file-type"] || req.query.fileType || "image/webp").toLowerCase();

    if (!tokenReserva) {
      return res.status(400).json({ error: "Token de reserva es requerido." });
    }

    const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: "Formato no permitido. Sube una imagen (JPG, PNG, WebP) o PDF." });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Servicio de base de datos no configurado." });
    }

    const sbClient = createClient(supabaseUrl, supabaseKey);
    const { data: prodRow, error: prodErr } = await sbClient
      .from("producciones")
      .select("id, ciclo_id")
      .eq("token_reserva", tokenReserva)
      .maybeSingle();

    if (prodErr || !prodRow?.ciclo_id) {
      return res.status(403).json({ error: "Token de reserva inválido o no autorizado." });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "El archivo recibido está vacío." });
    }

    const cleanFileName = decodeURIComponent(rawFileName)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.-]/g, "");
    const cleanCicloId = sanitizeStorageKey(String(prodRow.ciclo_id).replace(/[^a-zA-Z0-9_-]/g, ""));
    const storageKey = `comprobantes/${cleanCicloId}/${Date.now()}-${cleanFileName}`;

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
    console.error("Error subiendo comprobante a R2 vía serverless:", error);
    return res.status(500).json({ error: error.message || "Error al procesar subida del comprobante." });
  }
}
