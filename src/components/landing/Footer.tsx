import logo from "@/assets/logo_formulabs_color.png";

const Footer = () => {
  return (
    <footer className="border-t border-lab-border py-10">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#" className="flex items-center">
            <img src={logo} alt="The Formulab" className="h-6" />
          </a>

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
