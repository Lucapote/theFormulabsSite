import { toast } from "sonner";
import { TUBE_COLORS, TAG_BG, TAG_TXT } from "@/data/diagnosticData";

export default function ResultCard({ r, i, email }) {
  if (r.locked) {
    const handleCheckEmail = () => {
      toast.info("Enviado a tu correo", {
        description: `El análisis detallado de "${r.label}" se ha enviado a ${email || "tu correo"}.`
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
            Revisar email
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
