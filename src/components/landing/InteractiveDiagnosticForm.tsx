import { useState, useEffect, useRef, useId, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: "ingresos", q: "¿Cuáles son los ingresos mensuales aproximados?", opts: ["Menos de $5,000 USD", "$5,000 – $20,000 USD", "$20,000 – $100,000 USD", "Más de $100,000 USD"] },
  { id: "fuente", q: "¿Cuál es la fuente principal de clientes?", opts: ["Ads pagados (Meta, Google, TikTok)", "Orgánico (SEO, redes sociales)", "Referidos / boca a boca", "Outbound / ventas directas"] },
  { id: "problema", q: "¿Cuál es el principal problema percibido?", opts: ["No llegan suficientes prospectos", "Llegan prospectos pero no compran", "Compran una vez y no regresan", "Operaciones caóticas / no escala"] },
  { id: "ticket", q: "¿Cuál es el ticket promedio por cliente?", opts: ["Menos de $100 USD", "$100 – $500 USD", "$500 – $2,000 USD", "Más de $2,000 USD"] },
  { id: "conversion", q: "¿Tienes estimada tu tasa de conversión?", opts: ["Sí, menos del 5%", "Sí, entre 5% y 20%", "Sí, más del 20%", "No la conozco"] },
];

const TUBE_COLORS = ["#7b6cf0", "#4ecdc4", "#f7b731", "#ee5a24", "#6c5ce7"];
const TAG_BG = ["#ede9ff", "#e0e8ff", "#e8f0e8", "#f0ede8", "#f0e8f0"];
const TAG_TXT = ["#6c55e0", "#3a52c0", "#3a6e3a", "#886640", "#885588"];

const PROCESSING = [
  "Indexando variables del sistema…",
  "Detectando restricción principal…",
  "Calculando fuga de ingresos…",
  "Generando Formula Rx™…",
  "Compilando diagnóstico…",
];

export type Answers = Record<string, string>;

interface DiagnosticResult {
  label: string;
  value: string;
  icon: string;
  tag: string;
  locked: boolean;
}

function buildDiagnostic(a: Answers): DiagnosticResult[] {
  const isAds = a.fuente?.includes("Ads");
  const isNoConvert = a.problema?.includes("no compran");
  const isNoTraffic = a.problema?.includes("suficientes");
  const isChurn = a.problema?.includes("regresan");
  const isOps = a.problema?.includes("caóticas");
  const isLow = a.ingresos?.includes("5,000");
  let tipo, restriccion, fuga, oportunidad, urgencia;
  if (isNoConvert && isAds) {
    tipo = "Conversión — falla en el proceso de cierre";
    restriccion = "Gasto en adquisición sin infraestructura de conversión. El sistema financia su propio problema.";
    fuga = isLow ? "$1,800–$3,500/mes en ads no recuperados" : "$4,200–$9,000/mes en oportunidad perdida";
    oportunidad = "Construir un mecanismo de cierre: nurturing + argumento de valor + reducción de fricción en punto de decisión.";
    urgencia = "Crítico — ventana de acción: 2–4 semanas.";
  } else if (isNoTraffic) {
    tipo = "Adquisición — volumen de prospectos insuficiente";
    restriccion = "El sistema no genera suficiente demanda entrante. Sin volumen, no hay conversión posible.";
    fuga = isLow ? "$800–$2,000/mes en potencial no alcanzado" : "$3,500–$8,000/mes en capacidad instalada ociosa";
    oportunidad = "Diversificar fuentes de adquisición y activar canales orgánicos.";
    urgencia = "Alto — el techo de crecimiento permanece bloqueado.";
  } else if (isChurn) {
    tipo = "Retención — ciclo de vida del cliente truncado";
    restriccion = "Opera en modo adquisición permanente sin capitalizar la base existente.";
    fuga = isLow ? "$1,200–$2,800/mes en LTV no capturado" : "$5,000–$12,000/mes en ingresos recurrentes no generados";
    oportunidad = "Implementar seguimiento post-compra y programa de reactivación.";
    urgencia = "Moderado-Alto — impacto compuesto con el tiempo.";
  } else if (isOps) {
    tipo = "Operativo — sistema no escalable";
    restriccion = "El crecimiento está bloqueado por capacidad operativa. Más ventas = más caos.";
    fuga = isLow ? "$900–$2,200/mes en horas-hombre perdidas" : "$4,000–$10,000/mes en ineficiencia acumulada";
    oportunidad = "Mapear y sistematizar procesos críticos antes de escalar.";
    urgencia = "Alto — escalar sin resolver esto destruye valor.";
  } else {
    tipo = "Conversión — proceso de cierre no optimizado";
    restriccion = "El sistema tiene demanda pero no convierte eficientemente.";
    fuga = "$1,500–$4,000/mes en oportunidades no capturadas";
    oportunidad = "Optimizar el proceso de decisión: claridad de oferta + prueba social + reducción de fricción.";
    urgencia = "Moderado-Alto — impacto directo en el próximo ciclo.";
  }
  return [
    { label: "Tipo de problema", value: tipo, icon: "⚗", tag: "Diagnóstico primario", locked: false },
    { label: "Restricción principal", value: restriccion, icon: "🔬", tag: "Punto crítico", locked: false },
    { label: "Fuga de ingresos estimada", value: fuga, icon: "💊", tag: "Cálculo activo", locked: true },
    { label: "Oportunidad de optimización", value: oportunidad, icon: "🧪", tag: "Estrategia", locked: true },
    { label: "Urgencia / Impacto", value: urgencia, icon: "📊", tag: "Índice de impacto", locked: true },
  ];
}

