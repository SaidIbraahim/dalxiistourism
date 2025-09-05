import { useEffect } from 'react';
import { MapPin, Camera } from 'lucide-react';
import { useDestinations, useDestinationsLoading, useDestinationsError } from '../stores/appStore';
import { DataService } from '../services/DataService';
import { brandClasses } from '../styles/designSystem';

const DestinationsPage = () => {
  // Get real data from Supabase via Zustand store
  const destinations = useDestinations();
  const isLoading = useDestinationsLoading();
  const error = useDestinationsError();

  // Data is pre-loaded by DataPreloader, no need to fetch here
  // Only fetch if no data is available and not loading
  useEffect(() => {
    if (destinations.length === 0 && !isLoading) {
      console.log('🏝️ DestinationsPage: No data available, fetching...');
      DataService.fetchDestinations();
    }
  }, [destinations.length, isLoading]);

  // Filter destinations to show only active ones
  const activeDestinations = destinations.filter(dest => dest.status === 'active');

  // Get unique regions from destinations
  const availableRegions = Array.from(new Set(activeDestinations.map(dest => dest.region).filter(Boolean)));

  // Helper function to get region display name
  const getRegionDisplayName = (region: string) => {
    return region.charAt(0).toUpperCase() + region.slice(1);
  };



  const activities = [
    {
      name: 'Qaaci Music',
      description: 'Traditional Somali music and dance performances showcasing local cultural heritage.',
      icon: '🎵'
    },
    {
      name: 'Cultural Tours',
      description: 'Guided tours through historical sites and traditional communities.',
      icon: '🏛️'
    },
    {
      name: 'Beach Activities',
      description: 'Swimming, snorkeling, and water sports in pristine coastal waters.',
      icon: '🏊‍♂️'
    },
    {
      name: 'Photography',
      description: 'Capture stunning landscapes, wildlife, and cultural moments.',
      icon: '📸'
    },
    {
      name: 'Local Cuisine',
      description: 'Experience authentic Somali dishes and traditional cooking methods.',
      icon: '🍽️'
    },
    {
      name: 'Nature Walks',
      description: 'Explore diverse ecosystems and natural landscapes.',
      icon: '🚶‍♂️'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold ${brandClasses.text.primary} mb-4`}>
            Destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the breathtaking beauty of Puntland's diverse destinations, 
            from pristine coastlines to historic cultural sites
          </p>
        </div>



        {/* Regions and Destinations */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29520]"></div>
            <p className="mt-4 text-gray-600">Loading destinations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error loading destinations</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => DataService.fetchDestinations()}
              className={`${brandClasses.bg.secondary} text-white px-6 py-2 rounded-lg ${brandClasses.hover.secondary} transition-colors`}
            >
              Try Again
            </button>
          </div>
        ) : activeDestinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <p className="text-lg font-semibold">No destinations found</p>
              <p className="text-sm">Check back later for new destinations.</p>
            </div>
          </div>
        ) : (
          availableRegions.map((regionName) => {
          const regionDestinations = activeDestinations.filter(dest => dest.region === regionName);
          
          if (regionDestinations.length === 0) return null;
          
          return (
            <div key={regionName} className="mb-16">
            <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-4`}>{getRegionDisplayName(regionName)}</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Discover the unique destinations in {getRegionDisplayName(regionName)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regionDestinations.map((destination) => (
                  <div key={destination.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                        src={destination.images && destination.images.length > 0 ? destination.images[0] : 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={destination.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`${brandClasses.bg.secondary} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                          {destination.region}
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
                    <h3 className={`text-2xl font-bold ${brandClasses.text.primary} mb-3`}>{destination.name}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {destination.description || 'Experience the beauty and culture of this amazing destination.'}
                      </p>

                      {destination.highlights && destination.highlights.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`font-semibold ${brandClasses.text.primary} mb-2`}>Highlights:</h4>
                          <div className="flex flex-wrap gap-2">
                            {destination.highlights.slice(0, 4).map((highlight: string, index: number) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {highlight}
                              </span>
                            ))}
                          </div>
                      </div>
                      )}

                      <div className="flex items-center justify-between">
                        <a
                          href="/packages"
                          className={`${brandClasses.bg.tertiary} text-white px-6 py-2 rounded-lg ${brandClasses.hover.primary} transition-colors font-medium`}
                        >
                          View Packages
                        </a>
                        {destination.images && destination.images.length > 0 && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Camera className="h-4 w-4 mr-1" />
                            {destination.images.length} photo{destination.images.length !== 1 ? 's' : ''}
                    </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            </div>
          );
        })
        )}

        {/* Activities Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-6 text-center`}>
            Activities & Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div key={index} className={`text-center p-4 rounded-xl ${brandClasses.gradient.secondary} text-white`}>
                <div className="text-4xl mb-3">{activity.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                <p className="text-sm opacity-90">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className={`text-3xl font-bold ${brandClasses.text.primary} mb-6 text-center`}>
            Explore Puntland
          </h2>
          <div className={`${brandClasses.gradient.secondary} rounded-xl p-8 text-white text-center`}>
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-4">Interactive Map Coming Soon</h3>
            <p className="text-lg opacity-90 mb-6">
              We're developing an interactive map to help you explore all destinations in Puntland. 
              Contact us for detailed location information and directions.
            </p>
            <button
              onClick={() => window.open('https://wa.me/252907797695?text=Hi! I need directions and location information for destinations in Puntland.', '_blank')}
              className={`bg-white ${brandClasses.text.primary} px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors`}
            >
              Get Directions
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`${brandClasses.bg.primary} text-white rounded-2xl p-8 text-center mb-8`}>
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Puntland?</h2>
          <p className="text-xl mb-6 opacity-90">
            Let our local experts help you discover the hidden gems of these beautiful destinations
          </p>
          <button
            onClick={() => window.open('https://wa.me/252907797695?text=Hi! I want to explore Puntland destinations. Can you help me plan my trip?', '_blank')}
            className={`${brandClasses.bg.secondary} text-white px-8 py-3 rounded-full font-semibold ${brandClasses.hover.secondary} transition-colors`}
          >
            Start Planning Your Journey
          </button>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default DestinationsPage;