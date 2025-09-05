import React from 'react';
import { Clock } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

interface OfficeHoursItem {
  day: string;
  hours: string;
}

const officeHours: OfficeHoursItem[] = [
  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
  { day: 'Sunday', hours: '10:00 AM - 2:00 PM' },
  { day: 'Emergency Support', hours: '24/7 Available' }
];

const OfficeHours: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center mb-6">
        <Clock className={`h-8 w-8 ${brandClasses.text.secondary} mr-3`} />
        <h2 className={`text-2xl font-bold ${brandClasses.text.primary}`}>Office Hours</h2>
      </div>
      <div className="space-y-4">
        {officeHours.map((schedule, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="font-medium text-gray-900">{schedule.day}</span>
            <span className="text-gray-600">{schedule.hours}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-[#e0dddf] rounded-lg">
        <p className="text-sm text-[#1c2c54]">
          <strong>Note:</strong> Emergency support is available 24/7 for travelers already on tour. 
          For urgent matters outside office hours, please use WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default OfficeHours;
