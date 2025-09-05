import React, { useState } from 'react';
import { User, Globe, AlertCircle, CheckCircle } from 'lucide-react';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  nationality: string;
}

interface PersonalInfoSectionProps {
  formData: PersonalInfo;
  onFormDataChange: (data: Partial<PersonalInfo>) => void;
}

const nationalityOptions = [
  'Somali',
  'Ethiopian',
  'Kenyan',
  'Djiboutian',
  'Eritrean',
  'American',
  'British',
  'Canadian',
  'German',
  'French',
  'Italian',
  'Swedish',
  'Norwegian',
  'Dutch',
  'Australian',
  'Other'
];

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  onFormDataChange
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PersonalInfo, value: any) => {
    onFormDataChange({ [field]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof PersonalInfo, value: any): string | null => {
    switch (field) {
      case 'firstName':
        if (!value || value.trim().length < 2) return 'First name is required';
        return null;
      case 'lastName':
        if (!value || value.trim().length < 2) return 'Last name is required';
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: keyof PersonalInfo) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
        <p className="text-gray-600 text-sm">Quick details to personalize your experience</p>
      </div>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <User className="inline mr-1.5" size={14} />
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
              validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John"
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {validationErrors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <User className="inline mr-1.5" size={14} />
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
              validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Doe"
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {validationErrors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Nationality (typeable) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          <Globe className="inline mr-1.5" size={14} />
          Nationality (Optional)
        </label>
        <input
          type="text"
          list="nationality-list"
          value={formData.nationality || ''}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
          placeholder="Type your nationality"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
        />
        <datalist id="nationality-list">
          {nationalityOptions.map(nationality => (
            <option key={nationality} value={nationality} />
          ))}
        </datalist>
      </div>
      {/* Tip removed to minimize height */}
    </div>
  );
};