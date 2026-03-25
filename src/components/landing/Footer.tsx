const Footer = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-display font-bold text-sm tracking-tight">
              The Formu<span className="text-primary">lab</span>
            </span>
          </div>

          <nav className="flex items-center gap-5 text-xs text-text-tertiary">
            <a href="#" className="hover:text-text-secondary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Términos</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Contacto</a>
          </nav>

          <p className="text-text-tertiary text-[10px] font-mono tracking-wider">
            © {new Date().getFullYear()} The Formulab
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
