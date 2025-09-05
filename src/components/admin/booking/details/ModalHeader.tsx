import React from 'react';
import { X } from 'lucide-react';
import { formatBookingId } from '../../../../utils/bookingIdGenerator';

interface ModalHeaderProps {
  booking: { id: string; created_at?: string };
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ booking, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Booking Details</h2>
          <p className="text-teal-100 font-medium text-lg">Reference: {formatBookingId(booking.id, booking.created_at, 'modal')}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
          title="Close Modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;


