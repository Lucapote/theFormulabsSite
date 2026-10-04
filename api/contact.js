import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { name, email, message, company } = req.body || {};

      if (!email) {
        return res.status(400).json({ success: false, error: "El correo es requerido." });
      }

      let dbResult = null;
      if (supabase) {
        const { data, error } = await supabase
          .from("contacts")
          .insert([{ name, email, company, message, created_at: new Date().toISOString() }]);
        if (error) {
          console.warn("Supabase Contact Insert Notice:", error.message);
        } else {
          dbResult = data;
        }
      }

      return res.status(200).json({
        success: true,
        message: "Mensaje de contacto recibido correctamente.",
        data: dbResult
      });
    } catch (error) {
      console.error("Error procesando contacto:", error);
      return res.status(500).json({ success: false, error: "Error en el servidor." });
    }
  }

  return res.status(200).json({
    service: "The Formulab Contact API",
    supabaseConfigured: Boolean(supabaseKey),
    status: "online"
  });
}
