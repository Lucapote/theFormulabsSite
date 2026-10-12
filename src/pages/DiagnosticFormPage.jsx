import { ArrowLeft } from "lucide-react";
import LeadFormContainer from "@/components/leadForm/LeadFormContainer";

export default function DiagnosticFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter relative selection:bg-[#188ff0] selection:text-white pb-20 overflow-x-hidden">
      {/* Sutil gradiente ambiental de laboratorio */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="The Formulab" className="h-8 sm:h-9 w-auto object-contain" />
            </a>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 pt-3 sm:pt-10 relative z-10">
        <LeadFormContainer />
      </main>

      {/* Clinical Minimal Footer */}
      <footer className="mt-16 text-center text-xs text-gray-400 font-inter">
        <p>The Formulab · Laboratorio de Estrategia Audiovisual & Contenido</p>
      </footer>
    </div>
  );
}
