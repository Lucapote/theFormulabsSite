import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteR2DevServer } from "./plugins/viteR2DevServer";

export default defineConfig(({ mode }) => {
  // Cargar variables de .env en process.env para Node.js local sin exponerlas al bundle web cliente
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
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    plugins: [react(), viteR2DevServer()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
    }
  };
});
