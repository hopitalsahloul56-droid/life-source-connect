import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`step-indicator ${
                step.number < currentStep
                  ? 'completed'
                  : step.number === currentStep
                  ? 'active'
                  : 'pending'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-8 sm:w-16 md:w-24 mx-2 rounded-full transition-colors ${
                step.number < currentStep ? 'bg-success' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
