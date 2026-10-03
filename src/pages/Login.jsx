import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, AlertTriangle, Info } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLastError(null);

    if (!email || !password) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      toast.success("Sesión iniciada correctamente.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setLastError(error);
      toast.error(error.message || "Error de autenticación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-inter border-b border-neutral-200">
      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.20] pointer-events-none lab-grid-bg"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 90%)"
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="mb-8 text-center sm:text-left">
          <a href="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="The Formulab" className="h-7 w-auto object-contain" />
          </a>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block mb-2">
            AUTENTICACIÓN DE ACCESO · PORTAL PRIVADO
          </span>
          <h1 className="text-3xl sm:text-4xl font-sora font-extrabold text-neutral-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Ingresa tus credenciales del laboratorio para acceder a tu panel.
          </p>
        </div>

        {/* Sharp Clinical Form */}
        <form onSubmit={handleSubmit} className="border-2 border-neutral-900 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-sora font-bold uppercase tracking-wider text-neutral-900 mb-2">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="usuario@theformulab.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-none bg-neutral-50 border border-neutral-200 text-neutral-900 font-inter text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sora font-bold uppercase tracking-wider text-neutral-900 mb-2">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-none bg-neutral-50 border border-neutral-200 text-neutral-900 font-inter text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 bg-neutral-900 text-white font-sora font-bold text-xs tracking-widest uppercase hover:bg-brand-magenta transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {isSubmitting ? "Autenticando..." : "Acceder al Portal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Detailed Error & Diagnostic Helper Box */}
        {lastError && (
          <div className="mt-6 p-4 border border-brand-magenta/40 bg-brand-magenta/5 text-neutral-900 text-xs font-inter space-y-3">
            <div className="flex items-start gap-2 text-brand-magenta font-sora font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Respuesta de Supabase Auth:</span>
            </div>
            <p className="font-mono bg-white p-2.5 border border-brand-magenta/20 text-neutral-800 break-words">
              {lastError.message || JSON.stringify(lastError)}
            </p>

            <div className="pt-2 border-t border-brand-magenta/20 text-neutral-600 space-y-2">
              <p className="font-sora font-bold text-neutral-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-blue" />
                ¿Cómo solucionar este error?
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>
                  <strong>1. ¿Creaste el usuario en Supabase Auth?</strong> La contraseña del proyecto de base de datos PostgreSQL NO es la clave de usuario. Ve a <em>Supabase Dashboard → Authentication → Users → Add User → Create User</em>.
                </li>
                <li>
                  <strong>2. Confirmación de Email:</strong> Si creaste el usuario desde Supabase, asegúrate de desmarcar "Auto-confirm user" o confirmar el correo en <em>Authentication → Providers → Email → Confirm email (Off)</em>.
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-xs font-mono text-neutral-500 hover:text-brand-magenta transition-colors">
            ← Volver a la página principal
          </a>
        </div>
      </div>
    </div>
  );
}
