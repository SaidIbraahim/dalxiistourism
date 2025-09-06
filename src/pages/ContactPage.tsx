
import { brandClasses } from '@/styles/designSystem';
import { ContactForm, ContactInfo, OfficeHours, FAQ, EmergencyContact } from '@/components/contact';
import { usePackages, useServices } from '@/stores/appStore';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

const ContactPage = () => {
  const packages = usePackages();
  const services = useServices();

  const handleSubmit = (formData: ContactFormData) => {
    const { name, email, phone, subject, message, serviceType } = formData;
    
    // Get detailed information about the selected service
    let serviceDetails = serviceType;
    if (serviceType.startsWith('package-')) {
      const packageId = serviceType.replace('package-', '');
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (selectedPackage) {
        serviceDetails = `📦 ${selectedPackage.name} - $${selectedPackage.price} (${selectedPackage.duration_days} days)`;
      }
    } else if (serviceType.startsWith('service-')) {
      const serviceId = serviceType.replace('service-', '');
      const selectedService = services.find(service => service.id === serviceId);
      if (selectedService) {
        serviceDetails = `🚀 ${selectedService.name} - $${selectedService.price} (${selectedService.duration})`;
      }
    }
    
    const whatsappMessage = `Hi Dalxiis Tourism!

*New Contact Form Submission*
Name: ${name}
Email: ${email}
Phone: ${phone}
Service Interest: ${serviceDetails}
Subject: ${subject}

Message:
${message}

Please get back to me at your earliest convenience. Thank you!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/252907793854?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-bold ${brandClasses.text.primary} mb-4`}>
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your Puntland adventure? Get in touch with our expert team 
            for personalized travel planning and exceptional service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Contact Form */}
          <ContactForm onSubmit={handleSubmit} />

          {/* Contact Information */}
          <ContactInfo />
        </div>

        {/* Office Hours & Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Office Hours */}
          <OfficeHours />

          {/* FAQ */}
          <FAQ />
        </div>

        {/* Emergency Contact */}
        <EmergencyContact />
        
        {/* Bottom Spacing */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default ContactPage;