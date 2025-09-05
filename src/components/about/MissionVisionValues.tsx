import React from 'react';
import { Target, Eye, Heart } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

const MissionVisionValues: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      {/* Mission */}
      <div className={`${brandClasses.gradient.secondary} text-white rounded-2xl p-8 text-center`}>
        <Target className="h-16 w-16 mx-auto mb-6 opacity-90" />
        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
        <p className="text-lg leading-relaxed opacity-95">
          To deliver unforgettable and educational travel experiences while promoting 
          a sustainable tourism model that benefits both the environment and local communities.
        </p>
      </div>

      {/* Vision */}
      <div className={`${brandClasses.gradient.primary} text-white rounded-2xl p-8 text-center`}>
        <Eye className="h-16 w-16 mx-auto mb-6 opacity-90" />
        <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
        <p className="text-lg leading-relaxed opacity-95">
          To become a globally recognized tourism company renowned for exceptional 
          customer experiences and authentic cultural immersion.
        </p>
      </div>

      {/* Values Preview */}
      <div className={`${brandClasses.gradient.primary} text-white rounded-2xl p-8 text-center`}>
        <Heart className="h-16 w-16 mx-auto mb-6 opacity-90" />
        <h3 className="text-2xl font-bold mb-4">Our Values</h3>
        <p className="text-lg leading-relaxed opacity-95">
          Safety, cultural learning, environmental responsibility, and client-first customization 
          guide everything we do.
        </p>
      </div>
    </div>
  );
};

export default MissionVisionValues;
