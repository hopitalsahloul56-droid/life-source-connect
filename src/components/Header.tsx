import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Droplet, Globe } from 'lucide-react';

const Header = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/donate', label: t.nav.donate },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: t.nav.admin });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Droplet className="w-8 h-8 text-primary blood-drop" fill="currentColor" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
            </div>
            <span className="font-bold text-xl text-foreground">
              {language === 'ar' ? 'تبرع بالحياة' : 'Don de Vie'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'fr' ? 'العربية' : 'FR'}</span>
            </Button>

            {user ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                {t.nav.logout}
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
            )}

            <Link to="/donate" className="hidden md:block">
              <Button className="bg-primary hover:bg-primary/90 pulse-glow">
                {t.nav.donate}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setIsMenuOpen(false)}
              className="block mt-4"
            >
              <Button className="w-full bg-primary hover:bg-primary/90">
                {t.nav.donate}
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
