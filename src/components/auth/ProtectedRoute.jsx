import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-inter">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-brand-magenta animate-pulse" />
          <span className="font-sora text-sm font-bold uppercase tracking-widest text-neutral-900">
            Verificando Credenciales...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
