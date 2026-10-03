import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-lab-border">
      <nav className="container max-w-5xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main Navigation">
        <a href="#" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="The Formulab" className="h-8 w-auto object-contain" />
        </a>

        <div className="hidden md:flex items-center gap-8 font-inter">
          <a href="#diagnostico" className="text-[13px] font-medium text-lab-text-secondary hover:text-brand-magenta transition-colors">Diagnóstico</a>
          <a href="#protocolo" className="text-[13px] font-medium text-lab-text-secondary hover:text-brand-magenta transition-colors">Protocolo</a>
          <a href="#especialistas" className="text-[13px] font-medium text-lab-text-secondary hover:text-brand-magenta transition-colors">Equipo</a>
          <a href="#casos" className="text-[13px] font-medium text-lab-text-secondary hover:text-brand-magenta transition-colors">Casos</a>
          <Button variant="lab" size="sm" className="px-5 h-9 bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-sm hover:shadow-md font-sora" asChild>
            <a href="#oferta">Solicitar diagnóstico</a>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className="md:hidden bg-background border-b border-lab-border px-6 py-5 space-y-3 font-inter"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            aria-label="Mobile Navigation"
          >
            <a href="#diagnostico" className="block text-sm text-lab-text-secondary hover:text-brand-magenta" onClick={() => setIsOpen(false)}>Diagnóstico</a>
            <a href="#protocolo" className="block text-sm text-lab-text-secondary hover:text-brand-magenta" onClick={() => setIsOpen(false)}>Protocolo</a>
            <a href="#especialistas" className="block text-sm text-lab-text-secondary hover:text-brand-magenta" onClick={() => setIsOpen(false)}>Equipo</a>
            <a href="#casos" className="block text-sm text-lab-text-secondary hover:text-brand-magenta" onClick={() => setIsOpen(false)}>Casos</a>
            <Button variant="lab" size="sm" className="w-full bg-brand-magenta hover:bg-brand-magenta/90 text-white font-sora" asChild>
              <a href="#oferta" onClick={() => setIsOpen(false)}>Solicitar diagnóstico</a>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
