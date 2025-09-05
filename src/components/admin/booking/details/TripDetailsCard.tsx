import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

interface TripDetailsCardProps {
  destinationName?: string;
  booking_date: string;
  end_date: string | null;
  adults: number;
  children: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calcDuration = (start: string, end: string | null) => {
  if (!end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const diffDays = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays;
};

const TripDetailsCard: React.FC<TripDetailsCardProps> = ({ destinationName, booking_date, end_date, adults, children }) => {
  const duration = calcDuration(booking_date, end_date);
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-5">
      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Trip Details
      </h3>
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-800">
          <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
          <span className="font-medium">{destinationName || 'Multiple Destinations'}</span>
        </div>
        <div className="flex items-start text-sm">
          <Calendar className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" />
          <div className="text-gray-800">
            <p className="font-medium">Start: {formatDate(booking_date)}</p>
            {end_date && <p className="font-medium">End: {formatDate(end_date)}</p>}
            {duration && (
              <p className="text-emerald-700 font-semibold mt-1">Duration: {duration} day{duration !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-800">
          <Users className="w-4 h-4 mr-2 text-emerald-600" />
          <span className="font-medium">{adults} adult{adults !== 1 ? 's' : ''}{children > 0 && `, ${children} child${children !== 1 ? 'ren' : ''}`}</span>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsCard;


