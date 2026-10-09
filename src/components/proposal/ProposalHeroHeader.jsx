/**
 * ProposalHeroHeader
 * Hero welcome header section for ProposalView.
 */
export default function ProposalHeroHeader({ clientData, showSecondText = false }) {
  return (
    <section className="py-12 md:py-20 px-5 md:px-8 max-w-6xl mx-auto w-full font-inter">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

        <p className="text-pink-500 font-bold tracking-widest uppercase text-xs mb-3 font-sora">
          {clientData.proposalTitle}
        </p>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight font-sora">
          Hola, <span className="text-brand-blue font-sora">{clientData.name}</span>
        </h1>

        <div className="space-y-5">
          <p className="text-base md:text-lg font-normal text-gray-700 leading-relaxed">
            {clientData.greeting}
          </p>

          <div
            className={`h-1 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full transition-all duration-700 ease-out ${
              showSecondText ? "w-20 opacity-100" : "w-0 opacity-0"
            }`}
          />

          <div
            className={`grid transition-all duration-1000 ease-in-out ${
              showSecondText ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-base md:text-lg font-normal text-gray-700 leading-relaxed pt-1">
                {clientData.vision}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
