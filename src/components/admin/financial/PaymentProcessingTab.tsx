import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { cacheService } from '../../../services/CacheService';
import PaymentModal from '../booking/payment/PaymentModal';
import ConfirmedBookingsList from './ConfirmedBookingsList';
import PaymentSearchBar from './PaymentSearchBar';
import { typography, components, componentSizes } from '../../../styles/designSystem';
import { formatBookingId } from '../../../utils/bookingIdGenerator';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_date: string;
  created_at: string;
  tour_packages: { name: string };
  destinations: { name: string };
}

interface PaymentRecord {
  id: string;
  booking_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  type: 'payment' | 'refund';
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  discount_type?: 'none' | 'percent' | 'fixed';
  discount_value?: number;
}

const PaymentProcessingTab: React.FC = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadConfirmedBookings();
  }, []);

  const loadConfirmedBookings = async () => {
    try {
      const cacheKey = 'confirmed_bookings_payments';
      const cached = cacheService.get(cacheKey);
      if (cached) {
        setBookings(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // Load only minimal fields required for list view
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, customer_name, customer_email, total_amount, status, payment_status, booking_date, created_at')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Bookings query error:', bookingsError);
        throw bookingsError;
      }
      
      // Convert total_amount from string to number
      const processedBookings = (bookingsData || []).map(booking => ({
        ...booking,
        total_amount: parseFloat(booking.total_amount) || 0
      }));
      
      console.log('Loaded confirmed bookings:', processedBookings);
      setBookings(processedBookings);
      cacheService.set(cacheKey, processedBookings, 2 * 60 * 1000);

    } catch (error: any) {
      console.error('Error loading confirmed bookings:', error);
      showToast('error', 'Error', `Failed to load confirmed bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentRecorded = async (paymentData: any) => {
    try {
      // Get current user for created_by field
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      // Create payment record in database
      const { data: newPayment, error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          booking_id: selectedBooking!.id,
          customer_name: selectedBooking!.customer_name,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id || null,
          notes: paymentData.notes || null,
          type: paymentData.type,
          status: 'completed',
          discount_type: paymentData.discount_type || 'none',
          discount_value: paymentData.discount_value || 0,
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
        throw paymentError;
      }

      // Update booking payment status in database
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          payment_status: paymentData.type === 'payment' ? 'paid' : 'refunded' 
        })
        .eq('id', selectedBooking!.id);

      if (bookingError) throw bookingError;

      // Refresh data from database
      await loadConfirmedBookings();

      showToast('success', 'Success', `${paymentData.type === 'payment' ? 'Payment' : 'Refund'} recorded successfully`);
      setIsPaymentModalOpen(false);
      setSelectedBooking(null);

    } catch (error: any) {
      console.error('Error recording payment:', error);
      showToast('error', 'Error', `Failed to record payment: ${error.message}`);
    }
  };

  // Filter confirmed bookings based on search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    
    const term = searchTerm.toLowerCase();
    return bookings.filter(booking => 
      booking.customer_name.toLowerCase().includes(term) ||
      booking.customer_email.toLowerCase().includes(term) ||
      (booking.tour_packages?.name && booking.tour_packages.name.toLowerCase().includes(term)) ||
      (booking.destinations?.name && booking.destinations.name.toLowerCase().includes(term))
    );
  }, [bookings, searchTerm]);

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h2 className={`${typography.h2} text-gray-900`}>Payment Processing</h2>
          <p className={`${typography.body} text-gray-600 mt-1`}>Process payments for confirmed bookings</p>
         </div>
       </div>

      {/* Search Bar */}
      <PaymentSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by customer name, email, package, or destination..."
      />

      {/* Confirmed Bookings List */}
         <div className={components.card.base}>
           <div className={`${componentSizes.card.padding} border-b border-gray-200`}>
          <h3 className={`${typography.h3} text-gray-900`}>Confirmed Bookings</h3>
          <p className={`${typography.body} text-gray-600`}>
            Confirmed bookings ready for payment processing
          </p>
           </div>
           <div className={componentSizes.card.padding}>
          <ConfirmedBookingsList
            bookings={filteredBookings}
            onProcessPayment={handleProcessPayment}
            loading={loading}
          />
                        </div>
                      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedBooking && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={formatBookingId(selectedBooking.id, selectedBooking.created_at, 'full')}
          customerName={selectedBooking.customer_name}
          totalAmount={selectedBooking.total_amount}
          currentPaymentStatus={selectedBooking.payment_status}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </div>
  );
};

export default PaymentProcessingTab;
