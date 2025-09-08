import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptkletolrnqgbxouamwm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a2xldG9scm5xZ2J4b3VhbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc5NzksImV4cCI6MjA3MTIwMzk3OX0.w5PEFKFxHsgSE6RG8JoBDGpoUzI17mw7rLbU42KRwf4';

// Log configuration for debugging
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

// Simple fetch with timeout to prevent hanging
const fetchWithTimeout = async (input: RequestInfo, init?: RequestInit) => {
  const controller = new AbortController();
  const timeoutMs = 60000; // 60 seconds timeout
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } catch (error) {
    console.warn('🌐 Supabase request failed:', error.message);
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    refreshTokenRotationEnabled: true, // Enable token rotation for better security
    debug: false // Set to true for debugging auth issues
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'dalxiis-tourism-web'
    },
    fetch: (input, init) => fetchWithTimeout(input as RequestInfo, init as RequestInit)
  }
});

// Connection health check utility
export const checkSupabaseConnection = async (): Promise<{ isConnected: boolean; error?: string }> => {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.warn('⚠️ Supabase connection check failed:', error.message);
      return { isConnected: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    return { isConnected: true };
  } catch (error: any) {
    console.error('❌ Supabase connection check error:', error.message);
    return { isConnected: false, error: error.message };
  }
};

// Storage utility functions
export const storage = {
  // Upload tourism images (destinations, packages, etc.)
  uploadTourismImage: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('tourism-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tourism-images')
      .getPublicUrl(path);
    
    return { data, publicUrl };
  },

  // Upload avatar image
  uploadAvatar: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);
    
    return { data, publicUrl };
  },

  // Upload receipt/document
  uploadReceipt: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    return { data };
  },

  // Delete file from any bucket
  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  },

  // Get public URL for tourism images and avatars
  getPublicUrl: (bucket: 'tourism-images' | 'avatars', path: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  }
};

