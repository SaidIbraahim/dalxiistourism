import { BookingsService } from './api';
import { ReceiptService } from './receiptService';
import { generateBookingTicket } from './pdfGenerationService';

// Define ApiResponse interface locally
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function to create API response
function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  pagination?: { page: number; limit: number; total: number; totalPages: number }
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
    pagination
  };
}

export interface BookingActionData {
  id: string;
  customer_name: string;
  customer_email: string;
  package_name: string;
  destination?: string;
  booking_date: string;
  travel_date?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  selected_services?: any[];
  adults: number;
  children: number;
  created_at?: string;
}

export class BookingActionService {
  /**
   * View booking details - returns the booking data
   */
  static async viewBookingDetails(bookingId: string): Promise<ApiResponse<BookingActionData>> {
    try {
      // In a real implementation, you would fetch the booking details
      // For now, we'll return a mock response
      return createApiResponse(true, {
        id: bookingId,
        customer_name: 'Sample Customer',
        customer_email: 'customer@example.com',
        package_name: 'Sample Package',
        destination: 'Sample Destination',
        booking_date: new Date().toISOString(),
        travel_date: new Date().toISOString(),
        total_amount: 500,
        status: 'confirmed',
        payment_status: 'paid',
        adults: 2,
        children: 0
      });
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'VIEW_BOOKING_FAILED',
        message: 'Failed to fetch booking details',
        details: error.message
      });
    }
  }

  /**
   * Generate and view invoice/receipt
   */
  static async viewInvoice(bookingData: BookingActionData): Promise<ApiResponse<string>> {
    try {
      const receiptResponse = await ReceiptService.generateReceipt(bookingData);
      
      if (receiptResponse.success && receiptResponse.data) {
        // Open receipt in new window for viewing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(receiptResponse.data);
          printWindow.document.close();
        }
        
        const documentType = bookingData.payment_status === 'paid' ? 'Receipt' : 'Invoice';
        return createApiResponse(true, `${documentType} opened successfully`);
      } else {
        return createApiResponse(false, undefined, {
          code: 'INVOICE_GENERATION_FAILED',
          message: `Failed to generate ${bookingData.payment_status === 'paid' ? 'receipt' : 'invoice'}`,
          details: receiptResponse.error?.message
        });
      }
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'INVOICE_VIEW_FAILED',
        message: `Failed to view ${bookingData.payment_status === 'paid' ? 'receipt' : 'invoice'}`,
        details: error.message
      });
    }
  }

  /**
   * Generate and print invoice/receipt
   */
  static async printInvoice(bookingData: BookingActionData): Promise<ApiResponse<string>> {
    try {
      const receiptResponse = await ReceiptService.generateReceipt(bookingData);
      
      if (receiptResponse.success && receiptResponse.data) {
        // Open receipt in new window and trigger print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(receiptResponse.data);
          printWindow.document.close();
          
          // Wait for content to load, then trigger print
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
        
        const documentType = bookingData.payment_status === 'paid' ? 'Receipt' : 'Invoice';
        return createApiResponse(true, `${documentType} print dialog opened successfully`);
      } else {
        return createApiResponse(false, undefined, {
          code: 'INVOICE_GENERATION_FAILED',
          message: `Failed to generate ${bookingData.payment_status === 'paid' ? 'receipt' : 'invoice'}`,
          details: receiptResponse.error?.message
        });
      }
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'INVOICE_PRINT_FAILED',
        message: `Failed to print ${bookingData.payment_status === 'paid' ? 'receipt' : 'invoice'}`,
        details: error.message
      });
    }
  }

  /**
   * Generate and print ticket (show print preview)
   */
  static async printTicket(bookingData: BookingActionData): Promise<ApiResponse<string>> {
    try {
      console.log('BookingActionService.printTicket called with:', bookingData);
      
      // Validate that ticket can be printed
      if (bookingData.payment_status !== 'paid' || bookingData.status !== 'confirmed') {
        console.log('Validation failed:', { 
          payment_status: bookingData.payment_status, 
          status: bookingData.status 
        });
        return createApiResponse(false, undefined, {
          code: 'TICKET_PRINT_NOT_AVAILABLE',
          message: 'Ticket can only be printed for confirmed and paid bookings'
        });
      }

      // Get payment record information
      let paymentRecord = null;
      if (bookingData.payment_records && bookingData.payment_records.length > 0) {
        paymentRecord = bookingData.payment_records[0]; // Use the most recent payment
      }

      const ticketData = {
        bookingId: bookingData.id,
        customerName: bookingData.customer_name,
        customerEmail: bookingData.customer_email,
        packageName: bookingData.package_name,
        destinationName: bookingData.destination || 'Multiple Destinations',
        bookingDate: bookingData.booking_date,
        travelDate: bookingData.travel_date || bookingData.booking_date,
        totalAmount: bookingData.total_amount,
        status: bookingData.status,
        createdAt: bookingData.created_at || bookingData.booking_date,
        paymentMethod: paymentRecord?.payment_method || bookingData.payment_method || 'cash',
        discountType: paymentRecord?.discount_type || 'none',
        discountValue: paymentRecord?.discount_value || 0,
        payableAmount: paymentRecord?.amount || bookingData.total_amount
      };

      console.log('Ticket data prepared:', ticketData);
      
      // Generate ticket HTML for print preview
      const ticketHTML = ReceiptService.generateTicketHTML(ticketData);
      console.log('Ticket HTML generated');
      
      // Open ticket in new window and trigger print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(ticketHTML);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }

      return createApiResponse(true, 'Ticket print dialog opened successfully');
    } catch (error: any) {
      console.error('Error in BookingActionService.printTicket:', error);
      return createApiResponse(false, undefined, {
        code: 'TICKET_PRINT_FAILED',
        message: 'Failed to generate ticket',
        details: error.message
      });
    }
  }

  /**
   * Cancel or refund booking
   */
  static async cancelRefundBooking(
    bookingId: string, 
    action: 'cancel' | 'refund',
    reason?: string
  ): Promise<ApiResponse<string>> {
    try {
      let newStatus: string;
      
      if (action === 'cancel') {
        newStatus = 'cancelled';
      } else if (action === 'refund') {
        newStatus = 'cancelled'; // Refunded bookings are marked as cancelled
      } else {
        return createApiResponse(false, undefined, {
          code: 'INVALID_ACTION',
          message: 'Invalid action. Must be "cancel" or "refund"'
        });
      }

      const response = await BookingsService.updateBookingStatus(bookingId, newStatus as any);
      
      if (response.success) {
        const actionText = action === 'cancel' ? 'cancelled' : 'refunded';
        return createApiResponse(true, `Booking ${actionText} successfully`);
      } else {
        return createApiResponse(false, undefined, {
          code: 'BOOKING_UPDATE_FAILED',
          message: `Failed to ${action} booking`,
          details: response.error?.message
        });
      }
    } catch (error: any) {
      return createApiResponse(false, undefined, {
        code: 'CANCEL_REFUND_FAILED',
        message: `Failed to ${action} booking`,
        details: error.message
      });
    }
  }

  /**
   * Check if booking can be cancelled
   */
  static canCancelBooking(booking: BookingActionData): boolean {
    return ['pending', 'confirmed'].includes(booking.status);
  }

  /**
   * Check if booking can be refunded
   */
  static canRefundBooking(booking: BookingActionData): boolean {
    return booking.status === 'completed' && booking.payment_status === 'paid';
  }

  /**
   * Check if ticket can be printed
   */
  static canPrintTicket(booking: BookingActionData): boolean {
    return booking.payment_status === 'paid' && booking.status === 'confirmed';
  }
}

export default BookingActionService;
