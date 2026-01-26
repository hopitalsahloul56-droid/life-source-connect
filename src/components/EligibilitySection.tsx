import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Heart } from 'lucide-react';

const EligibilitySection = () => {
  const { t } = useLanguage();

  const criteria = [
    t.eligibility.age,
    t.eligibility.weight,
    t.eligibility.health,
    t.eligibility.lastDonation,
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.eligibility.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t.eligibility.subtitle}
            </p>

            <ul className="space-y-4 mb-8">
              {criteria.map((criterion, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-foreground">{criterion}</span>
                </li>
              ))}
            </ul>

            <Link to="/donate">
              <Button size="lg" className="rounded-full px-8">
                <Heart className="w-5 h-5 mr-2" />
                {t.hero.cta}
              </Button>
            </Link>
          </div>

          <div className="relative animate-scale-in">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-16 h-16 text-primary blood-drop" fill="currentColor" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-2">1 = 3</p>
                <p className="text-muted-foreground">
                  {t.about.reason1.description.split('.')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EligibilitySection;
