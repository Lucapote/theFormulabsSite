import { HeartHandshake, Sparkles, Info, Phone, Mail, Instagram } from "lucide-react";

/**
 * ProposalWhyUsAndConditions
 * Renders the "Why Us" list, agency conditions box, and contact CTA banner.
 */
export default function ProposalWhyUsAndConditions({
  whyUs = [],
  conditions = [],
  contact = {}
}) {
  return (
    <>
      {/* Why Us & Conditions */}
      <section className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full font-inter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <HeartHandshake className="w-8 h-8 text-pink-500" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight font-sora">
                ¿Por qué nosotros?
              </h2>
            </div>
            <div className="space-y-6">
              {whyUs.map((reason, idx) => (
                <div key={idx} className="flex items-start bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="bg-pink-100 p-2 rounded-xl mr-4 shrink-0">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed mt-1">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <Info className="w-8 h-8 text-gray-400" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight font-sora">
                Condiciones
              </h2>
            </div>
            <div className="bg-gray-100 p-8 md:p-10 rounded-[2rem] h-full border border-gray-200">
              <ul className="space-y-5">
                {conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start text-gray-600">
                    <span className="text-pink-500 mr-3 font-bold text-lg mt-0.5">•</span>
                    <span className="leading-relaxed font-medium">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <section className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full text-center pb-32 lg:pb-24 font-inter">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight font-sora">
            ¿Listos para empezar?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            No hay prisa por decidir, preferimos que elijan el paquete que de verdad tenga sentido para su marca en este momento. Si tienen dudas, aquí estamos.
          </p>

          <div className="bg-gray-900 text-white rounded-[2rem] p-10 md:p-12 shadow-2xl relative overflow-hidden inline-block w-full">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-[80px] pointer-events-none" />

            <h3 className="text-3xl font-bold mb-2 relative z-10 font-sora">{contact.name || "The Formulab"}</h3>
            <p className="text-pink-400 font-bold tracking-widest uppercase text-xs mb-8 relative z-10 font-sora">
              {contact.title || "Dirección de Estrategia"}
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-gray-300 relative z-10">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/-/g, "")}`}
                  className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full"
                >
                  <Phone className="w-4 h-4 mr-2 text-pink-400" />
                  <span className="font-medium text-sm">{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full"
                >
                  <Mail className="w-4 h-4 mr-2 text-pink-400" />
                  <span className="font-medium text-sm">{contact.email}</span>
                </a>
              )}
              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full"
                >
                  <Instagram className="w-4 h-4 mr-2 text-pink-400" />
                  <span className="font-medium text-sm">{contact.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
