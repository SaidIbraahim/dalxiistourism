import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineCardProps {
  created_at?: string;
  updated_at?: string;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ created_at, updated_at }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Booking Timeline
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Created:</span>
          <span className="font-semibold text-gray-900">{created_at ? new Date(created_at).toLocaleString() : 'N/A'}</span>
        </div>
        {updated_at && updated_at !== created_at && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Last Updated:</span>
            <span className="font-semibold text-gray-900">{new Date(updated_at).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;


