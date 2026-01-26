import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TermsStep from './TermsStep';
import PersonalInfoStep from './PersonalInfoStep';
import EligibilityStep from './EligibilityStep';
import ResultStep from './ResultStep';
import StepIndicator from './StepIndicator';

export interface DonationFormData {
  firstName: string;
  lastName: string;
  identityNumber: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  bloodType: string;
  address: string;
  eligibilityAnswers: Record<string, boolean>;
  termsAccepted: boolean;
}

const initialFormData: DonationFormData = {
  firstName: '',
  lastName: '',
  identityNumber: '',
  phoneNumber: '',
  email: '',
  dateOfBirth: '',
  bloodType: 'unknown',
  address: '',
  eligibilityAnswers: {},
  termsAccepted: false,
};

// Questions that make the donor ineligible if answered "yes"
const disqualifyingQuestions = ['q1', 'q3', 'q5', 'q6', 'q7', 'q8'];

const DonationForm = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DonationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ eligible: boolean; reason?: string } | null>(null);

  const steps = [
    { number: 1, label: t.form.step1 },
    { number: 2, label: t.form.step2 },
    { number: 3, label: t.form.step3 },
    { number: 4, label: t.form.step4 },
  ];

  const updateFormData = (data: Partial<DonationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const checkEligibility = (): { eligible: boolean; reason?: string } => {
    const answers = formData.eligibilityAnswers;
    
    for (const question of disqualifyingQuestions) {
      if (answers[question] === true) {
        const questionKey = question as keyof typeof t.form;
        const questionText = t.form[questionKey] as string;
        return {
          eligible: false,
          reason: questionText,
        };
      }
    }
    
    return { eligible: true };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const eligibilityResult = checkEligibility();
    setResult(eligibilityResult);

    try {
      const { error } = await supabase.from('donation_requests').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        identity_number: formData.identityNumber,
        phone_number: formData.phoneNumber,
        email: formData.email || null,
        date_of_birth: formData.dateOfBirth,
        blood_type: formData.bloodType as any,
        address: formData.address || null,
        eligibility_answers: formData.eligibilityAnswers,
        is_eligible: eligibilityResult.eligible,
        ineligibility_reason: eligibilityResult.reason || null,
        terms_accepted: formData.termsAccepted,
        terms_accepted_at: new Date().toISOString(),
        status: eligibilityResult.eligible ? 'pending' : 'rejected',
      });

      if (error) {
        console.error('Error submitting donation request:', error);
        toast.error(t.common.error);
        setIsSubmitting(false);
        return;
      }

      nextStep();
    } catch (error) {
      console.error('Error submitting donation request:', error);
      toast.error(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t.form.title}
            </h1>
          </div>

          {/* Step Indicator */}
          {currentStep < 4 && (
            <StepIndicator steps={steps} currentStep={currentStep} />
          )}

          {/* Form Steps */}
          <div className="bg-card rounded-3xl shadow-lg p-6 md:p-8 animate-fade-in">
            {currentStep === 1 && (
              <TermsStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
              />
            )}

            {currentStep === 2 && (
              <PersonalInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {currentStep === 3 && (
              <EligibilityStep
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                onPrev={prevStep}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 4 && result && (
              <ResultStep
                eligible={result.eligible}
                reason={result.reason}
                onGoHome={goHome}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;
