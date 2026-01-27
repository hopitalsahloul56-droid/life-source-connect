import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Heart, ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center text-white pt-20">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Heart className="w-5 h-5 text-white animate-pulse" fill="currentColor" />
            <span className="text-sm font-medium text-white">
              {t.stats.liveSaved}: 12,500+
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 hero-text-shadow text-white">
            {t.hero.title}
            <br />
            <span className="text-white/90">{t.hero.titleHighlight}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link to="/donate">
              <Button 
                variant="hero"
                size="lg" 
                className="px-8 py-6 text-lg rounded-full pulse-glow"
              >
                <Heart className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.hero.cta}
              </Button>
            </Link>
            <a href="#about">
              <Button 
                variant="heroOutline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full"
              >
                {t.hero.learnMore}
              </Button>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <a 
          href="#stats" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
        >
          <span className="text-xs font-medium">{isRTL ? 'اكتشف المزيد' : 'Découvrir'}</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