interface TestTubeProps {
  fillPct: number;
  bubbling: boolean;
  color: string;
  height?: number;
}

function TestTube({ fillPct, bubbling, color, height = 200 }: TestTubeProps) {
  const clipId = useId();
  const W = 54;
  const H = height;
  const tubeTop = 400;
  const tubeBottom = 3800;
  const liquidHeight = Math.round((tubeBottom - tubeTop) * (fillPct / 100));
  const liquidY = tubeBottom - liquidHeight;

  const bubbleData = [
    { cx: 600, pct: 0.6, r: 80, dur: 1.2, delay: 0 },
    { cx: 1000, pct: 0.4, r: 60, dur: 1.5, delay: 0.3 },
    { cx: 835, pct: 0.8, r: 100, dur: 0.9, delay: 0.6 },
    { cx: 1200, pct: 0.2, r: 70, dur: 1.3, delay: 0.1 },
    { cx: 500, pct: 0.5, r: 50, dur: 1.1, delay: 0.8 },
  ];

  return (
    <svg
      width={W}
      height={H}
      viewBox="0 0 1670 3900"
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: "visible", animation: bubbling ? "labShake 0.4s ease-in-out 3" : "none" }}
    >
      <defs>
        <clipPath id={`tubeClip-${clipId}`}>
          <path d="M390,420 L1280,420 L1280,3260 C1280,3480 1160,3690 835,3745 C510,3690 390,3480 390,3260 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#tubeClip-${clipId})`}>
        <rect x="335" y={liquidY} width="1006" height={liquidHeight} fill={color} style={{ transition: "y 0.6s ease, height 0.6s ease" }} />
        {bubbling && bubbleData.map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={liquidY + liquidHeight * b.pct}
            r={b.r}
            fill="white"
            opacity="0.45"
            style={{ animation: `labBubble ${b.dur}s ${b.delay}s ease-in infinite` }}
          />
        ))}
      </g>
      <path
        d="M2,198C2,188.621 2,179.243 2.631,168.842C3.842,164.553 4.422,161.287 5.286,157.311C15.926,91.953 51.434,46.058 110.133,18.168C122.27,12.402 135.889,9.759 148.817,5.652C150.574,5.093 153.62,5.547 152,2C609.375,2 1066.75,2 1524.342,2.563C1529.095,4.737 1533.552,6.64 1538.183,7.914C1589.56,22.049 1627.922,52.444 1652.992,99.519C1659.729,112.169 1664.984,125.386 1668.219,139.38C1668.655,141.265 1668.642,144.169 1672,142C1672,168.708 1672,195.417 1671.448,222.344C1669.38,226.102 1667.511,229.536 1666.4,233.2C1649.507,288.869 1614.099,327.874 1560.774,350.77C1535.223,361.741 1508.288,364.711 1480.796,364.339C1476.248,364.278 1471.699,364.331 1466.338,364.331C1466.338,370.209 1466.338,374.811 1466.338,379.413C1466.338,1346.253 1466.34,2313.092 1466.33,3279.932C1466.329,3309.872 1463.949,3339.689 1459.427,3369.234C1448.469,3440.815 1426.146,3508.7 1391.605,3572.475C1354.766,3640.492 1306.961,3699.637 1248.503,3750.259C1197.775,3794.187 1141.487,3829.163 1079.535,3854.841C1034.254,3873.609 987.398,3887.125 938.83,3894.33C928.665,3895.837 918.453,3897.024 908.262,3898.356C905.539,3898.711 905.539,3898.706 904,3902C860.625,3902 817.25,3902 773.646,3901.356C771.375,3899.919 769.394,3898.703 767.281,3898.402C755.129,3896.667 742.864,3895.618 730.788,3893.478C674.879,3883.573 621.006,3867.042 569.716,3842.546C487.153,3803.114 416.32,3748.424 357.432,3678.362C304.127,3614.942 264.801,3543.837 239.723,3464.8C220.487,3404.173 210.483,3342.019 210.47,3278.57C210.265,2312.989 210.328,1347.408 210.328,381.827C210.328,378.828 210.4,375.826 210.305,372.829C210.223,370.266 209.95,367.71 209.7,364.333C205.545,364.333 201.943,364.476 198.355,364.307C185.422,363.7 172.381,363.844 159.583,362.162C113.726,356.133 76.009,334.757 45.993,299.758C24.712,274.946 11.824,246.096 5.905,213.238C4.857,207.547 6.734,201.848 2,198M1231,375.666L335.67,375.666L335.67,390.621C335.67,1352.914 335.676,2315.207 335.637,3277.5C335.636,3304.484 337.975,3331.286 342.498,3357.807C352.191,3414.641 371,3468.373 399.173,3518.772C427.706,3569.816 463.938,3614.674 507.974,3653.059C562.895,3700.933 625.305,3735.482 695.158,3756.515C738.029,3769.423 781.941,3775.904 826.542,3777.529C853.788,3778.522 880.923,3776.05 907.973,3772.422C959.493,3765.512 1008.54,3750.442 1055.279,3727.994C1113.827,3699.874 1165.02,3661.765 1208.904,3613.743C1245.123,3574.107 1274.386,3530.032 1296.656,3481.183C1325.608,3417.679 1341.354,3350.858 1341.383,3281.354C1341.795,2316.395 1341.662,1351.435 1341.662,386.476L1341.662,375.666L1231,375.666M1375,239.673C1408.323,239.673 1441.646,239.761 1474.968,239.611C1483.245,239.574 1491.555,239.11 1499.787,238.248C1521.474,235.978 1540.05,219.762 1546.233,198.414C1556.841,161.785 1527.057,127.403 1492.978,127.459C1256.052,127.845 1019.125,127.663 782.198,127.663C583.259,127.663 384.321,127.658 185.382,127.694C181.069,127.694 176.586,127.48 172.473,128.516C150.221,134.126 135.596,148.151 130.181,170.403C124.611,193.293 132.331,212.169 150.314,227.073C163.168,237.726 178.503,239.662 194.363,239.662C587.242,239.676 980.121,239.673 1375,239.673Z"
        style={{ fill: color, fillRule: "evenodd" }}
      />
    </svg>
  );
}

