import { supabase } from '../lib/supabase';
import { ApiResponse, createApiResponse, handleSupabaseError } from './api';

export interface ClientProfile {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  nationality: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact: string | null;
  dietary_requirements: string | null;
  preferences: any | null;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  content: string;
  author: string;
  author_id: string;
  type: 'general' | 'booking' | 'payment' | 'preference';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  type: 'profile_updated' | 'booking_created' | 'payment_received' | 'note_added' | 'status_changed';
  description: string;
  metadata: any | null;
  user_id: string | null;
  user_name: string | null;
  created_at: string;
}

export class ClientService {
  // Get client profile with bookings
  static async getClientProfile(email: string): Promise<ApiResponse<{
    profile: ClientProfile;
    bookings: any[];
    notes: ClientNote[];
    activities: ClientActivity[];
  }>> {
    try {
      // Get client bookings first to extract profile info
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          tour_packages(name, description, price),
          destinations(name, region),
          payment_records(
            id,
            amount,
            payment_method,
            transaction_id,
            notes,
            type,
            status,
            discount_type,
            discount_value,
            created_at
          )
        `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Bookings error:', bookingsError);
        return createApiResponse(false, undefined, handleSupabaseError(bookingsError));
      }

      if (!bookings || bookings.length === 0) {
        return createApiResponse(false, undefined, {
          code: 'CLIENT_NOT_FOUND',
          message: 'No client found with this email'
        });
      }

      // Extract profile from first booking
      const firstBooking = bookings[0];
      const profile: ClientProfile = {
        id: email,
        customer_name: firstBooking.customer_name,
        customer_email: firstBooking.customer_email,
        customer_phone: firstBooking.customer_phone,
        nationality: firstBooking.nationality || null,
        gender: firstBooking.gender || null,
        date_of_birth: null,
        address: null,
        emergency_contact: null,
        dietary_requirements: firstBooking.dietary_requirements || null,
        preferences: null,
        created_at: firstBooking.created_at,
        updated_at: firstBooking.updated_at
      };

      // Get notes
      const { data: notes, error: notesError } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', email)
        .order('created_at', { ascending: false });

      // Get activities
      const { data: activities, error: activitiesError } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', email)
        .order('created_at', { ascending: false });

      // Log any errors but don't fail the entire request
      if (notesError) {
        console.warn('Notes error:', notesError);
      }
      if (activitiesError) {
        console.warn('Activities error:', activitiesError);
      }

      return createApiResponse(true, {
        profile,
        bookings,
        notes: notes || [],
        activities: activities || []
      });
    } catch (error: any) {
      console.error('Client profile error:', error);
      return createApiResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch client profile',
        details: error.message
      });
    }
  }

  // Update client profile
  static async updateClientProfile(email: string, updates: Partial<ClientProfile>): Promise<ApiResponse<ClientProfile>> {
    try {
      // Update all bookings with the new profile data
      const bookingUpdates: any = {};
      if (updates.customer_name) bookingUpdates.customer_name = updates.customer_name;
      if (updates.customer_phone) bookingUpdates.customer_phone = updates.customer_phone;
      if (updates.nationality) bookingUpdates.nationality = updates.nationality;
      if (updates.gender) bookingUpdates.gender = updates.gender;
      if (updates.dietary_requirements) bookingUpdates.dietary_requirements = updates.dietary_requirements;

      if (Object.keys(bookingUpdates).length > 0) {
        bookingUpdates.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update(bookingUpdates)
          .eq('customer_email', email);

        if (updateError) {
          console.error('Update error:', updateError);
          return createApiResponse(false, undefined, handleSupabaseError(updateError));
      }

      // Log activity
      await this.logActivity(email, 'profile_updated', 'Client profile updated', updates);
      }

      // Return updated profile
      const profileResponse = await this.getClientProfile(email);
      if (profileResponse.success && profileResponse.data) {
        return createApiResponse(true, profileResponse.data.profile);
      }

      return createApiResponse(false, undefined, {
        code: 'UPDATE_FAILED',
        message: 'Profile updated but failed to fetch updated data'
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return createApiResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update client profile',
        details: error.message
      });
    }
  }

  // Add note
  static async addNote(clientId: string, note: Omit<ClientNote, 'id' | 'client_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ClientNote>> {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: clientId,
          content: note.content,
          author: note.author,
          author_id: note.author_id,
          type: note.type,
          priority: note.priority,
          tags: note.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add note',
        details: error.message
      });
    }
  }

  // Update note
  static async updateNote(noteId: string, content: string): Promise<ApiResponse<ClientNote>> {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true, data);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update note',
        details: error.message
      });
    }
  }

  // Delete note
  static async deleteNote(noteId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        return createApiResponse(false, undefined, handleSupabaseError(error));
      }

      return createApiResponse(true);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete note',
        details: error.message
      });
    }
  }

  // Log activity
  static async logActivity(
    clientId: string, 
    type: ClientActivity['type'], 
    description: string, 
    metadata?: any,
    userId?: string,
    userName?: string
  ): Promise<void> {
    try {
      await supabase
        .from('client_activities')
        .insert({
          client_id: clientId,
          type,
          description,
          metadata,
          user_id: userId || null,
          user_name: userName || 'System',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Export client data
  static async exportClientData(email: string): Promise<ApiResponse<Blob>> {
    try {
      const profileResponse = await this.getClientProfile(email);
      if (!profileResponse.success || !profileResponse.data) {
        return createApiResponse(false, undefined, {
          code: 'EXPORT_FAILED',
          message: 'Failed to fetch client data for export'
        });
      }

      const { profile, bookings, notes, activities } = profileResponse.data;

      // Create comprehensive export data
      const exportData = {
        profile: {
          name: profile.customer_name,
          email: profile.customer_email,
          phone: profile.customer_phone,
          nationality: profile.nationality,
          gender: profile.gender,
          dietary_requirements: profile.dietary_requirements,
          member_since: profile.created_at
        },
        summary: {
          total_bookings: bookings.length,
          total_spent: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
          average_booking_value: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length : 0,
          last_booking: bookings.length > 0 ? bookings[0].booking_date : null
        },
        bookings: bookings.map(booking => ({
          booking_id: booking.id,
          package_name: booking.package_name || 'Custom Package',
          destination: booking.destination_name,
          booking_date: booking.booking_date,
          end_date: booking.end_date,
          guests: booking.adults + booking.children,
          amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          special_requests: booking.special_requests,
          created_at: booking.created_at
        })),
        notes: notes.map(note => ({
          type: note.type,
          content: note.content,
          created_at: note.created_at,
          created_by: note.author
        })),
        activities: activities.map(activity => ({
          type: activity.type,
          description: activity.description,
          created_at: activity.created_at,
          user_name: activity.user_name
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      return createApiResponse(true, blob);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'EXPORT_FAILED',
        message: 'Failed to export client data',
        details: error.message
      });
    }
  }
}

export default ClientService;