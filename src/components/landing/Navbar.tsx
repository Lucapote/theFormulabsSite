import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display font-bold text-lg tracking-tight">
          The Formula <span className="text-primary">B</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#valor" className="text-sm text-text-secondary hover:text-foreground transition-colors">Valor</a>
          <a href="#sistema" className="text-sm text-text-secondary hover:text-foreground transition-colors">Sistema</a>
          <a href="#resultados" className="text-sm text-text-secondary hover:text-foreground transition-colors">Resultados</a>
          <Button variant="hero" size="sm" className="px-5">
            Únete
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-background border-b border-border px-6 py-6 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#valor" className="block text-sm text-text-secondary" onClick={() => setIsOpen(false)}>Valor</a>
            <a href="#sistema" className="block text-sm text-text-secondary" onClick={() => setIsOpen(false)}>Sistema</a>
            <a href="#resultados" className="block text-sm text-text-secondary" onClick={() => setIsOpen(false)}>Resultados</a>
            <Button variant="hero" size="sm" className="w-full">Únete</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
