import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ValueSection from "@/components/landing/ValueSection";
import FrameworkSection from "@/components/landing/FrameworkSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import OfferSection from "@/components/landing/OfferSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="valor">
        <ValueSection />
      </div>
      <div id="sistema">
        <FrameworkSection />
      </div>
      <div id="resultados">
        <SocialProofSection />
      </div>
      <OfferSection />
      <Footer />
    </div>
  );
};

export default Index;
