import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Users, Calendar, Building } from 'lucide-react';

const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Heart, value: '12,500+', label: t.stats.liveSaved, color: 'text-primary' },
    { icon: Users, value: '8,200+', label: t.stats.donors, color: 'text-accent' },
    { icon: Calendar, value: '450+', label: t.stats.donations, color: 'text-success' },
    { icon: Building, value: '15', label: t.stats.centers, color: 'text-warning' },
  ];

  return (
    <section id="stats" className="py-16 bg-warm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
