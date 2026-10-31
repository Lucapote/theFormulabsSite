import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import NotificationCenterPopover from "@/components/dashboard/common/NotificationCenterPopover";

/**
 * DashboardHeader
 * Top navigation bar with branding, notification popover, and user account actions.
 */
export default function DashboardHeader({
  user,
  onLogout,
  onOpenBankModal,
  onNavigateTab,
  onNavigateToCalendar
}) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs py-2">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="The Formulab" className="h-9 w-auto object-contain" />
          </a>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <NotificationCenterPopover
            onNavigateTab={onNavigateTab}
            onNavigateToCalendar={onNavigateToCalendar}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center h-10 px-3.5 sm:px-4 rounded-full text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs gap-2 transition-all cursor-pointer outline-hidden focus:ring-2 focus:ring-[#188ff0]/20 active:scale-[0.98]"
              >
                <User className="w-3.5 h-3.5 text-brand-magenta shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{user?.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border border-gray-100 shadow-xl bg-white font-inter">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Cuenta Conectada</span>
                <span className="text-xs font-semibold text-gray-800 truncate block">{user?.email}</span>
              </div>
              <DropdownMenuItem
                onClick={onOpenBankModal}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-sora font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-[#188ff0]" />
                <span>Datos Bancarios</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
              <DropdownMenuItem
                onClick={onLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-sora font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

