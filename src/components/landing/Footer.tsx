const Footer = () => {
  return (
    <footer className="border-t border-lab-border py-10">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <span className="font-mono text-[7px] font-bold text-primary-foreground">Fx</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-foreground">
              formu<span className="text-primary">lab</span>
            </span>
          </div>

          <nav className="flex items-center gap-5 text-[11px] text-lab-text-tertiary">
            <a href="#" className="hover:text-lab-text-secondary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-lab-text-secondary transition-colors">Términos</a>
            <a href="#" className="hover:text-lab-text-secondary transition-colors">Contacto</a>
          </nav>

          <p className="text-lab-text-tertiary text-[10px] font-mono tracking-[0.1em]">
            © {new Date().getFullYear()} Formulab
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
