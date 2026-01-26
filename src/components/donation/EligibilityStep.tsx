import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DonationFormData } from './DonationForm';
import { ClipboardCheck, ArrowLeft, Send, Loader2 } from 'lucide-react';

interface EligibilityStepProps {
  formData: DonationFormData;
  updateFormData: (data: Partial<DonationFormData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14'];

const EligibilityStep = ({ formData, updateFormData, onSubmit, onPrev, isSubmitting }: EligibilityStepProps) => {
  const { t, isRTL } = useLanguage();

  const handleAnswerChange = (questionId: string, value: string) => {
    updateFormData({
      eligibilityAnswers: {
        ...formData.eligibilityAnswers,
        [questionId]: value === 'yes',
      },
    });
  };

  const allAnswered = questions.every(
    (q) => formData.eligibilityAnswers[q] !== undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-primary">
        <ClipboardCheck className="w-6 h-6" />
        <h2 className="text-xl font-semibold">{t.form.step3}</h2>
      </div>

      <div className="space-y-6">
        {questions.map((questionId, index) => {
          const questionKey = questionId as keyof typeof t.form;
          const questionText = t.form[questionKey] as string;
          const answer = formData.eligibilityAnswers[questionId];

          return (
            <div
              key={questionId}
              className="p-4 rounded-xl bg-secondary/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="font-medium text-foreground mb-3">
                {index + 1}. {questionText}
              </p>
              <RadioGroup
                value={answer === undefined ? '' : answer ? 'yes' : 'no'}
                onValueChange={(value) => handleAnswerChange(questionId, value)}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id={`${questionId}-yes`} />
                  <Label htmlFor={`${questionId}-yes`} className="cursor-pointer">
                    {t.form.yes}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id={`${questionId}-no`} />
                  <Label htmlFor={`${questionId}-no`} className="cursor-pointer">
                    {t.form.no}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          size="lg"
          className="rounded-full px-8"
          disabled={isSubmitting}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t.form.previous}
        </Button>
        <Button
          onClick={onSubmit}
          size="lg"
          className="rounded-full px-8"
          disabled={!allAnswered || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t.form.submit}
        </Button>
      </div>
    </div>
  );
};

export default EligibilityStep;
