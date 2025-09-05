import React from 'react';
import { Calendar, Users, Plus, Minus, CheckCircle } from 'lucide-react';

interface TripDetails {
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
}

interface TripDetailsSectionProps {
  formData: TripDetails;
  onFormDataChange: (data: Partial<TripDetails>) => void;
}

export const TripDetailsSection: React.FC<TripDetailsSectionProps> = ({
  formData,
  onFormDataChange
}) => {
  const handleInputChange = (field: keyof TripDetails, value: any) => {
    onFormDataChange({ [field]: value });
  };

  const handleParticipantChange = (field: 'adults' | 'children', delta: number) => {
    const currentValue = formData[field] || (field === 'adults' ? 1 : 0);
    const minValue = field === 'adults' ? 1 : 0;
    const maxValue = 20;
    const newValue = Math.max(minValue, Math.min(maxValue, currentValue + delta));
    handleInputChange(field, newValue);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (1 year from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">When are you traveling?</h2>
        <p className="text-gray-600 text-sm">Let us know your travel dates and group size</p>
      </div>

      {/* Trip Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Calendar className="inline mr-1.5" size={14} />
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Calendar className="inline mr-1.5" size={14} />
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            min={formData.startDate || getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          {formData.startDate && formData.endDate && (
            <p className="mt-1.5 text-xs text-gray-600">
              Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Adults */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Users className="inline mr-1.5" size={14} />
            Adults (18+) *
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleParticipantChange('adults', -1)}
              disabled={formData.adults <= 1}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            
            <div className="flex-1 max-w-[160px]">
              <input
                type="number"
                value={formData.adults || 1}
                onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all text-sm"
              />
            </div>
            
            <button
              type="button"
              onClick={() => handleParticipantChange('adults', 1)}
              disabled={formData.adults >= 20}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Children */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Users className="inline mr-1.5" size={14} />
            Children (Under 18)
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleParticipantChange('children', -1)}
              disabled={formData.children <= 0}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            
            <div className="flex-1 max-w-[160px]">
              <input
                type="number"
                value={formData.children || 0}
                onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all text-sm"
              />
            </div>
            
            <button
              type="button"
              onClick={() => handleParticipantChange('children', 1)}
              disabled={formData.children >= 10}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Total participants summary */}
      {(formData.adults > 0 || formData.children > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-600" size={18} />
            <div>
              <p className="text-xs font-medium text-blue-900">
                Total: {(formData.adults || 0) + (formData.children || 0)} travelers
              </p>
              <p className="text-[11px] text-blue-700">
                {formData.adults || 0} adult{(formData.adults || 0) !== 1 ? 's' : ''}
                {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? 'ren' : ''}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Group booking notice */}
      {(formData.adults + formData.children) > 6 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-600 mt-0.5" size={18} />
            <div>
              <h4 className="font-medium text-green-900 text-sm">Group Discount Available!</h4>
              <p className="text-green-700 text-xs mt-1">
                Groups of 7+ people are eligible for special group rates. We'll apply the best available discount to your booking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};