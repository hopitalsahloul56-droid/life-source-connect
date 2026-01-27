import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Droplet, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="font-bold text-xl text-foreground">
                {language === 'ar' ? 'تبرع بالحياة' : 'Don de Vie'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.donate}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">+216 73 123 456</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@dondevie.tn</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{language === 'ar' ? 'مستشفى سهلول، سوسة، تونس' : 'Hôpital Sahloul, Sousse, Tunisie'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {language === 'ar' ? 'تبرع بالحياة' : 'Don de Vie'}. {t.footer.rights}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
