import React from 'react';
import { brandClasses } from '@/styles/designSystem';

const OurStory: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
      <div className="flex justify-center">
        <img
          src="https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Puntland coastline"
          className="w-full max-w-2xl aspect-video object-cover rounded-xl shadow-lg mx-auto"
        />
      </div>
      <div className="lg:pl-4">
        <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-6`}>Our Story</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          Founded in 2020, Dalxiis Tourism was born from a passion to share the untold beauty 
          of Somalia with the world. Our founders, native to this magnificent region, recognized 
          the need for professional tourism services that could showcase Somalia's pristine 
          coastlines, rich cultural heritage, and warm hospitality.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          What started as a small local tour operation has grown into Somalia's premier 
          tourism company, serving both local and international travelers. We've built our 
          reputation on authenticity, safety, and creating unforgettable experiences that 
          connect visitors with the true essence of Somali culture and natural beauty.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed">
          Today, we're proud to be the leading tourism provider in the region, offering 
          comprehensive travel solutions while contributing to sustainable tourism development 
          that benefits local communities.
        </p>
      </div>
    </div>
  );
};

export default OurStory;
