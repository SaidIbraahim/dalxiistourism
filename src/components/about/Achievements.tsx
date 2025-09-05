import React from 'react';
import { Users, MapPin, Star, Award } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  label: string;
}

const stats: Stat[] = [
  {
    icon: Users,
    number: '2,500+',
    label: 'Happy Travelers'
  },
  {
    icon: MapPin,
    number: '15+',
    label: 'Destinations'
  },
  {
    icon: Star,
    number: '4.9/5',
    label: 'Average Rating'
  },
  {
    icon: Award,
    number: '5+',
    label: 'Years Experience'
  }
];

const Achievements: React.FC = () => {
  return (
    <div className={`${brandClasses.bg.primary} text-white rounded-2xl p-8 md:p-12 mb-16`}>
      <h2 className="text-3xl font-bold mb-8 text-center">Our Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <stat.icon className={`h-12 w-12 mx-auto mb-4 ${brandClasses.text.secondary}`} />
            <div className="text-4xl font-bold mb-2">{stat.number}</div>
            <div className="text-lg opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