interface IntakePhaseProps {
  onComplete: (answers: Answers) => void;
}

function IntakePhase({ onComplete }: IntakePhaseProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [key, setKey] = useState(0);

  const fillPct = (step / STEPS.length) * 85;
  const color = TUBE_COLORS[step % TUBE_COLORS.length];
  const cur = STEPS[step];
  const questionRef = useRef<HTMLDivElement>(null);
  const [tubeH, setTubeH] = useState(260);

  useEffect(() => {
    if (!questionRef.current) return;
    const obs = new ResizeObserver(() => {
      if (questionRef.current) {
        setTubeH(questionRef.current.offsetHeight);
      }
    });
    obs.observe(questionRef.current);
    return () => obs.disconnect();
  }, [step]);

  function pick(opt: string) {
    const next = { ...answers, [cur.id]: opt };
    setAnswers(next);
    if (step + 1 >= STEPS.length) {
      setTimeout(() => onComplete(next), 300);
    } else {
      setStep(s => s + 1);
      setKey(k => k + 1);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center relative">


      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, animation: "labFadeUp .4s ease both" }}>
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-display font-bold leading-[1.1] tracking-tight text-foreground">
            Diagnóstico en curso.
            <br />
            <span className="text-gradient">Descubriendo la fórmula.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[54px_1fr] gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-0 items-start">
          {/* Mobile Tube */}
          <div className="flex sm:hidden flex-col items-center">
            <TestTube fillPct={fillPct} bubbling={false} color={color} height={tubeH} />
          </div>

          {/* Progress bar */}
          <div className="w-full sm:col-start-2 sm:row-start-1" key={`prog-${key}`}>
            <div className="mb-2 sm:mb-5">
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{
                      height: 3, borderRadius: 2,
                      background: i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-border)",
                      transition: "background .3s"
                    }} />
                    <span className="font-mono" style={{
                      fontSize: 8, letterSpacing: ".04em", textTransform: "uppercase",
                      color: i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-text-tertiary)",
                      transition: "color .3s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{s.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Tube */}
          <div className="hidden sm:flex flex-col items-center pt-1 sm:col-start-1 sm:row-start-2">
            <TestTube fillPct={fillPct} bubbling={false} color={color} height={tubeH} />
          </div>

          {/* Question */}
          <div className="w-full min-w-0 sm:col-start-2 sm:row-start-2" ref={questionRef} key={`q-${key}`}>
              <h2 className="text-foreground" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.35, marginBottom: 18 }}>{cur.q}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {cur.opts.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    className="bg-background border border-lab-border text-foreground hover:bg-muted"
                    style={{ textAlign: "left", borderRadius: 10, padding: "11px 14px", cursor: "pointer", fontSize: 13, transition: "all .15s", display: "flex", alignItems: "center", gap: 10, animation: `labFadeUp .3s ease ${i * 60}ms both` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ""; }}
                  >
                    <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", minWidth: 14 }}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

interface BoilingPhaseProps {
  answers: Answers;
  onComplete: () => void;
}

function BoilingPhase({ answers, onComplete }: BoilingPhaseProps) {
  const [prog, setProg] = useState(0);
  const [stageI, setStageI] = useState(0);
  const color = "#7b6cf0";

  useEffect(() => {
    const iv = setInterval(() => {
      setProg(p => {
        const next = p + 2;
        setStageI(Math.min(Math.floor(next / 20), PROCESSING.length - 1));
        if (next >= 100) { clearInterval(iv); setTimeout(onComplete, 500); }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "labFadeUp .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: "labPulse 1.5s infinite" }} />
          <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".14em", textTransform: "uppercase" }}>The Formulab™</span>
        </div>
        <div style={{ display: "inline-block", marginBottom: 20 }}>
          <TestTube fillPct={85} bubbling={true} color={color} />
        </div>
        <h2 className="text-foreground" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6 }}>
          Analizando muestra<span style={{ animation: "labBlink 1s step-end infinite", color }}>_</span>
        </h2>
        <p className="font-mono" style={{ fontSize: 11, color: "var(--lab-text-tertiary)", letterSpacing: ".06em", marginBottom: 28 }}>{PROCESSING[stageI]}</p>
        <div className="bg-muted" style={{ width: 280, margin: "0 auto", height: 3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: color, width: prog + "%", transition: "width .2s linear", borderRadius: 2 }} />
        </div>
        <p className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", marginTop: 8 }}>{prog}%</p>
      </div>
    </div>
  );
}

interface ResultCardProps {
  r: DiagnosticResult;
  i: number;
  email: string;
}

function ResultCard({ r, i, email }: ResultCardProps) {
  if (r.locked) {
    const handleCheckEmail = () => {
      toast.info("Enviado a tu correo", {
        description: `El análisis detallado de "${r.label}" se ha enviado a ${email || "tu correo"}.`,
      });
    };

    return (
      <div className="bg-background border border-lab-border" style={{ borderRadius: 10, marginBottom: 8, position: "relative", overflow: "hidden", animation: `labFadeUp .4s ease ${i * 100}ms both` }}>
        <div style={{ filter: "blur(4px)", padding: "16px 18px", userSelect: "none", pointerEvents: "none" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>{r.icon}</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".08em", textTransform: "uppercase" }}>{r.label}</span>
          </div>
          <p className="text-foreground" style={{ fontSize: 13, lineHeight: 1.45, marginBottom: 8 }}>{r.value}</p>
          <span className="font-mono" style={{ fontSize: 9, background: TAG_BG[i], color: TAG_TXT[i], padding: "3px 8px", borderRadius: 4 }}>{r.tag}</span>
        </div>
        <div className="bg-background/80 backdrop-blur-[1px]" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            onClick={handleCheckEmail}
            className="font-mono bg-background text-lab-text-secondary border border-lab-border hover:border-primary hover:text-primary transition-all duration-200"
            style={{ fontSize: 10, borderRadius: 6, padding: "7px 18px", cursor: "pointer", letterSpacing: ".06em" }}
          >
            Revisar email ✉
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-background border border-lab-border" style={{ borderLeft: `4px solid ${TUBE_COLORS[i % TUBE_COLORS.length]}`, borderRadius: 10, padding: "16px 18px", marginBottom: 8, animation: `labFadeUp .4s ease ${i * 100}ms both` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{r.icon}</span>
        <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-secondary)", letterSpacing: ".08em", textTransform: "uppercase" }}>{r.label}</span>
      </div>
      <p className="text-foreground" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8, fontWeight: 500 }}>{r.value}</p>
      <span className="font-mono" style={{ fontSize: 9, background: TAG_BG[i], color: TAG_TXT[i], padding: "3px 8px", borderRadius: 4 }}>{r.tag}</span>
    </div>
  );
}

