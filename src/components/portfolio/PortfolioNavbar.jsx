import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * PortfolioNavbar
 * Barra de navegación minimalista del Portafolio:
 * Exclusivamente el logotipo oficial y el botón de acción principal "Solicitar diagnóstico".
 */
export default function PortfolioNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80">
      <nav
        className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Portfolio Navigation"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <img src="/logo.png" alt="The Formulab" className="h-8 w-auto object-contain" />
        </Link>

        {/* CTA Directo a Diagnóstico */}
        <Button
          variant="lab"
          size="sm"
          className="px-4 sm:px-5 h-9 bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-sm hover:shadow-md font-sora text-xs uppercase tracking-wider rounded-full active:scale-[0.98] transition-all cursor-pointer"
          asChild
        >
          <Link to="/diagnostico">
            <span className="sm:hidden">Diagnóstico</span>
            <span className="hidden sm:inline">Solicitar diagnóstico</span>
          </Link>
        </Button>
      </nav>
    </header>
  );
}
