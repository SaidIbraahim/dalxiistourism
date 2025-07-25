import React from 'react';
import { Plane, Building, Car, Map, FileText, Calendar, Phone, MessageCircle } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: Plane,
      title: 'Airport Pickup & Drop-off',
      description: 'Professional airport transfer services available 24/7 for all major airports in Somalia including Garowe, Bosaso, and Galkaio.',
      features: [
        '24/7 Availability',
        'Professional Drivers',
        'Comfortable Vehicles',
        'Flight Tracking',
        'Meet & Greet Service',
        'Luggage Assistance'
      ],
      pricing: 'Starting from $25',
      bookingLink: '/book/airport-transfer'
    },
    {
      icon: Building,
      title: 'Accommodation Booking',
      description: 'Book premium accommodations with our trusted hotel partners across Somalia. We handle all bookings on behalf of our customers.',
      features: [
        'Partner Hotels in All Major Cities',
        'Best Rate Guarantee',
        'Instant Confirmation',
        'Special Group Rates',
        'Concierge Services',
        'Room Upgrades Available'
      ],
      pricing: 'Varies by hotel',
      bookingLink: '/book/accommodation',
      partnerHotels: {
        'Garowe': ['Martisoor', 'DreamPoint', 'Militon'],
        'Bosaso': ['Mareera', 'Jabir'],
        'Eyl': ['Eyl Resort Hotel']
      }
    },
    {
      icon: Car,
      title: 'Vehicle Rental Services',
      description: 'Modern fleet of well-maintained vehicles for your transportation needs throughout Somalia.',
      features: [
        'Variety of Vehicle Types',
        'Flexible Rental Terms',
        'Insurance Included',
        'GPS Navigation',
        'Fuel Efficient Vehicles',
        'Emergency Support'
      ],
      pricing: 'Starting from $40/day',
      bookingLink: '/book/vehicle-rental'
    },
    {
      icon: Map,
      title: 'Tour Planning & Management',
      description: 'Comprehensive tour planning services including city tours, regional tours, and custom itineraries designed to showcase Somalia\'s beauty.',
      features: [
        'Custom Itinerary Design',
        'Professional Local Guides',
        'Cultural Experience Planning',
        'Multi-day Tour Packages',
        'Group Tour Coordination',
        'Photography Services'
      ],
      pricing: 'Custom pricing',
      bookingLink: '/book/tour-planning'
    },
    {
      icon: FileText,
      title: 'Visa & Immigration Services',
      description: 'Complete visa and immigration support for international travelers visiting Somalia.',
      features: [
        'Document Preparation',
        'Visa Application Assistance',
        'Fast-track Processing',
        'Expert Consultation',
        'Status Tracking',
        'Embassy Coordination'
      ],
      pricing: 'From $50 + fees',
      bookingLink: '/book/visa-services'
    },
    {
      icon: Calendar,
      title: 'Event Planning',
      description: 'Professional event planning services for corporate events, family gatherings, weddings, and special occasions.',
      features: [
        'Full-Service Event Planning',
        'Venue Selection',
        'Catering Coordination',
        'Entertainment Booking',
        'Decoration & Setup',
        'Photography/Videography'
      ],
      pricing: 'Custom quotes',
      bookingLink: '/book/event-planning'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive travel solutions designed to make your journey through Somalia 
            seamless, comfortable, and memorable
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-xl flex items-center justify-center">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-[#1c2c54]">{service.title}</h3>
                    <p className="text-[#f29520] font-semibold">{service.pricing}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold text-[#1c2c54] mb-3">Service Features:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#f29520] rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partner Hotels Section */}
                {service.partnerHotels && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-[#1c2c54] mb-3">Partner Hotels:</h4>
                    {Object.entries(service.partnerHotels).map(([city, hotels]) => (
                      <div key={city} className="mb-2">
                        <span className="font-medium text-[#2f67b5]">{city}:</span>
                        <span className="ml-2 text-gray-600">{hotels.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.open(`https://wa.me/252905345879?text=Hi! I'm interested in your ${service.title.toLowerCase()} service. Can you provide more details?`, '_blank')}
                    className="flex-1 bg-[#f29520] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e08420] transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Book via WhatsApp
                  </button>
                  <button
                    onClick={() => window.open('tel:+252907793854', '_blank')}
                    className="flex-1 border-2 border-[#2f67b5] text-[#2f67b5] px-6 py-3 rounded-lg font-semibold hover:bg-[#2f67b5] hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-6 text-center">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Multi-day Tours', description: 'Extended tours covering multiple destinations' },
              { title: 'Weekend Getaways', description: 'Short weekend trips for quick escapes' },
              { title: 'Family Vacations', description: 'Family-friendly packages and activities' },
              { title: 'Cultural Experiences', description: 'Deep dive into Somali culture and traditions' }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-[#e0dddf] transition-colors">
                <h3 className="font-semibold text-[#1c2c54] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing the Right Service?</h2>
          <p className="text-xl mb-6 opacity-90">
            Our travel experts are ready to help you plan the perfect trip to Somalia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://wa.me/252905345879?text=Hi! I need help choosing the right services for my trip to Somalia.', '_blank')}
              className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Expert
            </button>
            <button
              onClick={() => window.open('tel:+252907793854', '_blank')}
              className="border-2 border-[#f29520] text-[#f29520] px-8 py-3 rounded-full font-semibold hover:bg-[#f29520] hover:text-white transition-colors inline-flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;