interface ResultPhaseProps {
  answers: Answers;
  onReset: () => void;
  email: string;
}

function ResultPhase({ answers, onReset, email }: ResultPhaseProps) {
  const [ctaSent, setCtaSent] = useState(false);
  const results = buildDiagnostic(answers);

  const handleCta = () => {
    setCtaSent(true);
    setTimeout(() => {
      window.open(`https://calendly.com/theformulab-io/30min?email=${encodeURIComponent(email)}`, "_blank");
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 620, margin: "0 auto" }}>
        <div className="bg-background border border-lab-border" style={{ borderRadius: 16, padding: "24px 26px", marginBottom: 10, animation: "labFadeUp .5s ease both", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: .08, pointerEvents: "none" }}>
            <TestTube fillPct={100} bubbling={false} color="#7b6cf0" />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7b6cf0", animation: "labPulse 2.5s infinite" }} />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".14em", textTransform: "uppercase" }}>The Formulab™</span>
            </div>
            <button onClick={onReset} className="font-mono text-lab-text-tertiary hover:text-foreground" style={{ fontSize: 9, background: "none", border: "none", cursor: "pointer", letterSpacing: ".08em", transition: "color .2s" }}>
              ↺ NUEVO DIAGNÓSTICO
            </button>
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".1em", marginBottom: 8, textTransform: "uppercase" }}>Análisis completado · Reacción positiva detectada</div>
          <h1 className="text-foreground" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.2, marginBottom: 16 }}>
            Compuesto activo<br /><span style={{ color: "#7b6cf0" }}>identificado.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.values(answers).map((v, i) => (
              <span key={i} className="font-mono bg-muted border border-lab-border text-lab-text-secondary" style={{ fontSize: 10, borderRadius: 5, padding: "3px 9px" }}>{v}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px", animation: "labFadeUp .5s ease .2s both" }}>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
          <span className="font-mono" style={{ fontSize: 9, color: "var(--lab-text-tertiary)", letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>5 variables procesadas</span>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
        </div>

        {results.map((r, i) => (
          <ResultCard key={i} r={r} i={i} email={email} />
        ))}

        <div className="bg-background border border-lab-border" style={{ borderRadius: 12, padding: 24, textAlign: "center", marginTop: 16, animation: "labFadeUp .5s ease .8s both" }}>
          <p className="text-lab-text-secondary" style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 16 }}>
            Hemos identificado ineficiencias claras en tu sistema.<br />
            Desbloquea el diagnóstico completo y tu <strong style={{ color: "#7b6cf0", fontWeight: 500 }}>Formula Rx™</strong>.
          </p>
          <button
            onClick={handleCta}
            className={`font-mono text-[11px] rounded-[7px] px-[26px] py-[10px] cursor-pointer tracking-[0.06em] transition-all border ${ctaSent ? 'border-[#7b6cf0] text-[#7b6cf0]' : 'border-lab-border text-foreground hover:border-[#7b6cf0] hover:text-[#7b6cf0] bg-background'}`}
          >
            {ctaSent ? "✓ Redirigiendo al estratega..." : "Ver diagnóstico completo →"}
          </button>
          {ctaSent && <p className="font-mono" style={{ fontSize: 10, color: "#7b6cf0", marginTop: 10 }}>Un estratega revisará tu caso en las próximas 24h.</p>}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span className="font-mono" style={{ fontSize: 9, color: "var(--lab-text-tertiary)", letterSpacing: ".1em" }}>THE FORMULAB™ · SISTEMA DE DIAGNÓSTICO v2.1</span>
        </div>
      </div>
    </div>
  );
}

