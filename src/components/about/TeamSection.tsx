import React from 'react';
import { brandClasses } from '@/styles/designSystem';

const TeamSection: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
      <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-8 text-center`}>Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            name: 'Local Expert Guides',
            role: 'Cultural Specialists',
            description: 'Native to the region with deep knowledge of local history, culture, and hidden gems.'
          },
          {
            name: 'Safety Coordinators',
            role: 'Security Team',
            description: 'Trained professionals ensuring your safety and security throughout your journey.'
          },
          {
            name: 'Customer Service',
            role: 'Support Team',
            description: 'Dedicated staff available 24/7 to assist with any questions or concerns.'
          }
        ].map((member, index) => (
          <div key={index} className="text-center p-6 rounded-xl bg-gray-50">
            <div className={`w-20 h-20 ${brandClasses.bg.secondary} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
            </div>
            <h3 className={`text-xl font-semibold ${brandClasses.text.primary} mb-2`}>{member.name}</h3>
            <p className={`text-sm ${brandClasses.text.secondary} mb-3`}>{member.role}</p>
            <p className="text-gray-600 text-sm">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
