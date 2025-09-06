import { supabase, storage } from '../lib/supabase';
import type { Tables, Inserts, Updates } from '../lib/supabase';

// API Response Format as per REQUIREMENTS.md
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Error Codes as per REQUIREMENTS.md
export enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  URL_GENERATION_FAILED = 'URL_GENERATION_FAILED'
}

// Helper function to create API response
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  pagination?: { page: number; limit: number; total: number; totalPages: number }
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    pagination,
    timestamp: new Date().toISOString()
  };
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): { code: string; message: string; details?: any } {
  if (error.code === 'PGRST116') {
    return { code: ErrorCodes.UNAUTHORIZED, message: 'Authentication required' };
  }
  if (error.code === '23505') {
    return { code: ErrorCodes.VALIDATION_ERROR, message: 'Duplicate entry found' };
  }
  if (error.code === '23503') {
    return { code: ErrorCodes.BUSINESS_RULE_VIOLATION, message: 'Referenced record not found' };
  }
  return { code: ErrorCodes.DATABASE_ERROR, message: error.message || 'Database error occurred' };
}

// Authentication Service
export class AuthService {
  static async login(email: string, password: string): Promise<ApiResponse<{ user: any; session: any }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return createApiResponse(false, undefined, {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: error.message
        });
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Login failed',
        details: error.message
      });
    }
  }

  static async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return createApiResponse(false, undefined, {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Logout failed'
        });
      }
      return createApiResponse(true);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Logout failed',
        details: error.message
      });
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return createApiResponse(false, undefined, {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'User not authenticated'
        });
      }
      return createApiResponse(true, user);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to get current user',
        details: error.message
      });
    }
  }
}

// Tour Packages Service
export class TourPackagesService {
  static async getPackages(page: number = 1, limit: number = 10): Promise<ApiResponse<Tables<'tour_packages'>[]>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('tour_packages')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        return createApiResponse<Tables<'tour_packages'>[]>(false, undefined, handleSupabaseError(error));
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;
      const pagination = { page, limit, total: count || 0, totalPages };

      return createApiResponse(true, data, undefined, pagination);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch tour packages',
        details: error.message
      });
    }
  }

  static async getPackage(id: string): Promise<ApiResponse<Tables<'tour_packages'>>> {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createApiResponse<Tables<'tour_packages'>>(false, undefined, {
            code: ErrorCodes.RESOURCE_NOT_FOUND,
            message: 'Tour package not found'
          });
        }
        return createApiResponse<Tables<'tour_packages'>>(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse<Tables<'tour_packages'>>(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch tour package',
        details: error.message
      });
    }
  }

  static async createPackage(packageData: Inserts<'tour_packages'>): Promise<ApiResponse<Tables<'tour_packages'>>> {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .insert(packageData)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to create tour package',
        details: error.message
      });
    }
  }

  static async updatePackage(id: string, packageData: Updates<'tour_packages'>): Promise<ApiResponse<Tables<'tour_packages'>>> {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .update({ ...packageData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update tour package',
        details: error.message
      });
    }
  }

  static async deletePackage(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tour_packages')
        .delete()
        .eq('id', id);

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to delete tour package',
        details: error.message
      });
    }
  }

  static async searchPackages(query: string): Promise<ApiResponse<Tables<'tour_packages'>[]>> {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to search tour packages',
        details: error.message
      });
    }
  }
}

