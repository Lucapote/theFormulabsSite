import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-pink-300 group-[.toaster]:border group-[.toaster]:shadow-xl group-[.toaster]:shadow-pink-500/10 group-[.toaster]:rounded-full group-[.toaster]:px-4 group-[.toaster]:py-2.5 font-sora text-xs font-extrabold flex items-center gap-3",
          description: "group-[.toast]:text-gray-500 font-normal",
          actionButton:
            "group-[.toast]:bg-pink-500 group-[.toast]:text-white group-[.toast]:font-sora group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-full",
        },
      }}
      icons={{
        success: (
          <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 text-pink-500">
            <CheckCircle2 className="w-4 h-4 text-pink-500 stroke-[2.5]" />
          </div>
        ),
        error: (
          <div className="w-7 h-7 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500">
            <AlertCircle className="w-4 h-4 text-red-500 stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 text-pink-500">
            <Info className="w-4 h-4 text-pink-500 stroke-[2.5]" />
          </div>
        ),
        warning: (
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-500">
            <AlertTriangle className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 text-pink-500">
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin stroke-[2.5]" />
          </div>
        ),
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

