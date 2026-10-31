import { useRef } from "react";
import { Microscope } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PortfolioCompareSlider from "./PortfolioCompareSlider";
import CaseVideosGrid from "./subcomponents/CaseVideosGrid";
import { FEATURED_CASES } from "@/data/portfolioData";

gsap.registerPlugin(ScrollTrigger);

/**
 * PortfolioFeaturedCases
 * Casos de estudio en profundidad con anclaje visual limpio mediante CSS Sticky (self-start + top-24)
 * delimitado estrictamente por su contenedor padre para evitar desbordamientos sobre la línea divisoria.
 */
export default function PortfolioFeaturedCases() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const caseRows = gsap.utils.toArray(".case-row");

      caseRows.forEach((row) => {
        gsap.from(row.querySelectorAll(".case-fade-item"), {
          opacity: 0,
          y: 18,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: row,
            start: "top 80%",
            once: true
          }
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="casos"
      className="py-20 md:py-28 bg-[#1E1B1F] text-white relative"
    >
      {/* Background lab ambient gradient (clipped in dedicated absolute container without breaking sticky) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-magenta/20 via-transparent to-transparent" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/20 via-transparent to-transparent" />
      </div>

      <div className="container max-w-6xl mx-auto px-6 relative z-10 space-y-16">
        {/* Section Header con Contraste Quirúrgico */}
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold uppercase text-brand-magenta shadow-xs">
            <Microscope className="w-3.5 h-3.5" />
            Casos de Estudio
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sora font-black tracking-tight text-white !text-white drop-shadow-sm">
            Fórmulas destacadas
          </h2>
          <p className="font-inter text-sm sm:text-base text-gray-200 leading-relaxed">
            No solo grabamos videos: diseñamos el sistema completo desde el encuadre en el set hasta la retención del algoritmo.
          </p>
        </div>

        {/* Cases List */}
        <div className="space-y-24 md:space-y-36">
          {FEATURED_CASES.map((item) => {
            const isReversed = Boolean(item.reverseLayout);
            return (
              <article
                key={item.id}
                className="case-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start pb-20 border-b border-white/10 last:border-b-0 last:pb-0 relative"
              >
                {/* Column: Narrative Content (Sticky nativo acotado al artículo padre) */}
                <div
                  className={`lg:col-span-6 space-y-6 lg:sticky lg:top-24 self-start ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="space-y-2 case-fade-item">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-brand-magenta font-bold tracking-wider uppercase">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-white/10 text-white/90 px-2 py-0.5 rounded-full border border-white/20">
                        {item.badgeLabel}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sora font-extrabold text-white !text-white tracking-tight">
                      {item.clientName}
                    </h3>
                  </div>

                  {/* Challenge & Solution Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 case-fade-item">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md space-y-1.5 shadow-sm">
                      <span className="text-[11px] font-mono font-bold uppercase text-brand-magenta tracking-wider block">
                        El reto
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-gray-200 leading-relaxed">
                        {item.challenge}
                      </p>
                    </div>
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md space-y-1.5 shadow-sm">
                      <span className="text-[11px] font-mono font-bold uppercase text-brand-blue tracking-wider block">
                        La fórmula
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-gray-200 leading-relaxed">
                        {item.solution}
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Impact Metrics */}
                  <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-sm case-fade-item">
                    {item.metrics.map((metric, mIdx) => (
                      <div key={mIdx} className="space-y-0.5">
                        <div className="font-sora font-extrabold text-xl sm:text-2xl text-white !text-white tracking-tight">
                          {metric.value}
                        </div>
                        <div className="font-inter text-[11px] text-gray-300 leading-tight">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial Quote */}
                  {item.quote && (
                    <div className="relative pl-4 border-l-2 border-brand-magenta py-1 space-y-1 case-fade-item">
                      <p className="font-inter italic text-sm text-gray-200 leading-relaxed">
                        "{item.quote}"
                      </p>
                      <span className="block font-mono text-[11px] text-gray-300 font-bold uppercase tracking-wider">
                        — {item.clientRole}
                      </span>
                    </div>
                  )}
                </div>

                {/* Column: Media Content (Scrolls naturally alongside pinned info) */}
                <div
                  className={`lg:col-span-6 w-full space-y-4 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                {item.hasCompareSlider && item.compareImages ? (
                  <div className="space-y-4">
                    <PortfolioCompareSlider
                      setImg={item.compareImages.setImg}
                      finalImg={item.compareImages.finalImg}
                      setLabel={item.compareImages.setLabel}
                      finalLabel={item.compareImages.finalLabel}
                    />

                    {/* Additional Photo Strip */}
                    {item.stripPhotos && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {item.stripPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-slate-900 relative group"
                          >
                            <img
                              src={photo.url}
                              alt={photo.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                              <span className="text-[11px] font-sora font-bold text-white !text-white block">
                                {photo.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <CaseVideosGrid
                    videos={item.stripVideos}
                    clientName={item.clientName}
                    colorAccent={item.color}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </section>
  );
}
