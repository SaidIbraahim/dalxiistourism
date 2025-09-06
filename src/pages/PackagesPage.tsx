import React, { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { usePackages, usePackagesLoading, usePackagesError } from '../stores/appStore';
import { brandClasses } from '../styles/designSystem';
import PackageCard from '../components/PackageCard';

const PackagesPage = () => {
  // Get real data from Supabase via Zustand store
  const packages = usePackages();
  const isLoading = usePackagesLoading();
  const error = usePackagesError();

  // Data is pre-loaded by DataPreloader, no need to fetch here

  // Filter packages to show only active ones
  const activePackages = packages.filter(pkg => pkg.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-bold ${brandClasses.text.primary} mb-4`}>
            Tour Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover Puntland's hidden gems with our carefully crafted tour packages, 
            designed to showcase the region's natural beauty and cultural heritage
          </p>
        </div>



        {/* Packages Grid */}
        {isLoading && packages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29520]"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error loading packages</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className={`${brandClasses.bg.secondary} text-white px-6 py-2 rounded-lg ${brandClasses.hover.secondary} transition-colors`}
            >
              Reload Page
            </button>
          </div>
        ) : activePackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <p className="text-lg font-semibold">No packages found</p>
              <p className="text-sm">Check back later for new packages.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {activePackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} showBookNow={true} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className={`${brandClasses.bg.primary} text-white rounded-2xl p-8 text-center mb-6`}>
          <h2 className="text-3xl font-bold mb-4">Need a Custom Package?</h2>
          <p className="text-xl mb-6 opacity-90">
            We can create personalized tour packages based on your preferences and requirements
          </p>
          <button
            onClick={() => window.open('https://wa.me/252907793854?text=Hi! I would like to discuss a custom tour package.', '_blank')}
            className={`${brandClasses.bg.secondary} text-white px-8 py-3 rounded-full font-semibold ${brandClasses.hover.secondary} transition-colors`}
          >
            Contact for Custom Package
          </button>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default PackagesPage;