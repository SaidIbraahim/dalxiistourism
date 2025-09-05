import React, { useState } from 'react';
import { Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface ContactInfo {
  email: string;
  phone: string;
  phoneCountry: string;
}

interface ContactInfoSectionProps {
  formData: ContactInfo;
  onFormDataChange: (data: Partial<ContactInfo>) => void;
}

const countryCodes = [
  { code: '+252', label: 'Somalia (+252)' },
  { code: '+251', label: 'Ethiopia (+251)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+253', label: 'Djibouti (+253)' },
  { code: '+291', label: 'Eritrea (+291)' },
  { code: '+1', label: 'United States (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+46', label: 'Sweden (+46)' },
  { code: '+47', label: 'Norway (+47)' },
  { code: '+31', label: 'Netherlands (+31)' },
  { code: '+61', label: 'Australia (+61)' },
];

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ formData, onFormDataChange }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof ContactInfo, value: any) => {
    onFormDataChange({ [field]: value });
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: keyof ContactInfo) => {
    if (field === 'email') {
      if (!formData.email) {
        setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
      } else if (!isValidEmail(formData.email)) {
        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we reach you?</h2>
        <p className="text-gray-600">We use this to send your confirmation and trip updates</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="inline mr-2" size={16} />
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            validationErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="john.doe@example.com"
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline mr-2" size={16} />
          Phone Number (Optional)
        </label>
        <div className="flex gap-3">
          <div className="w-44">
            <input
              type="text"
              list="phone-country-codes"
              value={formData.phoneCountry || '+252'}
              onChange={(e) => handleInputChange('phoneCountry', e.target.value)}
              placeholder="Country code"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <datalist id="phone-country-codes">
              {countryCodes.map(cc => (
                <option key={cc.code} value={cc.code}>{cc.label}</option>
              ))}
            </datalist>
          </div>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="61 123 4567"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">WhatsApp-enabled numbers help us assist you faster</p>
      </div>

      {/* Privacy note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="text-blue-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">We respect your privacy</h4>
            <p className="text-blue-700 text-sm mt-1">
              We will never share your contact details. You can opt out of notifications anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
