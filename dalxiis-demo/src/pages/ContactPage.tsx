import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappMessage = `Hi Dalxiis Tourism!

*New Contact Form Submission*
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Service Interest: ${formData.serviceType}
Subject: ${formData.subject}

Message:
${formData.message}

Please get back to me at your earliest convenience. Thank you!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/252905345879?text=${encodedMessage}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
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
      details: ['+252 905 345 879', 'Instant messaging & support'],
      action: 'Chat Now',
      actionLink: 'https://wa.me/252905345879'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 2:00 PM' },
    { day: 'Emergency Support', hours: '24/7 Available' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your Puntland adventure? Get in touch with our expert team 
            for personalized travel planning and exceptional service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#1c2c54] mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service of Interest
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="tour-packages">Tour Packages</option>
                  <option value="airport-transfer">Airport Transfer</option>
                  <option value="accommodation">Hotel Booking</option>
                  <option value="vehicle-rental">Vehicle Rental</option>
                  <option value="visa-services">Visa Services</option>
                  <option value="custom-tour">Custom Tour Planning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                  placeholder="Brief subject of your inquiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                  placeholder="Tell us about your travel plans, dates, group size, special requirements, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#f29520] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e08420] transition-colors flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send via WhatsApp
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className={`${idx === 0 ? 'text-gray-900 font-medium' : 'text-gray-600'} mb-1`}>
                        {detail}
                      </p>
                    ))}
                    <a
                      href={info.actionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#f29520] font-semibold hover:text-[#e08420] transition-colors mt-2"
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
        </div>

        {/* Office Hours & Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Office Hours */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-[#f29520] mr-3" />
              <h2 className="text-2xl font-bold text-[#1c2c54]">Office Hours</h2>
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

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#1c2c54] mb-6">Quick Answers</h2>
            <div className="space-y-4">
              {[
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
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-[#1c2c54] mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 text-center mb-6">
          <h2 className="text-3xl font-bold mb-4">24/7 Emergency Support</h2>
          <p className="text-xl mb-6 opacity-90">
            For travelers currently on tour who need immediate assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+252907793854"
              className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors inline-flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Emergency Hotline
            </a>
            <a
              href="https://wa.me/252905345879?text=EMERGENCY: I need immediate assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#f29520] text-[#f29520] px-8 py-3 rounded-full font-semibold hover:bg-[#f29520] hover:text-white transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Emergency WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;