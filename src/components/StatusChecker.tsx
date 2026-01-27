import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, CheckCircle, XCircle, Clock, Calendar, Loader2 } from 'lucide-react';

interface DonationStatus {
  status: 'pending' | 'approved' | 'rejected';
  appointment_date: string | null;
}

const StatusChecker = () => {
  const { t, language } = useLanguage();
  const [identityNumber, setIdentityNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DonationStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  const checkStatus = async () => {
    if (!identityNumber.trim()) return;
    
    setIsLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-donation-status', {
        body: { identity_number: identityNumber.trim() }
      });

      if (error) throw error;
      
      if (data?.found) {
        setResult({
          status: data.status,
          appointment_date: data.appointment_date,
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-12 h-12 text-warning" />;
      case 'approved':
        return <CheckCircle className="w-12 h-12 text-success" />;
      case 'rejected':
        return <XCircle className="w-12 h-12 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return t.form.statusPending;
      case 'approved':
        return t.form.statusApproved;
      case 'rejected':
        return t.form.statusRejected;
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 border-warning';
      case 'approved':
        return 'bg-success/10 border-success';
      case 'rejected':
        return 'bg-destructive/10 border-destructive';
      default:
        return '';
    }
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t.form.checkStatus}
              </h2>
              <p className="text-muted-foreground">
                {t.form.enterIdentityNumber}
              </p>
            </div>

            <div className="flex gap-3 mb-6">
              <Input
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="12345678"
                className="text-lg"
                onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
              />
              <Button onClick={checkStatus} disabled={isLoading || !identityNumber.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.form.checkButton
                )}
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`rounded-2xl p-6 border-2 ${getStatusColor(result.status)} animate-scale-in`}>
                <div className="flex flex-col items-center text-center">
                  {getStatusIcon(result.status)}
                  <p className="text-foreground font-medium mt-4">
                    {getStatusMessage(result.status)}
                  </p>
                  {result.status === 'approved' && result.appointment_date && (
                    <div className="mt-4 flex items-center gap-2 text-success">
                      <Calendar className="w-5 h-5" />
                      <span>
                        {t.form.appointmentInfo} {formatDate(result.appointment_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {notFound && (
              <div className="text-center p-4 bg-muted rounded-xl animate-fade-in">
                <p className="text-muted-foreground">{t.form.noRequestFound}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatusChecker;
