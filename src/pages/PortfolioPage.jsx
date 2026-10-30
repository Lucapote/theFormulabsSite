import { useEffect } from "react";
import PortfolioNavbar from "@/components/portfolio/PortfolioNavbar";
import PortfolioFooter from "@/components/portfolio/PortfolioFooter";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import PortfolioReelsWall from "@/components/portfolio/PortfolioReelsWall";
import PortfolioFeaturedCases from "@/components/portfolio/PortfolioFeaturedCases";
import PortfolioBtsStrip from "@/components/portfolio/PortfolioBtsStrip";
import PortfolioBrandsGrid from "@/components/portfolio/PortfolioBrandsGrid";
import PortfolioCtaSection from "@/components/portfolio/PortfolioCtaSection";

/**
 * PortfolioPage
 * Página oficial del Portafolio de The Formulab.
 * Exhibe el banco de reels verticales, casos de estudio y proceso técnico de rodaje.
 * Cumple con el límite estricto de <= 200 líneas según GEMINI.md.
 */
export default function PortfolioPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter selection:bg-brand-magenta/20 selection:text-brand-magenta">
      <PortfolioNavbar />

      <main className="flex-1">
        {/* 1. Hero con titular display y marquee interactivo de reels */}
        <PortfolioHero />

        {/* 2. Muro filtrable por categorías con reproducción inline */}
        <PortfolioReelsWall />

        {/* 3. Fórmulas destacadas: Casos de estudio y comparador Set vs Final */}
        <PortfolioFeaturedCases />

        {/* 4. Toma 47: Detrás de cámaras y estética de laboratorio */}
        <PortfolioBtsStrip />

        {/* 5. Ecosistema de marcas colaboradoras */}
        <PortfolioBrandsGrid />

        {/* 6. Llamada a la acción para diagnóstico y agenda */}
        <PortfolioCtaSection />
      </main>

      <PortfolioFooter />
    </div>
  );
}

