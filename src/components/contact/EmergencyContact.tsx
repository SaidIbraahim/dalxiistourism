import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

const EmergencyContact: React.FC = () => {
  return (
    <div className={`${brandClasses.bg.primary} text-white rounded-2xl p-8 text-center mb-6`}>
      <h2 className="text-3xl font-bold mb-4">24/7 Emergency Support</h2>
      <p className="text-xl mb-6 opacity-90">
        For travelers currently on tour who need immediate assistance
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="tel:+252907793854"
          className={`${brandClasses.bg.secondary} text-white px-8 py-3 rounded-full font-semibold ${brandClasses.hover.secondary} transition-colors inline-flex items-center justify-center`}
        >
          <Phone className="mr-2 h-5 w-5" />
          Emergency Hotline
        </a>
        <a
          href="https://wa.me/252907793854?text=EMERGENCY: I need immediate assistance"
          target="_blank"
          rel="noopener noreferrer"
          className={`border-2 ${brandClasses.border.secondary} ${brandClasses.text.secondary} px-8 py-3 rounded-full font-semibold ${brandClasses.hover.secondary} hover:text-white transition-colors inline-flex items-center justify-center`}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Emergency WhatsApp
        </a>
      </div>
    </div>
  );
};

export default EmergencyContact;
