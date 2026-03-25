import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-lab-border">
      <div className="container max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="font-mono text-[10px] font-bold text-primary-foreground">Fx</span>
          </div>
          <span className="font-display font-bold text-foreground tracking-tight text-[15px]">
            formu<span className="text-primary">lab</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#diagnostico" className="text-[13px] text-lab-text-secondary hover:text-foreground transition-colors">Diagnóstico</a>
          <a href="#protocolo" className="text-[13px] text-lab-text-secondary hover:text-foreground transition-colors">Protocolo</a>
          <a href="#casos" className="text-[13px] text-lab-text-secondary hover:text-foreground transition-colors">Casos</a>
          <Button variant="lab" size="sm" className="px-5 h-9">
            Solicitar diagnóstico
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-card border-b border-lab-border px-6 py-5 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#diagnostico" className="block text-sm text-lab-text-secondary" onClick={() => setIsOpen(false)}>Diagnóstico</a>
            <a href="#protocolo" className="block text-sm text-lab-text-secondary" onClick={() => setIsOpen(false)}>Protocolo</a>
            <a href="#casos" className="block text-sm text-lab-text-secondary" onClick={() => setIsOpen(false)}>Casos</a>
            <Button variant="lab" size="sm" className="w-full" onClick={() => setIsOpen(false)}>
              Solicitar diagnóstico
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
