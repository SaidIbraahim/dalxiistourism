import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Users } from 'lucide-react';

const FeaturedPackages = () => {
  const packages = [
    {
      id: 1,
      name: 'Garowe to Bosaso Adventure',
      type: 'VIP',
      price: 450,
      duration: '3 Days',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Mareera Beach', 'Biyo Kuleele', 'Cultural Tours'],
      includes: ['Luxury Transport', '4-Star Hotels', 'All Meals', 'Guide'],
      description: 'Experience the coastal beauty of Bosaso with premium accommodations and exclusive access to pristine beaches.'
    },
    {
      id: 2,
      name: 'Eyl Beach Retreat',
      type: 'Basic',
      price: 280,
      duration: '2 Days',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Eyl Resort', 'Boat Rides', 'Traditional Music'],
      includes: ['Standard Transport', 'Beach Resort', 'Breakfast', 'Activities'],
      description: 'Relax and unwind at the beautiful Eyl beaches with comfortable accommodations and authentic cultural experiences.'
    },
    {
      id: 3,
      name: 'Puntland Explorer',
      type: 'VIP',
      price: 650,
      duration: '5 Days',
      rating: 5.0,
      image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Multiple Cities', 'Caluula Coast', 'Raas Xaafuun'],
      includes: ['Luxury Transport', 'Premium Hotels', 'All Meals', 'Private Guide'],
      description: 'Comprehensive tour covering the best of Puntland\'s destinations with luxury accommodations and personalized service.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1c2c54] mb-4">Featured Tour Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Carefully crafted experiences that showcase the best of Puntland's natural beauty and cultural heritage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pkg.type === 'VIP' 
                      ? 'bg-[#f29520] text-white' 
                      : 'bg-[#2f67b5] text-white'
                  }`}>
                    {pkg.type} Package
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-semibold">{pkg.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#1c2c54] mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>2-8 people</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-[#1c2c54] mb-2">Highlights:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.highlights.map((highlight, index) => (
                      <span key={index} className="bg-[#e0dddf] text-[#1c2c54] px-2 py-1 rounded-full text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-[#1c2c54] mb-2">Includes:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {pkg.includes.map((item, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1 h-1 bg-[#f29520] rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-[#f29520]">${pkg.price}</span>
                    <span className="text-gray-500"> per person</span>
                  </div>
                  <Link
                    to={`/book/package-${pkg.id}`}
                    className="bg-[#2f67b5] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1c2c54] transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/packages"
            className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#e08420] transition-colors inline-flex items-center"
          >
            View All Packages <MapPin className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPackages;