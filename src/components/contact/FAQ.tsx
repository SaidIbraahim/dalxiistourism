import React from 'react';
import { brandClasses } from '@/styles/designSystem';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 2-3 weeks in advance for best availability.'
  },
  {
    question: 'Do you offer group discounts?',
    answer: 'Yes! Groups of 6 or more receive special discounted rates.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept cash, mobile money transfers, and international wire transfers.'
  },
  {
    question: 'Is travel insurance included?',
    answer: 'Basic coverage is included in VIP packages. Additional insurance is available.'
  }
];

const FAQ: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className={`text-2xl font-bold ${brandClasses.text.primary} mb-6`}>Quick Answers</h2>
      <div className="space-y-4">
        {faqItems.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
            <h3 className={`font-semibold ${brandClasses.text.primary} mb-2`}>{faq.question}</h3>
            <p className="text-gray-600 text-sm">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
