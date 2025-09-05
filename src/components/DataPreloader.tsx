import { useEffect } from 'react';
import { DataService } from '../services/dataService';

const DataPreloader = () => {
  useEffect(() => {
    // Pre-load essential data when the app starts
    const preloadData = async () => {
      try {
        console.log('🚀 DataPreloader: Starting data preload...');
        
        // Use Promise.allSettled to ensure both requests complete regardless of individual failures
        const results = await Promise.allSettled([
          DataService.fetchPackages(1, 50),
          DataService.fetchDestinations()
        ]);
        
        // Log results for each request
        results.forEach((result, index) => {
          const requestName = index === 0 ? 'packages' : 'destinations';
          if (result.status === 'fulfilled') {
            console.log(`✅ DataPreloader: ${requestName} loaded successfully`);
          } else {
            console.warn(`⚠️ DataPreloader: ${requestName} failed:`, result.reason);
          }
        });
        
        console.log('✅ DataPreloader: Data preload completed');
      } catch (error) {
        console.warn('⚠️ DataPreloader: Failed to pre-load some data:', error);
        // Don't show error to user as this is background loading
      }
    };

    // Add a small delay to prevent blocking the initial render
    const timeoutId = setTimeout(preloadData, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // This component doesn't render anything
  return null;
};

export default DataPreloader;
