const Footer = () => {
  return (
    <footer className="border-t border-lab-border py-10 bg-background font-inter">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="The Formulab" className="h-6 w-auto object-contain" />
          </a>

          <nav className="flex items-center gap-6 text-[12px] font-medium text-lab-text-tertiary">
            <a href="#" className="hover:text-brand-magenta transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-magenta transition-colors">Términos</a>
            <a href="#" className="hover:text-brand-magenta transition-colors">Contacto</a>
          </nav>

          <p className="text-lab-text-tertiary text-[10px] font-mono tracking-[0.1em]">
            © {new Date().getFullYear()} Formulab. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
