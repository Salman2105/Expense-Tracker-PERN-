import LandingNavbar from "../../../components/landing/LandingNavbar";
import HeroSection from "../../../components/landing/HeroSection";
import FeatureSection from "../../../components/landing/FeatureSection";
import HowItWorksSection from "../../../components/landing/HowItWorksSection";
import DashboardPreviewSection from "../../../components/landing/DashboardPreviewSection";
import AboutSection from "../../../components/landing/AboutSection";
import ComingUpdatesSection from "../../../components/landing/ComingUpdatesSection";
import ContactSection from "../../../components/landing/ContactSection";
import FinalCtaSection from "../../../components/landing/FinalCtaSection";
import LandingFooter from "../../../components/landing/LandingFooter";

function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <LandingNavbar />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <AboutSection />
      <ComingUpdatesSection />
      <ContactSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
