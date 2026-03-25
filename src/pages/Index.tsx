import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ValueSection from "@/components/landing/ValueSection";
import FrameworkSection from "@/components/landing/FrameworkSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import OfferSection from "@/components/landing/OfferSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="lab-divider max-w-4xl mx-auto" />
      <ValueSection />
      <div className="lab-divider max-w-4xl mx-auto" />
      <FrameworkSection />
      <div className="lab-divider max-w-4xl mx-auto" />
      <SocialProofSection />
      <div className="lab-divider max-w-4xl mx-auto" />
      <OfferSection />
      <Footer />
    </main>
  );
};

export default Index;
