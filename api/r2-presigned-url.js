import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";

async function verifySupabaseAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Token de autorización requerido." };
  }
  const token = authHeader.slice(7).trim();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authenticated: false, error: "Servicio de autenticación no configurado." };
  }
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) {
    return { authenticated: false, error: "Sesión inválida o expirada." };
  }
  return { authenticated: true, user };
}

function sanitizeStorageKey(key) {
  if (!key || typeof key !== "string") return null;
  // Prevenir path traversal
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
    "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
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
      const auth = await verifySupabaseAuth(req);
      if (!auth.authenticated) {
        return res.status(401).json({ error: auth.error || "No autorizado para eliminar archivos." });
      }

      const rawKey = key || params.key;
      const targetKey = sanitizeStorageKey(rawKey);
      if (!targetKey) {
        return res.status(400).json({ error: "La clave (key) del objeto es requerida y debe tener un formato válido." });
      }

      const deleteCmd = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: targetKey,
      });

      await s3Client.send(deleteCmd);
      return res.status(200).json({ success: true, message: `Objeto ${targetKey} eliminado de Cloudflare R2.` });
    }

    // Acción: PROXY DE IMÁGENES / MEDIOS (Cero Tainted Canvas / CORS seguro)
    if (action === "proxy" || action === "proxy-image") {
      const targetKey = key || params.key || (params.url && params.url.includes("calendarios/") ? params.url.substring(params.url.indexOf("calendarios/")).split("?")[0] : null);
      if (!targetKey) {
        return res.status(400).json({ error: "La clave (key) o URL es requerida para el proxy." });
      }

      try {
        const getCmd = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: targetKey,
        });
        const s3Res = await s3Client.send(getCmd);
        res.setHeader("Content-Type", s3Res.ContentType || "image/png");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=86400");
        const stream = s3Res.Body;
        for await (const chunk of stream) {
          res.write(chunk);
        }
        return res.end();
      } catch (proxyErr) {
        console.error("Error en proxy R2:", proxyErr);
        return res.status(500).send(`Error al obtener objeto R2: ${proxyErr.message}`);
      }
    }

    // Manejar generación de URL de descarga forzada con Content-Disposition: attachment
    if (action === "download" || action === "get") {
      const targetKey = key || params.key || (params.url && params.url.includes("calendarios/") ? params.url.substring(params.url.indexOf("calendarios/")).split("?")[0] : null);
      if (!targetKey) {
        return res.status(400).json({ error: "La clave (key) o URL del objeto es requerida para la descarga." });
      }

      const cleanDownloadName = fileName ? decodeURIComponent(fileName).replace(/[\r\n"]/g, "").replace(/\s+/g, "_") : "archivo";
      const getCmd = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: targetKey,
        ResponseContentDisposition: `attachment; filename="${cleanDownloadName}"`,
      });

      const downloadUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
      return res.status(200).json({
        success: true,
        downloadUrl,
        key: targetKey,
        fileName: cleanDownloadName,
        expiresIn: 3600,
      });
    }

    // Manejar subida pública de comprobante de pago validada por token_reserva
    if (action === "put_comprobante") {
      const tokenReserva = (params.tokenReserva || "").trim();
      if (!tokenReserva || !fileName) {
        return res.status(400).json({ error: "Parámetros requeridos: tokenReserva y fileName." });
      }

      const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg", "application/pdf"];
      const normalizedType = (fileType || "image/webp").toLowerCase();
      if (!allowedTypes.includes(normalizedType)) {
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

      const cleanFileName = decodeURIComponent(fileName)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      const cleanCicloId = sanitizeStorageKey(String(prodRow.ciclo_id).replace(/[^a-zA-Z0-9_-]/g, ""));
      const storageKey = `comprobantes/${cleanCicloId}/${Date.now()}-${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        ContentType: normalizedType
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicUrl = `${R2_PUBLIC_DOMAIN}/${storageKey}`;

      return res.status(200).json({
        uploadUrl,
        publicUrl,
        key: storageKey,
        expiresIn: 900
      });
    }

    // Manejar subida autenticada de comprobantes administrativos para ciclos mensuales
    if (action === "put_comprobante_admin") {
      const auth = await verifySupabaseAuth(req);
      if (!auth.authenticated) {
        return res.status(401).json({ error: auth.error || "No autorizado para subir comprobantes." });
      }

      const rawCicloId = params.cicloId;
      const cicloId = sanitizeStorageKey(rawCicloId ? String(rawCicloId).replace(/[^a-zA-Z0-9_-]/g, "") : null);
      if (!cicloId || !fileName) {
        return res.status(400).json({ error: "Parámetros requeridos: cicloId y fileName." });
      }

      const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg", "application/pdf"];
      const normalizedType = (fileType || "application/pdf").toLowerCase();
      if (!allowedTypes.includes(normalizedType)) {
        return res.status(400).json({ error: "Formato no permitido. Sube una imagen (JPG, PNG, WebP) o PDF." });
      }

      const cleanFileName = decodeURIComponent(fileName)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      const storageKey = `comprobantes/${cicloId}/${Date.now()}-${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        ContentType: normalizedType
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicUrl = `${R2_PUBLIC_DOMAIN}/${storageKey}`;

      return res.status(200).json({
        uploadUrl,
        publicUrl,
        key: storageKey,
        expiresIn: 900
      });
    }

    // Validar autenticación antes de generar URL prefirmada de subida (PUT)
    const auth = await verifySupabaseAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({ error: auth.error || "No autorizado para generar enlaces de subida a R2." });
    }

    if (!fileName || !calendarioId) {
      return res.status(400).json({ error: "Parámetros obligatorios faltantes: fileName, calendarioId" });
    }

    const cleanFileName = decodeURIComponent(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const cleanCalendarioId = sanitizeStorageKey(String(calendarioId).replace(/[^a-zA-Z0-9_-]/g, ""));
    const storageKey = `calendarios/${cleanCalendarioId}/${Date.now()}-${cleanFileName}`;

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
