import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Building, Car, Map, FileText, Calendar } from 'lucide-react';

const ServicesOverview = () => {
  const services = [
    {
      icon: Plane,
      title: 'Airport Transfer',
      description: 'Reliable pickup and drop-off services for all major airports in Puntland',
      features: ['24/7 Availability', 'Professional Drivers', 'Comfortable Vehicles'],
      link: '/book/airport-transfer'
    },
    {
      icon: Building,
      title: 'Hotel Booking',
      description: 'Premium accommodations with our trusted hotel partners across the region',
      features: ['Partner Hotels', 'Best Rates', 'Instant Booking'],
      link: '/book/accommodation'
    },
    {
      icon: Car,
      title: 'Vehicle Rental',
      description: 'Modern fleet of vehicles for your transportation needs throughout Puntland',
      features: ['Various Models', 'Flexible Terms', 'Insurance Included'],
      link: '/book/vehicle-rental'
    },
    {
      icon: Map,
      title: 'Tour Planning',
      description: 'Customized itineraries designed to showcase the best of Puntland',
      features: ['Custom Routes', 'Local Guides', 'Cultural Experiences'],
      link: '/book/tour-planning'
    },
    {
      icon: FileText,
      title: 'Visa Services',
      description: 'Complete visa and immigration support for international travelers',
      features: ['Document Assistance', 'Fast Processing', 'Expert Guidance'],
      link: '/book/visa-services'
    },
    {
      icon: Calendar,
      title: 'Event Planning',
      description: 'Corporate events, family gatherings, and special occasion planning',
      features: ['Full Service', 'Local Venues', 'Catering Options'],
      link: '/book/event-planning'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1c2c54] mb-4">Our Premium Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive travel solutions tailored to make your journey through Puntland seamless and memorable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#f29520] rounded-lg flex items-center justify-center group-hover:bg-[#2f67b5] transition-colors">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#1c2c54] ml-3">{service.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-[#f29520] rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                to={service.link}
                className="inline-flex items-center text-[#2f67b5] font-semibold hover:text-[#f29520] transition-colors"
              >
                Book Service
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="bg-[#2f67b5] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#1c2c54] transition-colors"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;