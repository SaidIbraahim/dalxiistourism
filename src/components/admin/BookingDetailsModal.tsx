import React, { useState } from 'react';
import { formatBookingId } from '../../utils/bookingIdGenerator';
import ModalHeader from './booking/details/ModalHeader';
import StatusActionsBar from './booking/details/StatusActionsBar';
import TripDetailsCard from './booking/details/TripDetailsCard';
import SelectedServicesCard from './booking/details/SelectedServicesCard';
import AdditionalInfoCard from './booking/details/AdditionalInfoCard';
import TimelineCard from './booking/details/TimelineCard';

interface BookingDetailsModalProps {
  booking: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    gender: string | null;
    nationality: string | null;
    package_name?: string;
    destination_name?: string;
    booking_date: string;
    end_date: string | null;
    participants: number;
    adults: number;
    children: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    payment_status: 'pending' | 'paid' | 'refunded';
    dietary_requirements: string | null;
    selected_services: Array<{
      id: string;
      name: string;
      price: number;
      category: string;
      quantity: number;
    }> | null;
    special_requests: string | null;

    created_at?: string;
    updated_at?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: string, newStatus: string) => void;

}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChange
}) => {


  if (!isOpen || !booking) return null;

  const onApprove = () => onStatusChange(booking.id, 'confirmed');
  const onReject = () => onStatusChange(booking.id, 'rejected');
  const onComplete = () => onStatusChange(booking.id, 'completed');


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <ModalHeader booking={{ id: booking.id, created_at: booking.created_at }} onClose={onClose} />

                <div className="p-6 space-y-6">
          <StatusActionsBar
            status={booking.status}
            payment_status={booking.payment_status}
            onApprove={onApprove}
            onReject={onReject}
            onComplete={onComplete}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TripDetailsCard
              destinationName={booking.destination_name}
              booking_date={booking.booking_date}
              end_date={booking.end_date}
              adults={booking.adults}
              children={booking.children}
            />
            <AdditionalInfoCard
              dietary_requirements={booking.dietary_requirements}
              special_requests={booking.special_requests}
            />
          </div>

          {/* Selected Services */}
          {booking.selected_services && booking.selected_services.length > 0 && (
            <SelectedServicesCard services={booking.selected_services as any} total_amount={booking.total_amount} />
          )}

          <TimelineCard created_at={booking.created_at} updated_at={booking.updated_at} />
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 rounded-b-xl border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-medium">
              Booking ID: <span className="font-mono text-gray-900">{formatBookingId(booking.id, booking.created_at, 'full')}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 hover:border-gray-500 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  // TODO: Implement edit functionality
                  alert('Edit functionality will be implemented soon');
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default BookingDetailsModal;