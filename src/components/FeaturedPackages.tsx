import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { brandClasses } from '@/styles/designSystem';
import { usePackages, usePackagesLoading, usePackagesError } from '@/stores/appStore';
import { DataService } from '@/services/dataService';
import PackageCard from './PackageCard';

const FeaturedPackages = () => {
  // Get real data from Supabase via Zustand store
  const packages = usePackages();
  const isLoading = usePackagesLoading();
  const error = usePackagesError();

  // Load packages data on component mount
  useEffect(() => {
    if (packages.length === 0) {
      DataService.fetchPackages(1, 50); // Fetch first 50 packages
    }
  }, [packages.length]);

  // Filter to show only the first 3 packages as "featured"
  const featuredPackages = packages.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold ${brandClasses.text.primary} mb-4`}>Featured Tour Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Carefully crafted experiences that showcase the best of Puntland's natural beauty and cultural heritage
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29520]"></div>
            <p className="mt-4 text-gray-600">Loading featured packages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error loading packages</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => DataService.fetchPackages(1, 50)}
              className={`${brandClasses.bg.secondary} text-white px-6 py-2 rounded-lg ${brandClasses.hover.secondary} transition-colors`}
            >
              Try Again
            </button>
          </div>
        ) : featuredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <p className="text-lg font-semibold">No packages available</p>
              <p className="text-sm">Check back later for new packages.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} showBookNow={true} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/packages"
            className={`${brandClasses.bg.secondary} text-white px-8 py-3 rounded-full font-semibold text-lg ${brandClasses.hover.secondary} transition-colors inline-flex items-center`}
          >
            View All Packages <MapPin className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPackages;