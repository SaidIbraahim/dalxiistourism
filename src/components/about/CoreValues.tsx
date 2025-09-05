import React from 'react';
import { Shield, Users, Award, Globe, Heart, Leaf, Star } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

interface Value {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Your security is our absolute priority. We maintain the highest safety standards with experienced local guides, vetted accommodations, and 24/7 emergency support.'
  },
  {
    icon: Users,
    title: 'Cultural Immersion',
    description: 'We believe in authentic experiences that connect you with local communities, traditions, and the true spirit of Somali culture.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in every aspect of our service, from planning to execution, ensuring memorable experiences that exceed expectations.'
  },
  {
    icon: Globe,
    title: 'Environmental Responsibility',
    description: 'We promote sustainable tourism practices that protect and preserve Somalia\'s natural beauty for future generations.'
  },
  {
    icon: Heart,
    title: 'Community Support',
    description: 'We actively support local communities by creating employment opportunities and contributing to regional economic development.'
  },
  {
    icon: Leaf,
    title: 'Authenticity',
    description: 'We provide genuine, unfiltered experiences that showcase the real Somalia, its people, and its incredible natural wonders.'
  }
];

const CoreValues: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
      <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-8 text-center`}>Our Core Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {values.map((value, index) => (
          <div key={index} className="flex items-start p-6 rounded-xl bg-gray-50 hover:bg-[#e0dddf] transition-colors">
            <div className={`w-12 h-12 ${brandClasses.bg.secondary} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
              <value.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${brandClasses.text.primary} mb-2`}>{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoreValues;
