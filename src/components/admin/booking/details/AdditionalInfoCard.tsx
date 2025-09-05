import React from 'react';
import { Utensils, MessageSquare } from 'lucide-react';

interface AdditionalInfoCardProps {
  dietary_requirements: string | null;
  special_requests: string | null;
}

const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({ dietary_requirements, special_requests }) => {
  if (!dietary_requirements && !special_requests) return null;
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-5">
      <h3 className="text-lg font-bold text-purple-900 mb-4">Additional Information</h3>
      <div className="space-y-3">
        {dietary_requirements && (
          <div>
            <div className="flex items-center text-sm font-medium text-purple-800 mb-1">
              <Utensils className="w-4 h-4 mr-2" />
              Dietary Requirements
            </div>
            <p className="text-sm text-purple-700 bg-white rounded p-2 border border-purple-100">{dietary_requirements}</p>
          </div>
        )}
        {special_requests && (
          <div>
            <div className="flex items-center text-sm font-medium text-purple-800 mb-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Special Requests
            </div>
            <p className="text-sm text-purple-700 bg-white rounded p-2 border border-purple-100">{special_requests}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoCard;


