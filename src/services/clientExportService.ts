import * as XLSX from 'xlsx';
import { ClientService } from './clientService';
import { ApiResponse, createApiResponse } from './api';

// Utility function to extract package name from booking data
const getPackageName = (booking: any): string => {
  // First try to get from joined tour_packages table
  if (booking.tour_packages?.name) {
    return booking.tour_packages.name;
  }
  
  // Then try package_name field
  if (booking.package_name) {
    return booking.package_name;
  }
  
  // Finally, try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services)) {
    const packageService = booking.selected_services.find((s: any) => s.category === 'Package');
    if (packageService) return packageService.name;
    
    // If no package service, use the first service or create a summary
    if (booking.selected_services.length === 1) {
      return booking.selected_services[0].name;
    }
    if (booking.selected_services.length > 1) {
      return `${booking.selected_services.length} Services Package`;
    }
  }
  
  return 'Custom Package';
};

// Utility function to extract destination name from booking data
const getDestinationName = (booking: any): string => {
  // First try to get from joined destinations table
  if (booking.destinations?.name) {
    return booking.destinations.name;
  }
  
  // Then try destination_name field
  if (booking.destination_name) {
    return booking.destination_name;
  }
  
  // Finally, try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services)) {
    const destinations = booking.selected_services
      .map((s: any) => s.location || s.destination)
      .filter(Boolean)
      .filter((dest: any, index: number, arr: any[]) => arr.indexOf(dest) === index);
    
    if (destinations.length === 1) {
      return destinations[0];
    }
    if (destinations.length > 1) {
      return destinations.join(', ');
    }
  }
  
  return 'Multiple Destinations';
};

export interface ClientExportData {
  profile: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    gender: string;
    dietary_requirements: string;
    member_since: string;
  };
  summary: {
    total_bookings: number;
    total_spent: number;
    average_booking_value: number;
    last_booking: string | null;
  };
  bookings: any[];
  notes: any[];
  activities: any[];
}

export class ClientExportService {
  /**
   * Export client data to Excel format
   */
  static async exportClientToExcel(email: string): Promise<ApiResponse<string>> {
    try {
      // Get client data
      const clientResponse = await ClientService.getClientProfile(email);
      
      if (!clientResponse.success || !clientResponse.data) {
        return createApiResponse(false, undefined, {
          code: 'EXPORT_FAILED',
          message: 'Failed to fetch client data for export'
        });
      }

      const { profile, bookings, notes, activities } = clientResponse.data;

      // Create comprehensive export data
      const exportData: ClientExportData = {
        profile: {
          name: profile.customer_name,
          email: profile.customer_email,
          phone: profile.customer_phone || 'N/A',
          nationality: profile.nationality || 'N/A',
          gender: profile.gender || 'N/A',
          dietary_requirements: profile.dietary_requirements || 'None',
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
          package_name: getPackageName(booking),
          destination: getDestinationName(booking),
          booking_date: booking.booking_date,
          end_date: booking.end_date,
          guests: (booking.adults || 0) + (booking.children || 0),
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
          created_by: note.created_by
        })),
        activities: activities.map(activity => ({
          type: activity.type,
          description: activity.description,
          created_at: activity.created_at,
          user_name: activity.user_name
        }))
      };

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const safeName = profile.customer_name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `client_${safeName}_${timestamp}`;

      // Create comprehensive Excel export with multiple sheets
      const workbook = XLSX.utils.book_new();

      // 1. Client Profile Sheet
      const profileData = [
        ['CLIENT PROFILE'],
        ['Name', exportData.profile.name],
        ['Email', exportData.profile.email],
        ['Phone', exportData.profile.phone],
        ['Nationality', exportData.profile.nationality],
        ['Gender', exportData.profile.gender],
        ['Dietary Requirements', exportData.profile.dietary_requirements],
        ['Member Since', new Date(exportData.profile.member_since).toLocaleDateString()],
        [''],
        ['SUMMARY'],
        ['Total Bookings', exportData.summary.total_bookings],
        ['Total Spent', `$${exportData.summary.total_spent.toFixed(2)}`],
        ['Average Booking Value', `$${exportData.summary.average_booking_value.toFixed(2)}`],
        ['Last Booking', exportData.summary.last_booking ? new Date(exportData.summary.last_booking).toLocaleDateString() : 'Never']
      ];

      const profileWorksheet = XLSX.utils.aoa_to_sheet(profileData);
      profileWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, profileWorksheet, 'Client Profile');

      // 2. Bookings Sheet
      if (exportData.bookings.length > 0) {
        const bookingsData = exportData.bookings.map(booking => ({
          'Booking ID': booking.booking_id,
          'Package': booking.package_name,
          'Destination': booking.destination,
          'Booking Date': new Date(booking.booking_date).toLocaleDateString(),
          'End Date': booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A',
          'Guests': booking.guests,
          'Amount': `$${booking.amount.toFixed(2)}`,
          'Status': booking.status,
          'Payment Status': booking.payment_status,
          'Special Requests': booking.special_requests || 'None',
          'Created At': new Date(booking.created_at).toLocaleDateString()
        }));

        const bookingsWorksheet = XLSX.utils.json_to_sheet(bookingsData);
        bookingsWorksheet['!cols'] = [
          { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
          { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
        ];
        XLSX.utils.book_append_sheet(workbook, bookingsWorksheet, 'Bookings');
      }

      // 3. Notes Sheet
      if (exportData.notes.length > 0) {
        const notesData = exportData.notes.map(note => ({
          'Type': note.type,
          'Content': note.content,
          'Created At': new Date(note.created_at).toLocaleDateString(),
          'Created By': note.created_by
        }));

        const notesWorksheet = XLSX.utils.json_to_sheet(notesData);
        notesWorksheet['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, notesWorksheet, 'Notes');
      }

      // 4. Activities Sheet
      if (exportData.activities.length > 0) {
        const activitiesData = exportData.activities.map(activity => ({
          'Type': activity.type,
          'Description': activity.description,
          'Created At': new Date(activity.created_at).toLocaleDateString(),
          'User': activity.user_name
        }));

        const activitiesWorksheet = XLSX.utils.json_to_sheet(activitiesData);
        activitiesWorksheet['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, activitiesWorksheet, 'Activities');
      }

      // Generate final filename and download
      const finalFilename = `${filename}.xlsx`;
      
      // Download the file
      XLSX.writeFile(workbook, finalFilename);

      return createApiResponse(true, `Client data exported successfully as ${finalFilename}`);
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'EXPORT_FAILED',
        message: 'Failed to export client data',
        details: error.message
      });
    }
  }


}

export default ClientExportService;
