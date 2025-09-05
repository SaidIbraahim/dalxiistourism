import React from 'react';
import { Eye, FileText, Printer, XCircle } from 'lucide-react';
import { components, componentSizes } from '../../../styles/designSystem';

interface BookingActionButtonsProps {
  booking: {
    id: string;
    status: string;
    payment_status: string;
    customer_name: string;
    customer_email: string;
    package_name: string;
    destination?: string;
    booking_date: string;
    travel_date?: string;
    total_amount: number;
    selected_services?: any[];
  };
  onViewBooking: (bookingId: string) => void;
  onViewInvoice: (bookingId: string) => void;
  onPrintInvoice: (bookingId: string) => void;
  onPrintTicket: (bookingId: string) => void;
  onCancelRefund: (bookingId: string) => void;
  className?: string;
}

const BookingActionButtons: React.FC<BookingActionButtonsProps> = ({
  booking,
  onViewBooking,
  onViewInvoice,
  onPrintInvoice,
  onPrintTicket,
  onCancelRefund,
  className = ""
}) => {
  // Helper functions for action availability
  const canPrintTicket = (booking: any) => {
    return booking.payment_status === 'paid' && booking.status === 'confirmed';
  };

  const canCancel = (booking: any) => {
    return ['pending', 'confirmed'].includes(booking.status);
  };

  const canRefund = (booking: any) => {
    return booking.status === 'completed' && booking.payment_status === 'paid';
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'view':
        return 'View booking details';
      case 'invoice':
        return booking.payment_status === 'paid' 
          ? 'View receipt' 
          : 'View invoice';
      case 'print-invoice':
        return booking.payment_status === 'paid' 
          ? 'Print receipt' 
          : 'Print invoice';
      case 'print':
        return canPrintTicket(booking) 
          ? 'Print ticket' 
          : 'Print ticket (Available for confirmed and paid bookings only)';
      case 'cancel':
        if (canCancel(booking)) return 'Cancel booking';
        if (canRefund(booking)) return 'Refund booking';
        return 'Cancel/Refund not available for this booking status';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* View Details Button */}
      <button
        title={getActionTitle('view')}
        onClick={() => onViewBooking(booking.id)}
        className={`${components.button.ghost} ${componentSizes.button.sm} hover:scale-105 transition-transform`}
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* View Invoice Button */}
      <button
        title={getActionTitle('invoice')}
        onClick={() => onViewInvoice(booking.id)}
        className={`${components.button.outline} ${componentSizes.button.sm} hover:scale-105 transition-transform`}
      >
        <FileText className="w-4 h-4" />
      </button>

      {/* Print Invoice Button */}
      <button
        title={getActionTitle('print-invoice')}
        onClick={() => onPrintInvoice(booking.id)}
        className={`${components.button.primary} ${componentSizes.button.sm} hover:scale-105 transition-transform hover:shadow-md`}
      >
        <Printer className="w-4 h-4" />
      </button>

      {/* Print Ticket Button */}
      <button
        title={getActionTitle('print')}
        disabled={!canPrintTicket(booking)}
        onClick={() => canPrintTicket(booking) && onPrintTicket(booking.id)}
        className={`
          ${componentSizes.button.sm} hover:scale-105 transition-transform
          ${canPrintTicket(booking) 
            ? `${components.button.primary} hover:shadow-md` 
            : 'text-gray-300 cursor-not-allowed bg-gray-100 border-gray-200'
          }
        `}
      >
        <Printer className="w-4 h-4" />
      </button>

      {/* Cancel/Refund Button */}
      <button
        title={getActionTitle('cancel')}
        disabled={!canCancel(booking) && !canRefund(booking)}
        onClick={() => {
          if (canCancel(booking) || canRefund(booking)) {
            onCancelRefund(booking.id);
          }
        }}
        className={`
          ${componentSizes.button.sm} hover:scale-105 transition-transform
          ${canCancel(booking) || canRefund(booking)
            ? `${components.button.danger} hover:shadow-md`
            : 'text-gray-300 cursor-not-allowed bg-gray-100 border-gray-200'
          }
        `}
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BookingActionButtons;
