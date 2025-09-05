import { useAppStore } from '../stores/appStore';
import {
  TourPackagesService,
  BookingsService,
  DestinationsService,
  ServicesService,
  FinancialService,
  AuthService,
  StorageService,
  type ApiResponse
} from './api';
import type { Tables, Inserts, Updates } from '../lib/supabase';
import { fallbackPackages, fallbackDestinations, fallbackServices } from '../data/fallbackData';
import { cacheService } from './CacheService';

// Data Service class that integrates API calls with Zustand store
export class DataService {
  private static store = useAppStore.getState();

  // Tour Packages
  static async fetchPackages(page: number = 1, limit: number = 10, forceRefresh: boolean = false) {
    const cacheKey = `packages_${page}_${limit}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        console.log('📦 DataService: Using cached packages data');
        this.store.setPackages(cachedData);
        return {
          success: true,
          data: cachedData,
          timestamp: new Date().toISOString()
        };
      }
    }

    this.store.setLoading('packages', true);
    this.store.setError('packages', null);

    try {
      console.log('📦 DataService: Fetching packages from API...');
      
      // Add timeout to prevent hanging (increased to 30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const response = await Promise.race([
        TourPackagesService.getPackages(page, limit),
        timeoutPromise
      ]) as any;
      
      console.log('📦 DataService: Packages response:', response);
      
      if (response.success && response.data) {
        // Cache the successful response
        cacheService.set(cacheKey, response.data, 10 * 60 * 1000); // 10 minutes cache
        this.store.setPackages(response.data);
        console.log('📦 DataService: Packages loaded successfully:', response.data.length);
        return response;
      } else {
        console.error('📦 DataService: Failed to fetch packages:', response.error);
        this.store.setError('packages', response.error?.message || 'Failed to fetch packages');
        return response;
      }
    } catch (error: any) {
      console.error('📦 DataService: Packages fetch error:', error);
      
      // If it's a timeout or network error, try to use cached data or fallback
      if (error.message === 'Request timeout' || error.message.includes('fetch')) {
        console.log('📦 DataService: Using cached packages data as fallback');
        const cachedPackages = this.store.packages;
        if (cachedPackages && cachedPackages.length > 0) {
          console.log('📦 DataService: Using cached packages:', cachedPackages.length);
          return {
            success: true,
            data: cachedPackages,
            timestamp: new Date().toISOString()
          };
        } else {
          console.log('📦 DataService: Using fallback packages data');
          this.store.setPackages(fallbackPackages as any);
          return {
            success: true,
            data: fallbackPackages as any,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      this.store.setError('packages', error.message || 'Failed to fetch packages');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('packages', false);
    }
  }

  static async createPackage(packageData: Inserts<'tour_packages'>) {
    this.store.setLoading('packages', true);
    this.store.setError('packages', null);

    try {
      const response = await TourPackagesService.createPackage(packageData);
      
      if (response.success && response.data) {
        this.store.addPackage(response.data);
        return response;
      } else {
        this.store.setError('packages', response.error?.message || 'Failed to create package');
        return response;
      }
    } catch (error: any) {
      this.store.setError('packages', error.message || 'Failed to create package');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('packages', false);
    }
  }

  static async updatePackage(id: string, updates: Updates<'tour_packages'>) {
    this.store.setLoading('packages', true);
    this.store.setError('packages', null);

    try {
      const response = await TourPackagesService.updatePackage(id, updates);
      
      if (response.success && response.data) {
        this.store.updatePackage(id, updates);
        return response;
      } else {
        this.store.setError('packages', response.error?.message || 'Failed to update package');
        return response;
      }
    } catch (error: any) {
      this.store.setError('packages', error.message || 'Failed to update package');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('packages', false);
    }
  }

  static async deletePackage(id: string) {
    this.store.setLoading('packages', true);
    this.store.setError('packages', null);

    try {
      const response = await TourPackagesService.deletePackage(id);
      
      if (response.success) {
        this.store.removePackage(id);
        return response;
      } else {
        this.store.setError('packages', response.error?.message || 'Failed to delete package');
        return response;
      }
    } catch (error: any) {
      this.store.setError('packages', error.message || 'Failed to delete package');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('packages', false);
    }
  }

  static async searchPackages(query: string) {
    this.store.setLoading('packages', true);
    this.store.setError('packages', null);

    try {
      const response = await TourPackagesService.searchPackages(query);
      
      if (response.success && response.data) {
        this.store.setPackages(response.data);
        return response;
      } else {
        this.store.setError('packages', response.error?.message || 'Failed to search packages');
        return response;
      }
    } catch (error: any) {
      this.store.setError('packages', error.message || 'Failed to search packages');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('packages', false);
    }
  }

  // Bookings
  static async fetchBookings(page: number = 1, limit: number = 10) {
    this.store.setLoading('bookings', true);
    this.store.setError('bookings', null);

    try {
      const response = await BookingsService.getBookings(page, limit);
      
      if (response.success && response.data) {
        this.store.setBookings(response.data);
        return response;
      } else {
        this.store.setError('bookings', response.error?.message || 'Failed to fetch bookings');
        return response;
      }
    } catch (error: any) {
      this.store.setError('bookings', error.message || 'Failed to fetch bookings');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('bookings', false);
    }
  }

  static async createBooking(bookingData: Inserts<'bookings'>) {
    this.store.setLoading('bookings', true);
    this.store.setError('bookings', null);

    try {
      const response = await BookingsService.createBooking(bookingData);
      
      if (response.success && response.data) {
        this.store.addBooking(response.data);
        return response;
      } else {
        this.store.setError('bookings', response.error?.message || 'Failed to create booking');
        return response;
      }
    } catch (error: any) {
      this.store.setError('bookings', error.message || 'Failed to create booking');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('bookings', false);
    }
  }

  static async updateBookingStatus(id: string, status: Tables<'bookings'>['status']) {
    this.store.setLoading('bookings', true);
    this.store.setError('bookings', null);

    try {
      const response = await BookingsService.updateBookingStatus(id, status);
      
      if (response.success && response.data) {
        this.store.updateBooking(id, { status });
        return response;
      } else {
        this.store.setError('bookings', response.error?.message || 'Failed to update booking status');
        return response;
      }
    } catch (error: any) {
      this.store.setError('bookings', error.message || 'Failed to update booking status');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('bookings', false);
    }
  }



  // Destinations
  static async fetchDestinations(forceRefresh: boolean = false) {
    const cacheKey = 'destinations';
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        console.log('🏝️ DataService: Using cached destinations data');
        this.store.setDestinations(cachedData);
        return {
          success: true,
          data: cachedData,
          timestamp: new Date().toISOString()
        };
      }
    }

    this.store.setLoading('destinations', true);
    this.store.setError('destinations', null);

    try {
      console.log('🏝️ DataService: Fetching destinations from API...');
      
      // Add timeout to prevent hanging (increased to 30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const response = await Promise.race([
        DestinationsService.getDestinations(),
        timeoutPromise
      ]) as any;
      
      console.log('🏝️ DataService: Destinations response:', response);
      
      if (response.success && response.data) {
        // Cache the successful response
        cacheService.set(cacheKey, response.data, 15 * 60 * 1000); // 15 minutes cache
        this.store.setDestinations(response.data);
        console.log('🏝️ DataService: Destinations loaded successfully:', response.data.length);
        return response;
      } else {
        console.error('🏝️ DataService: Failed to fetch destinations:', response.error);
        this.store.setError('destinations', response.error?.message || 'Failed to fetch destinations');
        return response;
      }
    } catch (error: any) {
      console.error('🏝️ DataService: Destinations fetch error:', error);
      
      // If it's a timeout or network error, try to use cached data or fallback
      if (error.message === 'Request timeout' || error.message.includes('fetch')) {
        console.log('🏝️ DataService: Using cached destinations data as fallback');
        const cachedDestinations = this.store.destinations;
        if (cachedDestinations && cachedDestinations.length > 0) {
          console.log('🏝️ DataService: Using cached destinations:', cachedDestinations.length);
          return {
            success: true,
            data: cachedDestinations,
            timestamp: new Date().toISOString()
          };
        } else {
          console.log('🏝️ DataService: Using fallback destinations data');
          this.store.setDestinations(fallbackDestinations as any);
          return {
            success: true,
            data: fallbackDestinations as any,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      this.store.setError('destinations', error.message || 'Failed to fetch destinations');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('destinations', false);
    }
  }

  static async createDestination(destinationData: Inserts<'destinations'>) {
    this.store.setLoading('destinations', true);
    this.store.setError('destinations', null);

    try {
      const response = await DestinationsService.createDestination(destinationData);
      
      if (response.success && response.data) {
        this.store.addDestination(response.data);
        return response;
      } else {
        this.store.setError('destinations', response.error?.message || 'Failed to create destination');
        return response;
      }
    } catch (error: any) {
      this.store.setError('destinations', error.message || 'Failed to create destination');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('destinations', false);
    }
  }

  static async updateDestination(id: string, updates: Updates<'destinations'>) {
    this.store.setLoading('destinations', true);
    this.store.setError('destinations', null);

    try {
      const response = await DestinationsService.updateDestination(id, updates);
      
      if (response.success && response.data) {
        this.store.updateDestination(id, updates);
        return response;
      } else {
        this.store.setError('destinations', response.error?.message || 'Failed to update destination');
        return response;
      }
    } catch (error: any) {
      this.store.setError('destinations', error.message || 'Failed to update destination');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('destinations', false);
    }
  }

  static async deleteDestination(id: string) {
    this.store.setLoading('destinations', true);
    this.store.setError('destinations', null);

    try {
      const response = await DestinationsService.deleteDestination(id);
      
      if (response.success) {
        this.store.removeDestination(id);
        return response;
      } else {
        this.store.setError('destinations', response.error?.message || 'Failed to delete destination');
        return response;
      }
    } catch (error: any) {
      this.store.setError('destinations', error.message || 'Failed to delete destination');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('destinations', false);
    }
  }

  // Services
  static async fetchServices() {
    this.store.setLoading('services', true);
    this.store.setError('services', null);

    try {
      const response = await ServicesService.getServices();
      
      if (response.success && response.data) {
        this.store.setServices(response.data);
        return response;
      } else {
        this.store.setError('services', response.error?.message || 'Failed to fetch services');
        return response;
      }
    } catch (error: any) {
      this.store.setError('services', error.message || 'Failed to fetch services');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('services', false);
    }
  }

  static async createService(serviceData: Inserts<'services'>) {
    this.store.setLoading('services', true);
    this.store.setError('services', null);

    try {
      const response = await ServicesService.createService(serviceData);
      
      if (response.success && response.data) {
        this.store.addService(response.data);
        return response;
      } else {
        this.store.setError('services', response.error?.message || 'Failed to create service');
        return response;
      }
    } catch (error: any) {
      this.store.setError('services', error.message || 'Failed to create service');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('services', false);
    }
  }

  static async updateService(id: string, updates: Updates<'services'>) {
    this.store.setLoading('services', true);
    this.store.setError('services', null);

    try {
      const response = await ServicesService.updateService(id, updates);
      
      if (response.success && response.data) {
        this.store.updateService(id, response.data);
        return response;
      } else {
        this.store.setError('services', response.error?.message || 'Failed to update service');
        return response;
      }
    } catch (error: any) {
      this.store.setError('services', error.message || 'Failed to update service');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('services', false);
    }
  }

  static async deleteService(id: string) {
    this.store.setLoading('services', true);
    this.store.setError('services', null);

    try {
      const response = await ServicesService.deleteService(id);
      
      if (response.success) {
        this.store.removeService(id);
        return response;
      } else {
        this.store.setError('services', response.error?.message || 'Failed to delete service');
        return response;
      }
    } catch (error: any) {
      this.store.setError('services', error.message || 'Failed to delete service');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('services', false);
    }
  }

  // Financial Data
  static async fetchIncome(page: number = 1, limit: number = 10) {
    this.store.setLoading('financial', true);
    this.store.setError('financial', null);

    try {
      const response = await FinancialService.getIncome(page, limit);
      
      if (response.success && response.data) {
        this.store.setIncome(response.data);
        return response;
      } else {
        this.store.setError('financial', response.error?.message || 'Failed to fetch income');
        return response;
      }
    } catch (error: any) {
      this.store.setError('financial', error.message || 'Failed to fetch income');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('financial', false);
    }
  }

  static async fetchExpenses(page: number = 1, limit: number = 10) {
    this.store.setLoading('financial', true);
    this.store.setError('financial', null);

    try {
      const response = await FinancialService.getExpenses(page, limit);
      
      if (response.success && response.data) {
        this.store.setExpenses(response.data);
        return response;
      } else {
        this.store.setError('financial', response.error?.message || 'Failed to fetch expenses');
        return response;
      }
    } catch (error: any) {
      this.store.setError('financial', error.message || 'Failed to fetch expenses');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('financial', false);
    }
  }

  static async fetchFinancialReports(page: number = 1, limit: number = 10) {
    this.store.setLoading('financial', true);
    this.store.setError('financial', null);

    try {
      const response = await FinancialService.getFinancialReports(page, limit);
      
      if (response.success && response.data) {
        this.store.setFinancialReports(response.data);
        return response;
      } else {
        this.store.setError('financial', response.error?.message || 'Failed to fetch financial reports');
        return response;
      }
    } catch (error: any) {
      this.store.setError('financial', error.message || 'Failed to fetch financial reports');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('financial', false);
    }
  }

  static async exportFinancialData(type: 'income' | 'expenses' | 'reports') {
    this.store.setLoading('financial', true);
    this.store.setError('financial', null);

    try {
      const response = await FinancialService.exportData(type);
      
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return response;
      } else {
        this.store.setError('financial', response.error?.message || 'Failed to export data');
        return response;
      }
    } catch (error: any) {
      this.store.setError('financial', error.message || 'Failed to export data');
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    } finally {
      this.store.setLoading('financial', false);
    }
  }

  // Authentication
  static async login(email: string, password: string) {
    try {
      const response = await AuthService.login(email, password);
      
      if (response.success && response.data) {
        const { user } = response.data;
        this.store.setUser({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          role: 'customer', // Default to customer role
          avatar_url: user.user_metadata?.avatar_url || null
        });
        this.store.setAuthenticated(true);
        this.store.setUserRole('customer');
        return response;
      } else {
        return response;
      }
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  static async logout() {
    try {
      const response = await AuthService.logout();
      
      if (response.success) {
        this.store.setUser(null);
        this.store.setAuthenticated(false);
        this.store.setUserRole(null);
        this.store.resetState();
        return response;
      } else {
        return response;
      }
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  static async getCurrentUser() {
    try {
      const response = await AuthService.getCurrentUser();
      
      if (response.success && response.data) {
        const user = response.data;
        this.store.setUser({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          role: 'customer', // Default to customer role
          avatar_url: user.user_metadata?.avatar_url || null
        });
        this.store.setAuthenticated(true);
        this.store.setUserRole('customer');
        return response;
      } else {
        return response;
      }
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Storage operations
  static async uploadTourismImage(file: File, path: string) {
    try {
      const response = await StorageService.uploadTourismImage(file, path);
      if (response.success && response.data) {
        // Update the store with the new image URL if needed
        return response;
      }
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to upload image', error };
    }
  }

  static async uploadAvatar(file: File, path: string) {
    try {
      const response = await StorageService.uploadAvatar(file, path);
      if (response.success && response.data) {
        // Update user profile with new avatar URL
        const currentUser = this.store.user;
        if (currentUser) {
          this.store.updateUser({ ...currentUser, avatar_url: response.data });
        }
        return response;
      }
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to upload avatar', error };
    }
  }

  static async uploadReceipt(file: File, path: string) {
    try {
      const response = await StorageService.uploadReceipt(file, path);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to upload receipt', error };
    }
  }

  static async deleteFile(bucket: string, path: string) {
    try {
      const response = await StorageService.deleteFile(bucket, path);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to delete file', error };
    }
  }

  static getPublicUrl(bucket: 'tourism-images' | 'avatars', path: string) {
    try {
      const response = StorageService.getPublicUrl(bucket, path);
      return response;
    } catch (error) {
      return { success: false, message: 'Failed to generate public URL', error };
    }
  }

  // Initialize all data
  static async initializeData() {
    try {
      await Promise.all([
        this.fetchPackages(),
        this.fetchBookings(),
        this.fetchDestinations(),
        this.fetchIncome(),
        this.fetchExpenses(),
        this.fetchFinancialReports()
      ]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  // Clear all data
  static clearAllData() {
    this.store.resetState();
  }
}

// Hook for using the data service
export const useDataService = () => {
  return DataService;
};
