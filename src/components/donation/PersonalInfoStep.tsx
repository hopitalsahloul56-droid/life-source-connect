import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DonationFormData } from './DonationForm';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface PersonalInfoStepProps {
  formData: DonationFormData;
  updateFormData: (data: Partial<DonationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];

const PersonalInfoStep = ({ formData, updateFormData, onNext, onPrev }: PersonalInfoStepProps) => {
  const { t, isRTL } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t.common.required;
    if (!formData.lastName.trim()) newErrors.lastName = t.common.required;
    if (!formData.identityNumber.trim()) {
      newErrors.identityNumber = t.common.required;
    } else if (!/^\d{8}$/.test(formData.identityNumber.trim())) {
      newErrors.identityNumber = t.form.cinInvalid;
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = t.common.required;
    if (!formData.dateOfBirth) newErrors.dateOfBirth = t.common.required;

    // Validate age (18-65)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18 || age > 65) {
        newErrors.dateOfBirth = t.eligibility.age;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field: keyof DonationFormData, value: string) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-primary">
        <User className="w-6 h-6" />
        <h2 className="text-xl font-semibold">{t.form.step2}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.form.firstName} *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t.form.lastName} *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="identityNumber">{t.form.identityNumber} *</Label>
          <Input
            id="identityNumber"
            value={formData.identityNumber}
            onChange={(e) => handleChange('identityNumber', e.target.value)}
            className={errors.identityNumber ? 'border-destructive' : ''}
          />
          {errors.identityNumber && <p className="text-xs text-destructive">{errors.identityNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">{t.form.phoneNumber} *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={errors.phoneNumber ? 'border-destructive' : ''}
          />
          {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.form.email}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{t.form.dateOfBirth} *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'border-destructive' : ''}
          />
          {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodType">{t.form.bloodType}</Label>
          <Select
            value={formData.bloodType}
            onValueChange={(value) => handleChange('bloodType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.form.bloodTypeUnknown} />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'unknown' ? t.form.bloodTypeUnknown : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t.form.address}</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          size="lg"
          className="rounded-full px-8"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t.form.previous}
        </Button>
        <Button
          onClick={handleNext}
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

export default PersonalInfoStep;
