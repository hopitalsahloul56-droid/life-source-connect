import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Shield, Clock } from 'lucide-react';

const AboutSection = () => {
  const { t } = useLanguage();

  const reasons = [
    { 
      icon: Heart, 
      title: t.about.reason1.title, 
      description: t.about.reason1.description,
      color: 'bg-primary/10 text-primary'
    },
    { 
      icon: Shield, 
      title: t.about.reason2.title, 
      description: t.about.reason2.description,
      color: 'bg-success/10 text-success'
    },
    { 
      icon: Clock, 
      title: t.about.reason3.title, 
      description: t.about.reason3.description,
      color: 'bg-accent/10 text-accent'
    },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.about.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="card-hover bg-card rounded-2xl p-8 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${reason.color}`}>
                <reason.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {reason.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