interface EmailPhaseProps {
  onComplete: (email: string) => void;
}

function EmailPhase({ onComplete }: EmailPhaseProps) {
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    onComplete(emailInput);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, animation: "labFadeUp .4s ease both" }}>
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-display font-bold leading-[1.1] tracking-tight text-foreground">
            Análisis listo.
            <br />
            <span className="text-gradient">Ingresa tu email.</span>
          </h2>
          <p className="text-lab-text-secondary text-sm mt-3 leading-relaxed">
            Tu diagnóstico y recomendación clínica están preparados. Ingresa tu correo para compilar y revelar los resultados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[54px_1fr] gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-0 items-center">
          {/* Test Tube decoration */}
          <div className="flex flex-col items-center">
            <TestTube fillPct={85} bubbling={false} color="#7b6cf0" height={180} />
          </div>

          <div className="w-full min-w-0">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl bg-background border border-lab-border">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 h-11 px-4 rounded-lg bg-card border-0 text-foreground placeholder:text-lab-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <Button type="submit" variant="lab" className="h-11 px-6 shrink-0">
                Ver Resultados
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </form>
            <p className="text-lab-text-tertiary text-[10px] mt-3 font-mono tracking-[0.1em] text-center sm:text-left">
              Plazas limitadas este mes · Respuesta en 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InteractiveDiagnosticFormProps {
  email?: string;
}

export default function InteractiveDiagnosticForm({ email: initialEmail }: InteractiveDiagnosticFormProps) {
  const [phase, setPhase] = useState<"intake" | "email" | "boiling" | "result">("intake");
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState(initialEmail || "");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  return (
    <div className="w-full flex justify-center mt-8 relative z-10 min-h-[400px]">
      {phase === "intake" && (
        <IntakePhase
          onComplete={(a) => {
            setAnswers(a);
            if (email) {
              setPhase("boiling");
            } else {
              setPhase("email");
            }
          }}
        />
      )}
      {phase === "email" && (
        <EmailPhase
          onComplete={(capturedEmail) => {
            setEmail(capturedEmail);
            setPhase("boiling");
          }}
        />
      )}
      {phase === "boiling" && (
        <BoilingPhase answers={answers} onComplete={() => setPhase("result")} />
      )}
      {phase === "result" && (
        <ResultPhase
          answers={answers}
          onReset={() => {
            setAnswers({});
            setPhase("intake");
            if (!initialEmail) {
              setEmail("");
            }
          }}
          email={email}
        />
      )}
    </div>
  );
}
