import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display font-bold tracking-tight">
            The Formu<span className="text-primary">lab</span>
          </span>
        </a>

        {/* Desktop — minimal nav, one CTA */}
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-xs text-text-tertiary tracking-wider">
            diagnóstico gratuito
          </span>
          <Button variant="hero" size="sm" className="px-5">
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
            className="md:hidden bg-background border-b border-border px-6 py-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button variant="hero" size="sm" className="w-full" onClick={() => setIsOpen(false)}>
              Solicitar diagnóstico gratuito
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
