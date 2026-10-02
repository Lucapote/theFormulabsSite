import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ClientsSection from "@/components/landing/ClientsSection";
import ValueSection from "@/components/landing/ValueSection";
import FrameworkSection from "@/components/landing/FrameworkSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import SpecialistsSection from "@/components/landing/SpecialistsSection";
import OfferSection from "@/components/landing/OfferSection";
import Footer from "@/components/landing/Footer";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <ClientsSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <ValueSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <FrameworkSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <SpecialistsSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <SocialProofSection />
        <hr className="lab-divider max-w-4xl mx-auto border-0" aria-hidden="true" />
        <OfferSection />
      </main>
      <Footer />
    </div>;
};
export default Index;
