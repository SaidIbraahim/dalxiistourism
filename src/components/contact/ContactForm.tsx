import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { brandClasses, components } from '@/styles/designSystem';
import { usePackages, useServices, useClearServicesCache } from '@/stores/appStore';
import { DataService } from '@/services/dataService';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

interface ContactFormProps {
  onSubmit: (formData: ContactFormData) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: ''
  });

  // Get real data from the store
  const packages = usePackages();
  const services = useServices();
  const clearServicesCache = useClearServicesCache();

  // Load data on component mount
  useEffect(() => {
    if (packages.length === 0) {
      DataService.fetchPackages(1, 50);
    }
    // Clear services cache and refetch to ensure we get the latest data
    clearServicesCache();
    DataService.fetchServices();
  }, [packages.length, clearServicesCache]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-2`}>Send Us a Message</h2>
        <p className="text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>
      
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
              className={`${components.input.base} p-3`}
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
              className={`${components.input.base} p-3`}
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
            className={`${components.input.base} p-3`}
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
            className={`${components.input.base} p-3`}
          >
            <option value="">Select a service</option>
            
            {/* Tour Packages */}
            {packages
              .filter(pkg => pkg.status === 'active')
              .map(pkg => (
                <option key={`package-${pkg.id}`} value={`package-${pkg.id}`}>
                  📦 {pkg.name} - ${pkg.price}
                </option>
              ))}
            
            {/* Additional Services */}
            {services
              .filter(service => service.status === 'active')
              .map(service => (
                <option key={`service-${service.id}`} value={`service-${service.id}`}>
                  🚀 {service.name} - ${service.price}
                </option>
              ))}
            
            {/* General Options */}
            <option value="general-inquiry">General Inquiry</option>
            <option value="custom-tour">Custom Tour Planning</option>
            <option value="group-booking">Group Booking</option>
            <option value="other">Other</option>
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
            className={`${components.input.base} p-3`}
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
            className={`${components.input.base} p-3 resize-none`}
            placeholder="Tell us about your travel plans, dates, group size, special requirements, etc."
          />
        </div>

        <button
          type="submit"
          className={`w-full ${brandClasses.bg.secondary} text-white py-4 px-6 rounded-xl font-semibold ${brandClasses.hover.secondary} transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
        >
          <Send className="h-5 w-5 mr-2" />
          Send via WhatsApp
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
