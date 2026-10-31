import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      // Log error strictly to developer console (no error box in UI)
      console.error("Authentication Failure / Error de inicio de sesión:", error);
      toast.error(error.message || "Error de autenticación. Verifica tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-inter">
      {/* Subtle Lab Ambience Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-magenta/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-10">
          <a href="/" className="inline-block hover:opacity-90 transition-opacity mb-8">
            <img src="/logo.png" alt="The Formulab" className="h-14 md:h-16 w-auto object-contain mx-auto" />
          </a>
          <h1 className="text-2xl md:text-3xl font-sora font-bold text-gray-900 tracking-tight mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Accede al centro de gestión y laboratorio estratégico.
          </p>
        </div>

        {/* Sleek ProposalView-style Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-sora font-bold uppercase tracking-wider text-gray-800 mb-2">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="usuario@theformulab.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-900 font-inter text-sm focus:outline-none focus:border-brand-magenta focus:bg-white focus:ring-2 focus:ring-brand-magenta/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sora font-bold uppercase tracking-wider text-gray-800 mb-2">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-900 font-inter text-sm focus:outline-none focus:border-brand-magenta focus:bg-white focus:ring-2 focus:ring-brand-magenta/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-brand-magenta hover:opacity-90 text-white font-sora font-bold text-sm rounded-full shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Autenticando...
                </span>
              ) : (
                <>
                  Acceder al Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-xs font-sora font-semibold text-gray-500 hover:text-brand-magenta transition-colors">
            ← Volver a la página principal
          </a>
        </div>
      </div>
    </div>
  );
}
