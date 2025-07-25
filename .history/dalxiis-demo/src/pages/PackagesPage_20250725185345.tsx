import React, { useState } from 'react';
import { MapPin, Clock, Star, Users, Filter } from 'lucide-react';

const PackagesPage = () => {
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const destinations = [
    'all',
    'garowe-bosaso',
    'garowe-eyl',
    'bosaso-caluula',
    'eyl-garacad',
    'multi-city'
  ];

  const packages = [
    {
      id: 1,
      name: 'Garowe to Bosaso Adventure',
      type: 'VIP',
      destination: 'garowe-bosaso',
      price: 450,
      duration: '3 Days',
      rating: 4.9,
      reviews: 127,
      image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Mareera Beach', 'Biyo Kuleele', 'Cultural Tours', 'Traditional Qaaci'],
      includes: ['Luxury Transport', '4-Star Hotels', 'All Meals', 'Private Guide', 'Airport Transfer'],
      description: 'Experience the coastal beauty of Bosaso with premium accommodations and exclusive access to pristine beaches.',
      itinerary: [
        'Day 1: Departure from Garowe, Arrival in Bosaso',
        'Day 2: Mareera Beach Tour & Cultural Experience',
        'Day 3: Biyo Kuleele Visit & Return Journey'
      ]
    },
    {
      id: 2,
      name: 'Eyl Beach Retreat',
      type: 'Basic',
      destination: 'garowe-eyl',
      price: 280,
      duration: '2 Days',
      rating: 4.7,
      reviews: 89,
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Eyl Resort', 'Boat Rides', 'Traditional Music', 'Fishing Experience'],
      includes: ['Standard Transport', 'Beach Resort', 'Breakfast', 'Activities', 'Guide'],
      description: 'Relax and unwind at the beautiful Eyl beaches with comfortable accommodations and authentic cultural experiences.',
      itinerary: [
        'Day 1: Journey to Eyl, Beach Activities',
        'Day 2: Boat Ride & Traditional Music Experience'
      ]
    },
    {
      id: 3,
      name: 'Puntland Explorer',
      type: 'VIP',
      destination: 'multi-city',
      price: 650,
      duration: '5 Days',
      rating: 5.0,
      reviews: 45,
      image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Multiple Cities', 'Caluula Coast', 'Raas Xaafuun', 'Historical Sites'],
      includes: ['Luxury Transport', 'Premium Hotels', 'All Meals', 'Private Guide', 'All Activities'],
      description: 'Comprehensive tour covering the best of Puntland\'s destinations with luxury accommodations and personalized service.',
      itinerary: [
        'Day 1: Garowe City Tour',
        'Day 2-3: Bosaso & Coastal Areas',
        'Day 4: Eyl Beach Experience',
        'Day 5: Return via Scenic Route'
      ]
    },
    {
      id: 4,
      name: 'Bosaso to Caluula Coastal',
      type: 'VIP',
      destination: 'bosaso-caluula',
      price: 380,
      duration: '2 Days',
      rating: 4.8,
      reviews: 62,
      image: 'https://images.pexels.com/photos/1574477/pexels-photo-1574477.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Caluula Beach', 'Coastal Drive', 'Local Cuisine', 'Photography'],
      includes: ['Transport', 'Boutique Hotel', 'Meals', 'Guide', 'Activities'],
      description: 'Discover the stunning Caluula coastline with its pristine beaches and dramatic cliff formations.',
      itinerary: [
        'Day 1: Scenic Drive to Caluula, Beach Exploration',
        'Day 2: Photography Tour & Local Culture'
      ]
    },
    {
      id: 5,
      name: 'Weekend Getaway - Eyl',
      type: 'Basic',
      destination: 'garowe-eyl',
      price: 195,
      duration: '2 Days',
      rating: 4.6,
      reviews: 134,
      image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Quick Escape', 'Beach Time', 'Relaxation', 'Local Food'],
      includes: ['Transport', 'Standard Hotel', 'Some Meals', 'Basic Guide'],
      description: 'Perfect weekend escape to Eyl\'s beautiful beaches for relaxation and rejuvenation.',
      itinerary: [
        'Day 1: Travel to Eyl, Beach Relaxation',
        'Day 2: Morning Activities, Return Journey'
      ]
    },
    {
      id: 6,
      name: 'Garacad Heritage Tour',
      type: 'VIP',
      destination: 'eyl-garacad',
      price: 420,
      duration: '3 Days',
      rating: 4.9,
      reviews: 71,
      image: 'https://images.pexels.com/photos/2049422/pexels-photo-2049422.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: ['Historical Sites', 'Cultural Heritage', 'Local Communities', 'Traditional Crafts'],
      includes: ['Luxury Transport', 'Heritage Hotels', 'All Meals', 'Expert Guide'],
      description: 'Immerse yourself in the rich cultural heritage of Garacad with expert-guided historical tours.',
      itinerary: [
        'Day 1: Journey to Garacad, Historical Overview',
        'Day 2: Heritage Sites & Cultural Experiences',
        'Day 3: Community Visit & Return'
      ]
    }
  ];

  const filteredPackages = packages.filter(pkg => {
    const destinationMatch = selectedDestination === 'all' || pkg.destination === selectedDestination;
    const typeMatch = selectedType === 'all' || pkg.type.toLowerCase() === selectedType;
    return destinationMatch && typeMatch;
  });

  const formatDestination = (dest: string) => {
    return dest.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' to ');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-4">
            Tour Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover Puntland's hidden gems with our carefully crafted tour packages, 
            designed to showcase the region's natural beauty and cultural heritage
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-[#f29520] mr-2" />
            <h3 className="text-lg font-semibold text-[#1c2c54]">Filter Packages</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Route
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
              >
                <option value="all">All Destinations</option>
                {destinations.slice(1).map(dest => (
                  <option key={dest} value={dest}>
                    {formatDestination(dest)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="basic">Basic</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <div className="relative h-64 md:h-full">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
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
                </div>
                
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
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
                    <div className="flex items-center text-gray-500">
                      <Star className="h-4 w-4 mr-1" />
                      <span>{pkg.reviews} reviews</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-[#1c2c54] mb-2">Highlights:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {pkg.highlights.slice(0, 4).map((highlight, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1 h-1 bg-[#f29520] rounded-full mr-2"></div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <div>
                      <span className="text-3xl font-bold text-[#f29520]">${pkg.price}</span>
                      <span className="text-gray-500"> per person</span>
                    </div>
                    <button
                      onClick={() => window.open(`https://wa.me/252905345879?text=Hi! I'm interested in the ${pkg.name} package. Can you provide more details?`, '_blank')}
                      className="w-full bg-[#2f67b5] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1c2c54] transition-colors mt-2"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 text-center mb-6">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Package?</h2>
          <p className="text-xl mb-6 opacity-90">
            We can create personalized tour packages based on your preferences and requirements
          </p>
          <button
            onClick={() => window.open('https://wa.me/252905345879?text=Hi! I would like to discuss a custom tour package.', '_blank')}
            className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors"
          >
            Contact for Custom Package
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;