// Bookings Service
export class BookingsService {
  static async getBookings(page: number = 1, limit: number = 10): Promise<ApiResponse<Tables<'bookings'>[]>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('bookings')
        .select(`
          *,
          tour_packages:package_id(name),
          destinations:destination_id(name)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;
      const pagination = { page, limit, total: count || 0, totalPages };

      return createApiResponse(true, data, undefined, pagination);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch bookings',
        details: error.message
      });
    }
  }

  static async createBooking(bookingData: Inserts<'bookings'>): Promise<ApiResponse<Tables<'bookings'>>> {
    try {
      console.log('📝 BookingsService: Creating booking with data:', bookingData);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      console.log('📝 BookingsService: Supabase response:', { data, error });

      if (error) {
        console.error('📝 BookingsService: Supabase error:', error);
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      console.log('📝 BookingsService: Booking created successfully:', data);
      return createApiResponse(true, data);
    } catch (error: any) {
      console.error('📝 BookingsService: Exception:', error);
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to create booking',
        details: error.message
      });
    }
  }

  static async updateBookingStatus(id: string, status: Tables<'bookings'>['status']): Promise<ApiResponse<Tables<'bookings'>>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update booking status',
        details: error.message
      });
    }
  }
}

// Financial Service
export class FinancialService {
  static async getIncome(page: number = 1, limit: number = 10): Promise<ApiResponse<Tables<'income'>[]>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('income')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('date', { ascending: false });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;
      const pagination = { page, limit, total: count || 0, totalPages };

      return createApiResponse(true, data, undefined, pagination);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch income records',
        details: error.message
      });
    }
  }

  static async getExpenses(page: number = 1, limit: number = 10): Promise<ApiResponse<Tables<'expenses'>[]>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('date', { ascending: false });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;
      const pagination = { page, limit, total: count || 0, totalPages };

      return createApiResponse(true, data, undefined, pagination);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch expense records',
        details: error.message
      });
    }
  }

  static async getFinancialReports(page: number = 1, limit: number = 10): Promise<ApiResponse<Tables<'financial_reports'>[]>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('financial_reports')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        return createApiResponse<Tables<'financial_reports'>[]>(false, undefined, handleSupabaseError(error));
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;
      const pagination = { page, limit, total: count || 0, totalPages };

      return createApiResponse(true, data, undefined, pagination);
    } catch (error: any) {
      return createApiResponse<Tables<'financial_reports'>[]>(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch financial reports',
        details: error.message
      });
    }
  }

  static async exportData(type: 'income' | 'expenses' | 'reports'): Promise<ApiResponse<Blob>> {
    try {
      let data: any[] = [];
      
      switch (type) {
        case 'income':
          const { data: incomeData } = await supabase.from('income').select('*');
          data = incomeData || [];
          break;
        case 'expenses':
          const { data: expenseData } = await supabase.from('expenses').select('*');
          data = expenseData || [];
          break;
        case 'reports':
          const { data: reportData } = await supabase.from('financial_reports').select('*');
          data = reportData || [];
          break;
      }

      // Convert to CSV format
      const csvContent = this.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });

      return createApiResponse(true, blob);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to export data',
        details: error.message
      });
    }
  }

  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}

// Services Service
export class ServicesService {
  static async getServices(): Promise<ApiResponse<Tables<'services'>[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data || []);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch services',
        details: error.message
      });
    }
  }

  static async createService(serviceData: Inserts<'services'>): Promise<ApiResponse<Tables<'services'>>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to create service',
        details: error.message
      });
    }
  }

  static async updateService(id: string, updates: Updates<'services'>): Promise<ApiResponse<Tables<'services'>>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update service',
        details: error.message
      });
    }
  }

  static async deleteService(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to delete service',
        details: error.message
      });
    }
  }
}

// Destinations Service
export class DestinationsService {
  static async getDestinations(): Promise<ApiResponse<Tables<'destinations'>[]>> {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch destinations',
        details: error.message
      });
    }
  }

  static async createDestination(destinationData: Inserts<'destinations'>): Promise<ApiResponse<Tables<'destinations'>>> {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .insert(destinationData)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to create destination',
        details: error.message
      });
    }
  }

  static async updateDestination(id: string, destinationData: Updates<'destinations'>): Promise<ApiResponse<Tables<'destinations'>>> {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .update(destinationData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update destination',
        details: error.message
      });
    }
  }

  static async deleteDestination(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to delete destination',
        details: error.message
      });
    }
  }
}

export class StorageService {
  // Upload tourism images (destinations, packages, etc.)
  static async uploadTourismImage(file: File, path: string) {
    try {
      const result = await storage.uploadTourismImage(file, path);
      return createApiResponse<string>(true, result.publicUrl);
    } catch (error: any) {
      return createApiResponse<string>(false, undefined, {
        code: ErrorCodes.UPLOAD_FAILED,
        message: 'Failed to upload image',
        details: error
      });
    }
  }

  // Upload avatar image
  static async uploadAvatar(file: File, path: string) {
    try {
      const result = await storage.uploadAvatar(file, path);
      return createApiResponse<string>(true, result.publicUrl);
    } catch (error: any) {
      return createApiResponse<string>(false, undefined, {
        code: ErrorCodes.UPLOAD_FAILED,
        message: 'Failed to upload avatar',
        details: error
      });
    }
  }

  // Upload receipt/document
  static async uploadReceipt(file: File, path: string) {
    try {
      const result = await storage.uploadReceipt(file, path);
      return createApiResponse<any>(true, result.data);
    } catch (error: any) {
      return createApiResponse<any>(false, undefined, {
        code: ErrorCodes.UPLOAD_FAILED,
        message: 'Failed to upload receipt',
        details: error
      });
    }
  }

  // Delete file from storage
  static async deleteFile(bucket: string, path: string) {
    try {
      await storage.deleteFile(bucket, path);
      return createApiResponse<void>(true);
    } catch (error: any) {
      return createApiResponse<void>(false, undefined, {
        code: ErrorCodes.DELETE_FAILED,
        message: 'Failed to delete file',
        details: error
      });
    }
  }

  // Get public URL for tourism images and avatars
  static getPublicUrl(bucket: 'tourism-images' | 'avatars', path: string) {
    try {
      const publicUrl = storage.getPublicUrl(bucket, path);
      return createApiResponse<string>(true, publicUrl);
    } catch (error: any) {
      return createApiResponse<string>(false, undefined, {
        code: ErrorCodes.URL_GENERATION_FAILED,
        message: 'Failed to generate public URL',
        details: error
      });
    }
  }
}
