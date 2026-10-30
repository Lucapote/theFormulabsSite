import {
  Palette,
  TrendingUp,
  Target,
  Globe,
  GraduationCap,
  UtensilsCrossed,
  Hotel,
  Compass,
  Flame,
  Stethoscope,
  Building2,
  ShoppingBag,
  Briefcase,
  UserCheck,
  Layers,
  User,
  Users,
  Building,
  Clock,
  Smartphone,
  CircleOff,
  Coins,
  Wallet,
  CreditCard,
  Check,
  HelpCircle
} from "lucide-react";

const ICON_MAP = {
  Palette,
  TrendingUp,
  Target,
  Globe,
  GraduationCap,
  UtensilsCrossed,
  Hotel,
  Compass,
  Flame,
  Stethoscope,
  Building2,
  ShoppingBag,
  Briefcase,
  UserCheck,
  Layers,
  User,
  Users,
  Building,
  Clock,
  Smartphone,
  CircleOff,
  Coins,
  Wallet,
  CreditCard
};

function getOptionIcon(iconName) {
  return ICON_MAP[iconName] || HelpCircle;
}

export default function LeadQuestionCard({
  question,
  selectedOption,
  onSelectOption
}) {
  if (!question) return null;

  const isGrid = Boolean(question.isGrid);

  return (
    <div className="w-full bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-7 shadow-xl space-y-3.5 sm:space-y-5 animate-in fade-in-50 duration-200">
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="font-sora text-lg sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 font-inter">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Options: 2-column grid for niche; 1-column list for questions */}
      {isGrid ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const IconComp = getOptionIcon(opt.icon);

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption(opt)}
                className={`group text-left w-full px-2.5 py-2.5 sm:px-3 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-150 flex items-center gap-2 sm:gap-2.5 active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "border-brand-magenta bg-gradient-to-r from-pink-50/70 via-white to-pink-50/20 ring-2 ring-brand-magenta/25 shadow-md shadow-pink-100"
                    : "border-gray-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/25 hover:shadow-xs"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-brand-magenta text-white border-brand-magenta shadow-xs shadow-pink-300"
                      : "bg-blue-50 text-brand-blue border-blue-200/80 group-hover:scale-105"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <span
                  className={`font-sora text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 transition-colors ${
                    isSelected ? "text-gray-900 font-bold" : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const IconComp = getOptionIcon(opt.icon);

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption(opt)}
                className={`group text-left w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "border-brand-magenta bg-gradient-to-r from-pink-50/70 via-white to-pink-50/20 ring-2 ring-brand-magenta/25 shadow-md shadow-pink-100"
                    : "border-gray-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/25 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shrink-0 border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-brand-magenta text-white border-brand-magenta shadow-xs shadow-pink-300"
                        : "bg-blue-50 text-brand-blue border-blue-200/80 group-hover:scale-105"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <span
                    className={`font-sora text-xs sm:text-sm font-semibold leading-snug transition-colors ${
                      isSelected ? "text-gray-900 font-bold" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-brand-magenta border-brand-magenta text-white"
                        : "border-blue-200 text-transparent group-hover:border-blue-400"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
