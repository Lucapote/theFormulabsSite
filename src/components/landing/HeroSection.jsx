import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import InteractiveDiagnosticForm from "./InteractiveDiagnosticForm";
const AnimatedStat = ({ value }) => {
  const numMatches = value.match(/[\d.]+/);
  const numValue = numMatches ? parseFloat(numMatches[0]) : 0;
  const suffix = value.replace(/[\d.]+/g, "");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (numValue % 1 !== 0) {
      return latest.toFixed(1) + suffix;
    }
    return Math.round(latest) + suffix;
  });
  useEffect(() => {
    const controls = animate(count, numValue, {
      duration: 2,
      delay: 0.6,
      ease: "easeOut"
    });
    return () => controls.stop?.();
  }, [count, numValue]);
  return <motion.span>{rounded}</motion.span>;
};
const GridSquare = () => {
  const [active, setActive] = useState(false);
  const [color, setColor] = useState("");
  const triggerFlash = () => {
    const h = Math.floor(Math.random() * 40) + 280;
    const s = 80 + Math.floor(Math.random() * 20);
    const l = 50 + Math.floor(Math.random() * 10);
    setColor(`hsl(${h} ${s}% ${l}% / 0.25)`);
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 50);
  };
  useEffect(() => {
    let interval;
    const startRandomFlashing = () => {
      const randomOffset = Math.random() * 2e3;
      setTimeout(() => {
        interval = setInterval(() => {
          if (window.innerWidth < 768) {
            if (Math.random() < 0.05) {
              triggerFlash();
            }
          }
        }, 1500 + Math.random() * 3e3);
      }, randomOffset);
    };
    startRandomFlashing();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  return <div
    className="w-full h-full"
    style={{
      backgroundColor: active ? color : "transparent",
      transition: active ? "none" : "background-color 1.5s ease-out"
    }}
    onMouseEnter={triggerFlash}
  />;
};
const InteractiveGrid = () => {
  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });
  useEffect(() => {
    const updateGridSize = () => {
      const size = 48;
      const cols = Math.ceil(window.innerWidth / size);
      const rows = Math.ceil(window.innerHeight / size);
      setGridSize({ cols, rows });
    };
    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);
  return <div
    className="absolute inset-0 overflow-hidden lab-grid-bg"
    style={{
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)"
    }}
  >
      <div
    className="w-full h-full"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${gridSize.cols}, 48px)`,
      gridTemplateRows: `repeat(${gridSize.rows}, 48px)`
    }}
  >
        {Array.from({ length: gridSize.cols * gridSize.rows }).map((_, i) => <GridSquare key={i} />)}
      </div>
    </div>;
};
const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [hasStartedDiagnostic, setHasStartedDiagnostic] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setHasStartedDiagnostic(true);
  };
  return <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
      {
    /* Precision grid with animated interaction */
  }
      <InteractiveGrid />

      {
    /* Soft glow */
  }
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="container relative z-10 max-w-3xl mx-auto px-6">
        {!hasStartedDiagnostic ? <>
            {
    /* Status badge */
  }
            <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-center mb-8"
  >
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full lab-card text-[11px] font-mono tracking-[0.12em] uppercase text-lab-text-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Lab abierto · Diagnosticando pacientes
          </span>
        </motion.div>

        {
    /* Headline */
  }
        <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
  >
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-display font-bold leading-[1.1] tracking-tight text-foreground mb-5">
            Tu negocio está estancado.
            <br />
            <span className="text-gradient">Nosotros tenemos el diagnóstico.</span>
          </h1>
        </motion.div>

        <motion.p
    className="text-center text-[15px] md:text-base text-lab-text-secondary max-w-lg mx-auto mb-10 leading-relaxed"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.25 }}
  >
          Somos el laboratorio de AI que diagnostica los cuellos de botella de tu negocio
          y prescribe sistemas inteligentes para marketing, ventas y operaciones.
        </motion.p>

        {
    /* CTA: Email capture */
  }
        <motion.div
    className="max-w-md mx-auto"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
  >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl lab-card">
            <input
    type="email"
    required
    placeholder="tu@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="flex-1 h-11 px-4 rounded-lg bg-background border-0 text-foreground placeholder:text-lab-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
  />
            <Button type="submit" variant="lab" className="h-11 px-6 shrink-0">
              Diagnóstico gratis
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">Sin spam</span>
            <span className="w-1 h-1 rounded-full bg-lab-border" />
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">Respuesta en 24h</span>
            <span className="w-1 h-1 rounded-full bg-lab-border" />
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">100% confidencial</span>
          </div>
        </motion.div>

        {
    /* Social proof strip */
  }
        <motion.div
    className="relative mt-14 pt-8 border-t border-lab-border"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
          {
    /* ECG Background */
  }
          <div className="absolute top-8 bottom-0 left-0 right-0 z-0 pointer-events-none flex opacity-[0.15] overflow-hidden text-primary [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
    className="flex min-w-max h-full items-center"
    animate={{ x: ["0%", "-50%"] }}
    transition={{ duration: 15, ease: "linear", repeat: Infinity }}
  >
              {[0, 1].map((i) => <svg key={i} width="800" height="100" viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path
    d="M0 50 L100 50 L105 45 L110 50 L115 50 L120 55 L125 10 L130 90 L135 50 L145 50 L155 40 L165 50 L350 50 L355 45 L360 50 L365 50 L370 55 L375 10 L380 90 L385 50 L395 50 L405 40 L415 50 L600 50 L605 45 L610 50 L615 50 L620 55 L625 10 L630 90 L635 50 L645 50 L655 40 L665 50 L800 50"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
                </svg>)}
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-8 md:gap-12">
            {[
    { value: "25+", label: "Negocios diagnosticados" },
    { value: "2.5x", label: "Crecimiento promedio" },
    { value: "94%", label: "Satisfacci\xF3n" }
  ].map((stat) => <div key={stat.label} className="text-center p-2 rounded-xl backdrop-blur-[2px]">
                <div className="text-xl md:text-2xl font-display font-bold text-foreground">
                  <AnimatedStat value={stat.value} />
                </div>
                <div className="text-lab-text-tertiary text-[10px] font-mono tracking-[0.1em] uppercase mt-1">{stat.label}</div>
              </div>)}
          </div>
        </motion.div>
        </> : <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
            <InteractiveDiagnosticForm email={email} />
          </motion.div>}
      </div>
    </section>;
};
export default HeroSection;
