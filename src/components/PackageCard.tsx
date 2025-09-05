import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Users, ArrowRight } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';

interface PackageCardProps {
  pkg: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_days: number | null;
    max_participants: number | null;
    category: string;
    highlights?: string[] | null;
    included_services?: string[] | null;
    images?: string[] | null;
  };
  showBookNow?: boolean;
  className?: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ 
  pkg, 
  showBookNow = true, 
  className = "" 
}) => {


  // Helper function to get duration display
  const getDurationDisplay = (days: number | null) => {
    if (!days) return 'Flexible';
    return days === 1 ? '1 Day' : `${days} Days`;
  };

  // Helper function to get rating (we'll use a default rating for now)
  const getRating = (packageName: string) => {
    // Simple hash-based rating for consistency
    const hash = packageName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return (4.5 + (Math.abs(hash) % 50) / 100).toFixed(1);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${className}`}>
      <div className="relative">
        <img
          src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={pkg.name}
          className="w-full h-64 object-cover"
        />

        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-bold text-white">{getRating(pkg.name)}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className={`text-2xl font-bold ${brandClasses.text.primary} mb-2`}>{pkg.name}</h3>
        <p className="text-gray-600 mb-4">{pkg.description || 'Experience the beauty of this amazing destination with our carefully crafted tour package.'}</p>

        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-gray-500">
            <Clock className={`h-4 w-4 ${brandClasses.text.secondary} mr-1`} />
            <span>{getDurationDisplay(pkg.duration_days)}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`font-semibold ${brandClasses.text.primary} mb-2`}>Highlights:</h4>
          <div className="flex flex-wrap gap-2">
            {pkg.highlights && pkg.highlights.map((highlight, index) => (
              <span key={index} className={`${brandClasses.bg.secondary} bg-opacity-10 ${brandClasses.text.secondary} px-2 py-1 rounded-full text-sm`}>
                {highlight}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className={`font-semibold ${brandClasses.text.primary} mb-2`}>Includes:</h4>
          <div className="grid grid-cols-2 gap-1">
            {pkg.included_services && pkg.included_services.map((item, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className={`w-1 h-1 ${brandClasses.bg.secondary} rounded-full mr-2`}></div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className={`text-3xl font-bold ${brandClasses.text.secondary}`}>${pkg.price}</span>
            <span className="text-gray-500"> per person</span>
          </div>
          {showBookNow ? (
            <Link
              to={`/book/package-${pkg.id}`}
              className={`${brandClasses.bg.tertiary} text-white px-6 py-2 rounded-full font-semibold ${brandClasses.hover.primary} transition-colors inline-flex items-center`}
            >
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <button className={`${brandClasses.bg.tertiary} text-white px-6 py-2 rounded-full font-semibold ${brandClasses.hover.primary} transition-colors inline-flex items-center`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
