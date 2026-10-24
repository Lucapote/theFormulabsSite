import { useState } from "react";
import {
  FileText,
  DollarSign,
  CheckCircle,
  Copy,
  ChevronRight,
  Sparkles,
  Download
} from "lucide-react";

/**
 * HumanCraftedComponents
 * Catálogo de referencia con implementaciones listas para usar de componentes
 * táctiles bajo la filosofía "Anti-AI Slop".
 */

export function TactileSegmentedControl({ activeTab, onChange }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 gap-1 w-full max-w-sm">
      <button
        type="button"
        onClick={() => onChange("general")}
        className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeTab === "general"
            ? "bg-gray-900 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
        }`}
      >
        <FileText className={`w-3.5 h-3.5 ${activeTab === "general" ? "text-pink-400" : "text-gray-400"}`} />
        <span>General</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("finanzas")}
        className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeTab === "finanzas"
            ? "bg-gray-900 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
        }`}
      >
        <DollarSign className={`w-3.5 h-3.5 ${activeTab === "finanzas" ? "text-brand-blue" : "text-gray-400"}`} />
        <span>Finanzas</span>
      </button>
    </div>
  );
}

export function PrimaryActionButton({ label = "Continuar", onClick, isLoading = false, icon: Icon = CheckCircle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
    >
      <Icon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{isLoading ? "Procesando..." : label}</span>
    </button>
  );
}

export function MobileBottomSheet({ title = "Detalle", subtitle, children, onAction, actionLabel = "Confirmar" }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-md rounded-t-[28px] border-t border-slate-800 p-4 pb-8 shadow-2xl flex flex-col max-h-[70vh]">
      <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-3 cursor-grab shrink-0" />

      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h4 className="font-sora font-bold text-xs text-white uppercase tracking-wider">
            {title}
          </h4>
          {subtitle && (
            <p className="font-inter text-[11px] text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto my-3 pr-1 font-inter text-xs text-slate-300">
        {children}
      </div>

      {onAction && (
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onAction}
            className="w-full h-12 rounded-full bg-brand-magenta hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
