import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * Robust Environment Variable Loader for Serverless API Functions
 * Automatically loads .env / .env.local in Node.js environments if process.env is unpopulated.
 */
function loadEnvVariables() {
  if (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) {
    return;
  }

  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const [key, ...values] = trimmed.split("=");
            const val = values.join("=").trim().replace(/^["']|["']$/g, "");
            const k = key.trim();
            if (k && !process.env[k]) {
              process.env[k] = val;
            }
          }
        });
      } catch (e) {
        console.warn(`Aviso leyendo ${file}:`, e.message);
      }
    }
  }
}

loadEnvVariables();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
export const getSupabaseUrl = () => supabaseUrl || null;
