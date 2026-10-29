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
      <div className="bg-background border border-lab-border rounded-xl mb-2 relative overflow-hidden animate-fade-in">
        <div className="blur-[4px] p-4 sm:p-4.5 select-none pointer-events-none">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">{r.icon}</span>
            <span className="font-mono text-[10px] text-lab-text-tertiary tracking-wider uppercase">
              {r.label}
            </span>
          </div>
          <p className="text-foreground text-[13px] leading-relaxed mb-2">
            {r.value}
          </p>
          <span
            className={`font-mono text-[9px] px-2 py-0.5 rounded ${
              i % 2 === 0 ? "bg-brand-magenta/15 text-brand-magenta" : "bg-brand-blue/15 text-brand-blue"
            }`}
          >
            {r.tag}
          </span>
        </div>
        <div className="bg-background/80 backdrop-blur-[1px] absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={handleCheckEmail}
            className="font-mono bg-background text-lab-text-secondary border border-lab-border hover:border-primary hover:text-primary transition-all duration-200 text-[10px] rounded-md px-4 py-1.5 cursor-pointer tracking-wider"
          >
            Revisar email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-background border border-lab-border border-l-4 rounded-xl p-4 sm:p-4.5 mb-2 animate-fade-in ${
        i % 2 === 0 ? "border-l-brand-magenta" : "border-l-brand-blue"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{r.icon}</span>
        <span className="font-mono text-[10px] text-lab-text-secondary tracking-wider uppercase">
          {r.label}
        </span>
      </div>
      <p className="text-foreground text-[13px] leading-relaxed mb-2 font-medium">
        {r.value}
      </p>
      <span
        className={`font-mono text-[9px] px-2 py-0.5 rounded ${
          i % 2 === 0 ? "bg-brand-magenta/15 text-brand-magenta" : "bg-brand-blue/15 text-brand-blue"
        }`}
      >
        {r.tag}
      </span>
    </div>
  );
}
