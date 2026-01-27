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
  termsAccepted: false
};

// Questions that make the donor ineligible if answered "yes"
const disqualifyingQuestions = ['q1', 'q3', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14'];

// Proper explanations for each disqualifying question
const ineligibilityReasons: Record<string, { fr: string; ar: string }> = {
  q1: {
    fr: "Vous avez été malade récemment. Veuillez attendre votre rétablissement complet avant de donner votre sang.",
    ar: "لقد كنت مريضًا مؤخرًا. يرجى الانتظار حتى تتعافى تمامًا قبل التبرع بالدم."
  },
  q3: {
    fr: "Vous avez subi une intervention chirurgicale au cours des 6 derniers mois. Veuillez attendre la période de récupération complète.",
    ar: "لقد خضعت لعملية جراحية خلال الأشهر الستة الماضية. يرجى الانتظار حتى تنتهي فترة التعافي."
  },
  q5: {
    fr: "Les tatouages ou piercings récents (moins de 12 mois) présentent un risque d'infection. Veuillez attendre 12 mois après la procédure.",
    ar: "الوشوم أو الثقوب الحديثة (أقل من 12 شهرًا) تشكل خطر العدوى. يرجى الانتظار 12 شهرًا بعد الإجراء."
  },
  q6: {
    fr: "Les femmes enceintes ou ayant accouché récemment ne peuvent pas donner leur sang pour des raisons de santé.",
    ar: "لا يمكن للنساء الحوامل أو اللواتي ولدن مؤخرًا التبرع بالدم لأسباب صحية."
  },
  q7: {
    fr: "La consommation d'alcool récente affecte la qualité du sang. Veuillez attendre 24 heures.",
    ar: "استهلاك الكحول الحديث يؤثر على جودة الدم. يرجى الانتظار 24 ساعة."
  },
  q8: {
    fr: "La fièvre récente peut indiquer une infection. Veuillez attendre votre rétablissement complet.",
    ar: "الحمى الأخيرة قد تشير إلى وجود عدوى. يرجى الانتظار حتى تتعافى تمامًا."
  },
  q9: {
    fr: "Vous devez attendre au moins 2 mois entre chaque don de sang pour permettre à votre corps de récupérer.",
    ar: "يجب عليك الانتظار شهرين على الأقل بين كل تبرع بالدم للسماح لجسمك بالتعافي."
  },
  q10: {
    fr: "Le poids minimum requis pour donner son sang est de 50 kg pour votre sécurité.",
    ar: "الوزن الأدنى المطلوب للتبرع بالدم هو 50 كجم لسلامتك."
  },
  q11: {
    fr: "L'âge requis pour donner son sang est entre 18 et 65 ans.",
    ar: "العمر المطلوب للتبرع بالدم هو بين 18 و 65 سنة."
  },
  q12: {
    fr: "Les problèmes cardiaques ou l'hypertension non contrôlée contre-indiquent le don de sang.",
    ar: "مشاكل القلب أو ارتفاع ضغط الدم غير المسيطر عليه يمنعان التبرع بالدم."
  },
  q13: {
    fr: "Le diabète sous insuline est une contre-indication au don de sang.",
    ar: "مرض السكري الذي يتطلب الأنسولين يمنع التبرع بالدم."
  },
  q14: {
    fr: "Un antécédent de VIH, hépatite B ou C est une contre-indication permanente au don de sang.",
    ar: "تاريخ الإصابة بفيروس نقص المناعة أو التهاب الكبد B أو C يمنع التبرع بالدم بشكل دائم."
  }
};

const DonationForm = () => {
  const {
    t,
    language
  } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DonationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    eligible: boolean;
    reason?: string;
  } | null>(null);
  const steps = [{
    number: 1,
    label: t.form.step1
  }, {
    number: 2,
    label: t.form.step2
  }, {
    number: 3,
    label: t.form.step3
  }, {
    number: 4,
    label: t.form.step4
  }];
  const updateFormData = (data: Partial<DonationFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
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
  const checkEligibility = (): {
    eligible: boolean;
    reason?: string;
  } => {
    const answers = formData.eligibilityAnswers;
    for (const question of disqualifyingQuestions) {
      if (answers[question] === true) {
        const reasonObj = ineligibilityReasons[question];
        const reason = language === 'ar' ? reasonObj.ar : reasonObj.fr;
        return {
          eligible: false,
          reason
        };
      }
    }
    return {
      eligible: true
    };
  };
  const checkExistingPendingRequest = async (): Promise<boolean> => {
    const { data, error } = await supabase
      .from('donation_requests')
      .select('id, status, appointment_date')
      .eq('identity_number', formData.identityNumber)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      console.error('Error checking existing request:', error);
      return false;
    }

    if (data) {
      toast.error(t.form.pendingRequestExists);
      return true;
    }

    // Check for approved requests with future appointment dates
    const { data: approvedData, error: approvedError } = await supabase
      .from('donation_requests')
      .select('id, appointment_date')
      .eq('identity_number', formData.identityNumber)
      .eq('status', 'approved')
      .not('appointment_date', 'is', null);

    if (approvedError) {
      console.error('Error checking approved requests:', approvedError);
      return false;
    }

    if (approvedData && approvedData.length > 0) {
      const now = new Date();
      const hasFutureAppointment = approvedData.some(req => {
        if (req.appointment_date) {
          return new Date(req.appointment_date) > now;
        }
        return false;
      });

      if (hasFutureAppointment) {
        toast.error(t.form.appointmentPending);
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Check for existing pending request with same CIN
    const hasExisting = await checkExistingPendingRequest();
    if (hasExisting) {
      setIsSubmitting(false);
      return;
    }

    const eligibilityResult = checkEligibility();
    setResult(eligibilityResult);
    try {
      const {
        error
      } = await supabase.from('donation_requests').insert({
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
        status: eligibilityResult.eligible ? 'pending' : 'rejected'
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
  return <div className="min-h-screen pt-20 pb-12 bg-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-destructive">
              {t.form.title}
            </h1>
          </div>

          {/* Step Indicator */}
          {currentStep < 4 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {/* Form Steps */}
          <div className="bg-card rounded-3xl shadow-lg p-6 md:p-8 animate-fade-in">
            {currentStep === 1 && <TermsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />}

            {currentStep === 2 && <PersonalInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 3 && <EligibilityStep formData={formData} updateFormData={updateFormData} onSubmit={handleSubmit} onPrev={prevStep} isSubmitting={isSubmitting} />}

            {currentStep === 4 && result && <ResultStep eligible={result.eligible} reason={result.reason} identityNumber={formData.identityNumber} onGoHome={goHome} />}
          </div>
        </div>
      </div>
    </div>;
};
export default DonationForm;