import { CheckCircle2 } from "lucide-react";

/**
 * ProposalBaseFeatures
 * Feature card grid showcasing base included monthly services.
 */
export default function ProposalBaseFeatures({ baseFeatures = [] }) {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full bg-gray-900 text-white rounded-[2rem] md:rounded-[3rem] !my-8 shadow-2xl relative overflow-hidden font-inter">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400 via-transparent to-transparent" />
      <div className="relative z-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-sora">La Base Estratégica</h2>
          <p className="text-gray-400 text-lg">
            Todos nuestros paquetes integran una base mensual sólida, diseñada para mantener tu marca relevante y estéticamente impecable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {baseFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-start gap-4"
            >
              <CheckCircle2 className="w-6 h-6 text-pink-400 shrink-0" />
              <p className="text-white font-medium text-sm leading-relaxed">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
