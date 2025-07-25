import React from 'react';
import { MapPin, Camera, Clock, Star } from 'lucide-react';

const DestinationsPage = () => {
  const regions = [
    {
      name: 'Bari Region',
      description: 'Stunning coastal destinations along the Indian Ocean with pristine beaches and dramatic landscapes.',
      destinations: [
        {
          name: 'Caluula',
          description: 'Breathtaking coastal town with pristine beaches and dramatic cliff formations. Known for its untouched natural beauty.',
          image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Pristine beaches', 'Cliff formations', 'Photography spots', 'Peaceful atmosphere'],
          bestTime: 'Year-round',
          activities: ['Beach walks', 'Photography', 'Relaxation', 'Local cuisine']
        },
        {
          name: 'Baargaal',
          description: 'Historic coastal settlement with rich maritime heritage and traditional fishing communities.',
          image: 'https://images.pexels.com/photos/1574477/pexels-photo-1574477.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Maritime heritage', 'Fishing communities', 'Traditional boats', 'Local markets'],
          bestTime: 'October - April',
          activities: ['Cultural tours', 'Fishing experience', 'Market visits', 'Boat rides']
        },
        {
          name: 'Raas Xaafuun',
          description: 'The easternmost point of Africa, offering spectacular views and unique geographical significance.',
          image: 'https://images.pexels.com/photos/2049422/pexels-photo-2049422.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Easternmost point of Africa', 'Spectacular views', 'Unique geography', 'Sunrise viewing'],
          bestTime: 'November - March',
          activities: ['Sightseeing', 'Photography', 'Sunrise watching', 'Nature walks']
        },
        {
          name: 'Mareera',
          description: 'Popular beach destination with crystal-clear waters, perfect for swimming and water activities.',
          image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Crystal-clear waters', 'Swimming spots', 'Water activities', 'Beach resorts'],
          bestTime: 'Year-round',
          activities: ['Swimming', 'Water sports', 'Beach games', 'Resort activities']
        },
        {
          name: 'Biyo Kuleele',
          description: 'Natural freshwater springs creating an oasis-like environment near the coast.',
          image: 'https://images.pexels.com/photos/2088205/pexels-photo-2088205.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Freshwater springs', 'Oasis environment', 'Natural pools', 'Unique ecosystem'],
          bestTime: 'October - May',
          activities: ['Nature exploration', 'Photography', 'Relaxation', 'Eco-tours']
        }
      ]
    },
    {
      name: 'Nugaal Region',
      description: 'Historical and cultural destinations featuring ancient sites and beautiful coastal areas.',
      destinations: [
        {
          name: 'Eyl',
          description: 'Historic coastal town with beautiful beaches, ancient ruins, and the famous Eyl Resort Hotel.',
          image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Historic ruins', 'Beautiful beaches', 'Resort facilities', 'Cultural sites'],
          bestTime: 'November - April',
          activities: ['Historical tours', 'Beach activities', 'Cultural experiences', 'Resort stays']
        },
        {
          name: 'Marraya',
          description: 'Traditional village showcasing authentic Somali culture and traditional architecture.',
          image: 'https://images.pexels.com/photos/1574477/pexels-photo-1574477.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Traditional architecture', 'Authentic culture', 'Local crafts', 'Community life'],
          bestTime: 'Year-round',
          activities: ['Cultural tours', 'Craft workshops', 'Community visits', 'Traditional music']
        },
        {
          name: 'Suuj',
          description: 'Remote destination offering pristine nature and traditional pastoral lifestyle experiences.',
          image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Pristine nature', 'Pastoral lifestyle', 'Remote location', 'Wildlife viewing'],
          bestTime: 'December - March',
          activities: ['Nature walks', 'Wildlife observation', 'Cultural immersion', 'Photography']
        }
      ]
    },
    {
      name: 'Mudug Region',
      description: 'Emerging coastal destination known for its fishing communities and natural harbors.',
      destinations: [
        {
          name: 'Garacad',
          description: 'Developing coastal town with natural harbors, fishing communities, and growing tourism infrastructure.',
          image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
          highlights: ['Natural harbors', 'Fishing communities', 'Developing infrastructure', 'Coastal views'],
          bestTime: 'October - April',
          activities: ['Fishing tours', 'Harbor visits', 'Community tours', 'Coastal exploration']
        }
      ]
    }
  ];

  const activities = [
    {
      name: 'Qaaci Music',
      description: 'Traditional Somali guitar music performances and cultural shows',
      icon: '🎵',
      locations: ['Eyl', 'Bosaso', 'Garowe']
    },
    {
      name: 'Boat Rides',
      description: 'Scenic boat tours along the pristine coastline',
      icon: '🛥️',
      locations: ['Mareera', 'Caluula', 'Eyl', 'Garacad']
    },
    {
      name: 'Cultural Tours',
      description: 'Immersive experiences with local communities',
      icon: '🏛️',
      locations: ['All destinations']
    },
    {
      name: 'Beach Activities',
      description: 'Swimming, sunbathing, and beach games',
      icon: '🏖️',
      locations: ['Mareera', 'Caluula', 'Eyl', 'Baargaal']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-4">
            Destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the breathtaking beauty of Puntland's diverse destinations, 
            from pristine coastlines to historic cultural sites
          </p>
        </div>

        {/* Activities Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-6 text-center">
            Activities & Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-[#f29520] to-[#2f67b5] text-white">
                <div className="text-4xl mb-3">{activity.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                <p className="text-sm opacity-90 mb-3">{activity.description}</p>
                <div className="text-xs opacity-80">
                  Available in: {activity.locations.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regions and Destinations */}
        {regions.map((region, regionIndex) => (
          <div key={regionIndex} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1c2c54] mb-4">{region.name}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">{region.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {region.destinations.map((destination, destIndex) => (
                <div key={destIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#f29520] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {region.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{destination.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#1c2c54] mb-3">{destination.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{destination.description}</p>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-[#f29520] mr-2" />
                        <span className="text-sm text-gray-600">Best time: {destination.bestTime}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-[#1c2c54] mb-2">Highlights:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {destination.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-1 h-1 bg-[#f29520] rounded-full mr-2"></div>
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-[#1c2c54] mb-2">Activities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {destination.activities.map((activity, idx) => (
                          <span key={idx} className="bg-[#e0dddf] text-[#1c2c54] px-2 py-1 rounded-full text-xs">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(`https://wa.me/252905345879?text=Hi! I'm interested in visiting ${destination.name}. Can you help me plan a trip?`, '_blank')}
                        className="flex-1 bg-[#f29520] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#e08420] transition-colors text-sm"
                      >
                        Plan Visit
                      </button>
                      <button className="flex-1 border-2 border-[#2f67b5] text-[#2f67b5] px-4 py-2 rounded-full font-semibold hover:bg-[#2f67b5] hover:text-white transition-colors text-sm">
                        <Camera className="h-4 w-4 inline mr-1" />
                        Gallery
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-6 text-center">
            Explore Puntland
          </h2>
          <div className="bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-xl p-8 text-white text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-4">Interactive Map Coming Soon</h3>
            <p className="text-lg opacity-90 mb-6">
              We're developing an interactive map to help you explore all destinations in Puntland. 
              Contact us for detailed location information and directions.
            </p>
            <button
              onClick={() => window.open('https://wa.me/252905345879?text=Hi! I need directions and location information for destinations in Puntland.', '_blank')}
              className="bg-white text-[#1c2c54] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Directions
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Puntland?</h2>
          <p className="text-xl mb-6 opacity-90">
            Let our local experts help you discover the hidden gems of these beautiful destinations
          </p>
          <button
            onClick={() => window.open('https://wa.me/252905345879?text=Hi! I want to explore Puntland destinations. Can you help me plan my trip?', '_blank')}
            className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors"
          >
            Start Planning Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;