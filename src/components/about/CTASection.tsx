import React from 'react';
import { ArrowRight } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

const CTASection: React.FC = () => {
  return (
    <div className={`${brandClasses.bg.primary} text-white rounded-2xl p-8 md:p-12 text-center`}>
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Somalia?</h2>
      <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
        Join thousands of satisfied travelers who have discovered the beauty and culture of Somalia with Dalxiis Tourism. 
        Let us create an unforgettable journey tailored just for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/packages"
          className={`${brandClasses.bg.secondary} text-white px-8 py-4 rounded-full font-semibold ${brandClasses.hover.secondary} transition-colors inline-flex items-center justify-center`}
        >
          Explore Our Packages
          <ArrowRight className="ml-2 h-5 w-5" />
        </a>
        <a
          href="/contact"
          className={`border-2 ${brandClasses.border.secondary} ${brandClasses.text.secondary} px-8 py-4 rounded-full font-semibold ${brandClasses.hover.secondary} hover:text-white transition-colors inline-flex items-center justify-center`}
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
};

export default CTASection;
