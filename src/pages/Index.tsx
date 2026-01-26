import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import AboutSection from '@/components/AboutSection';
import EligibilitySection from '@/components/EligibilitySection';
import StatusChecker from '@/components/StatusChecker';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StatusChecker />
        <StatsSection />
        <AboutSection />
        <EligibilitySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
