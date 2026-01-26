import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DonationFormData } from './DonationForm';
import { FileText, ArrowRight } from 'lucide-react';

interface TermsStepProps {
  formData: DonationFormData;
  updateFormData: (data: Partial<DonationFormData>) => void;
  onNext: () => void;
}

const TermsStep = ({ formData, updateFormData, onNext }: TermsStepProps) => {
  const { t, isRTL } = useLanguage();

  const handleAcceptChange = (checked: boolean) => {
    updateFormData({ termsAccepted: checked });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-primary">
        <FileText className="w-6 h-6" />
        <h2 className="text-xl font-semibold">{t.form.termsTitle}</h2>
      </div>

      <ScrollArea className="h-64 rounded-xl border border-border bg-muted/30 p-4">
        <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
          {t.form.termsContent}
        </div>
      </ScrollArea>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
        <Checkbox
          id="terms"
          checked={formData.termsAccepted}
          onCheckedChange={handleAcceptChange}
          className="mt-1"
        />
        <label
          htmlFor="terms"
          className="text-sm text-foreground cursor-pointer leading-relaxed"
        >
          {t.form.acceptTerms}
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!formData.termsAccepted}
          size="lg"
          className="rounded-full px-8"
        >
          {t.form.next}
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
        </Button>
      </div>
    </div>
  );
};

export default TermsStep;
