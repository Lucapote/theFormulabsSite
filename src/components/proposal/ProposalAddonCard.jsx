import { CheckCircle2 } from "lucide-react";

/**
 * ProposalAddonCard
 * Subcomponent to render a single addon item (checkbox or radio group).
 */
export default function ProposalAddonCard({
  addon,
  selectedAddons,
  toggleAddon,
  setRadioAddon
}) {
  const isAddonActive =
    addon.type === "checkbox" ? selectedAddons[addon.id] : Boolean(selectedAddons[addon.id]);

  return (
    <div
      className={`bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 transition-all ${
        isAddonActive
          ? "border-brand-magenta/40 bg-gradient-to-r from-pink-50/50 to-white"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {addon.type === "checkbox" ? (
        <div
          className="cursor-pointer flex flex-col md:flex-row gap-4 items-start active:scale-[0.99] transition-transform"
          onClick={() => toggleAddon(addon.id)}
        >
          <div className="flex items-start gap-4 flex-grow">
            <div
              className={`mt-1 w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                selectedAddons[addon.id] ? "bg-brand-magenta border-brand-magenta" : "border-gray-300 bg-white"
              }`}
            >
              {selectedAddons[addon.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1 font-sora">{addon.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{addon.description}</p>
              <span className="inline-block bg-pink-50 text-brand-magenta border border-pink-100 font-bold px-3 py-1 rounded-lg text-sm">
                {addon.priceLabel}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-lg font-bold text-gray-900 font-sora mb-1">{addon.title}</h4>
          <p className="text-sm text-gray-500 mb-4 font-medium">{addon.description}</p>
          <div className="space-y-3">
            {addon.options?.map((opt) => {
              const isSelected = selectedAddons[addon.id] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setRadioAddon(addon.id, opt.id)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                    isSelected
                      ? "bg-pink-50/70 border-brand-magenta/40 shadow-xs"
                      : "bg-gray-50 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? "border-brand-magenta bg-brand-magenta" : "border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                        <span className="font-bold text-gray-900 font-sora">{opt.name}</span>
                        <span className={`font-bold text-sm mt-1 md:mt-0 ${isSelected ? "text-brand-magenta" : "text-gray-500"}`}>
                          {opt.priceLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{opt.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