// Database schema types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'superadmin' | 'admin' | 'staff';
          avatar_url: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'superadmin' | 'admin' | 'staff';
          avatar_url?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'superadmin' | 'admin' | 'staff';
          avatar_url?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tour_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          duration_days: number | null;
          max_participants: number | null;
          category: 'basic' | 'premium' | 'vip' | 'custom';
          status: 'draft' | 'active' | 'inactive';
          highlights: string[] | null;
          included_services: string[] | null;
          excluded_services: string[] | null;
          images: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          duration_days?: number | null;
          max_participants?: number | null;
          category?: 'basic' | 'premium' | 'vip' | 'custom';
          status?: 'draft' | 'active' | 'inactive';
          highlights?: string[] | null;
          included_services?: string[] | null;
          excluded_services?: string[] | null;
          images?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_days?: number | null;
          max_participants?: number | null;
          category?: 'basic' | 'premium' | 'vip' | 'custom';
          status?: 'draft' | 'active' | 'inactive';
          highlights?: string[] | null;
          included_services?: string[] | null;
          excluded_services?: string[] | null;
          images?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          region: string;
          description: string | null;
          highlights: string[] | null;
          images: string[] | null;
          coordinates: any | null;
          status: 'active' | 'inactive';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          description?: string | null;
          highlights?: string[] | null;
          images?: string[] | null;
          coordinates?: any | null;
          status?: 'active' | 'inactive';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          description?: string | null;
          highlights?: string[] | null;
          images?: string[] | null;
          coordinates?: any | null;
          status?: 'active' | 'inactive';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          package_id: string | null;
          destination_id: string | null;
          booking_date: string;
          end_date: string | null;
          participants: number;
          adults: number;
          children: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
          payment_status: 'pending' | 'paid' | 'refunded';
          special_requests: string | null;
          gender: string | null;
          nationality: string | null;
          dietary_requirements: string | null;
          selected_services: any | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          package_id?: string | null;
          destination_id?: string | null;
          booking_date: string;
          end_date?: string | null;
          participants?: number;
          adults?: number;
          children?: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
          payment_status?: 'pending' | 'paid' | 'refunded';
          special_requests?: string | null;
          gender?: string | null;
          nationality?: string | null;
          dietary_requirements?: string | null;
          selected_services?: any | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          package_id?: string | null;
          destination_id?: string | null;
          booking_date?: string;
          end_date?: string | null;
          participants?: number;
          adults?: number;
          children?: number;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
          payment_status?: 'pending' | 'paid' | 'refunded';
          special_requests?: string | null;
          gender?: string | null;
          nationality?: string | null;
          dietary_requirements?: string | null;
          selected_services?: any | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          type: string;
          source: string | null;
          amount: number;
          date: string;
          status: 'pending' | 'received' | 'overdue';
          payment_method: string;
          reference: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          source?: string | null;
          amount: number;
          date: string;
          status?: 'pending' | 'received' | 'overdue';
          payment_method: string;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          source?: string | null;
          amount?: number;
          date?: string;
          status?: 'pending' | 'received' | 'overdue';
          payment_method?: string;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          status: 'pending' | 'approved' | 'rejected';
          vendor: string | null;
          receipt_url: string | null;
          approved_by: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          status?: 'pending' | 'approved' | 'rejected';
          vendor?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
          status?: 'pending' | 'approved' | 'rejected';
          vendor?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_reports: {
        Row: {
          id: string;
          period: string;
          start_date: string;
          end_date: string;
          total_income: number;
          total_expenses: number;
          net_profit: number;
          status: 'draft' | 'completed' | 'approved';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period: string;
          start_date: string;
          end_date: string;
          total_income?: number;
          total_expenses?: number;
          net_profit?: number;
          status?: 'draft' | 'completed' | 'approved';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period?: string;
          start_date?: string;
          end_date?: string;
          total_income?: number;
          total_expenses?: number;
          net_profit?: number;
          status?: 'draft' | 'completed' | 'approved';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
                     payment_records: {
                 Row: {
                   id: string;
                   booking_id: string;
                   customer_name: string;
                   amount: number;
                   payment_method: 'cash' | 'sahal' | 'e_dahab' | 'mycash' | 'bank_transfer' | 'cheque' | 'other';
                   transaction_id: string | null;
                   notes: string | null;
                   type: 'payment' | 'refund';
                   status: 'completed' | 'pending' | 'failed';
                   created_by: string | null;
                   created_at: string;
                   updated_at: string;
                 };
                 Insert: {
                   id?: string;
                   booking_id: string;
                   customer_name: string;
                   amount: number;
                   payment_method: 'cash' | 'sahal' | 'e_dahab' | 'mycash' | 'bank_transfer' | 'cheque' | 'other';
                   transaction_id?: string | null;
                   notes?: string | null;
                   type: 'payment' | 'refund';
                   status?: 'completed' | 'pending' | 'failed';
                   created_by?: string | null;
                   created_at?: string;
                   updated_at?: string;
                 };
                 Update: {
                   id?: string;
                   booking_id?: string;
                   customer_name?: string;
                   amount?: number;
                   payment_method?: 'cash' | 'sahal' | 'e_dahab' | 'mycash' | 'bank_transfer' | 'cheque' | 'other';
                   transaction_id?: string | null;
                   notes?: string | null;
                   type?: 'payment' | 'refund';
                   status?: 'completed' | 'pending' | 'failed';
                   created_by?: string | null;
                   created_at?: string;
                   updated_at?: string;
                 };
               };
               document_records: {
                 Row: {
                   id: string;
                   booking_id: string;
                   customer_name: string;
                   document_type: 'receipt' | 'ticket';
                   generated_at: string;
                   print_count: number;
                   last_printed: string | null;
                   document_url: string | null;
                   file_size: number | null;
                   status: 'active' | 'archived' | 'deleted';
                   created_by: string | null;
                   created_at: string;
                   updated_at: string;
                 };
                 Insert: {
                   id?: string;
                   booking_id: string;
                   customer_name: string;
                   document_type: 'receipt' | 'ticket';
                   generated_at?: string;
                   print_count?: number;
                   last_printed?: string | null;
                   document_url?: string | null;
                   file_size?: number | null;
                   status?: 'active' | 'archived' | 'deleted';
                   created_by?: string | null;
                   created_at?: string;
                   updated_at?: string;
                 };
                 Update: {
                   id?: string;
                   booking_id?: string;
                   customer_name?: string;
                   document_type?: 'receipt' | 'ticket';
                   generated_at?: string;
                   print_count?: number;
                   last_printed?: string | null;
                   document_url?: string | null;
                   file_size?: number | null;
                   status?: 'active' | 'archived' | 'deleted';
                   created_by?: string | null;
                   created_at?: string;
                   updated_at?: string;
                 };
               };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: any | null;
          new_values: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: 'transport' | 'guide' | 'meals' | 'activity' | 'accommodation';
          duration: string | null;
          location: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: 'transport' | 'guide' | 'meals' | 'activity' | 'accommodation';
          duration?: string | null;
          location?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: 'transport' | 'guide' | 'meals' | 'activity' | 'accommodation';
          duration?: string | null;
          location?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
