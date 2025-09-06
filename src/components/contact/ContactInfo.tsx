import React from 'react';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

interface ContactInfoItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  details: string[];
  action: string;
  actionLink: string;
}

const contactInfo: ContactInfoItem[] = [
  {
    icon: MapPin,
    title: 'Our Location',
    details: ['Garowe, Nugaal Region', 'Puntland State, Somalia'],
    action: 'Get Directions',
    actionLink: 'https://maps.google.com/?q=Garowe,Somalia'
  },
  {
    icon: Phone,
    title: 'Phone Numbers',
    details: ['+252 907 793 854', 'Available 24/7 for emergencies'],
    action: 'Call Now',
    actionLink: 'tel:+252907793854'
  },
  {
    icon: Mail,
    title: 'Email Address',
    details: ['dalxiistta@gmail.com', 'Response within 24 hours'],
    action: 'Send Email',
    actionLink: 'mailto:dalxiistta@gmail.com'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    details: ['+252 907 797 695', 'Instant messaging & support'],
    action: 'Chat Now',
    actionLink: 'https://wa.me/252907793854'
  }
];

const ContactInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      {contactInfo.map((info, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start">
            <div className={`w-12 h-12 ${brandClasses.gradient.secondary} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
              <info.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold ${brandClasses.text.primary} mb-2`}>{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className={`${idx === 0 ? 'text-gray-900 font-medium' : 'text-gray-600'} mb-1`}>
                  {detail}
                </p>
              ))}
              <a
                href={info.actionLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${brandClasses.text.secondary} font-semibold ${brandClasses.hover.secondary} transition-colors mt-2`}
              >
                {info.action}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfo;
