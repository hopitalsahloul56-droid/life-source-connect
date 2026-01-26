import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ResultStepProps {
  eligible: boolean;
  reason?: string;
  identityNumber: string;
  onGoHome: () => void;
}

const ResultStep = ({ eligible, reason, identityNumber, onGoHome }: ResultStepProps) => {
  const { t } = useLanguage();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(identityNumber);
    toast.success('Copié !');
  };

  return (
    <div className="text-center py-8 animate-scale-in">
      {eligible ? (
        <>
          <div className="w-24 h-24 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {t.form.successTitle}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {t.form.successMessage}
          </p>
          
          {/* Donation Number Display */}
          <div className="bg-primary/10 rounded-2xl p-6 mb-6 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">{t.form.yourDonationNumber}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-primary font-mono">{identityNumber}</span>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {t.form.trackStatusInfo}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-24 h-24 mx-auto mb-6 bg-destructive/20 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {t.form.ineligibleTitle}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t.form.ineligibleMessage}
          </p>
          {reason && (
            <div className="bg-destructive/10 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{t.form.ineligibleReason}</span>
                <br />
                {reason}
              </p>
            </div>
          )}
        </>
      )}

      <Button
        onClick={onGoHome}
        size="lg"
        variant={eligible ? 'default' : 'outline'}
        className="rounded-full px-8"
      >
        <Home className="w-4 h-4 mr-2" />
        {t.form.backHome}
      </Button>
    </div>
  );
};

export default ResultStep;
