import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { SelectedServicesPanel } from '../components/booking/SelectedServicesPanel';
import { PricingSummary } from '../components/booking/PricingSummary';
import type { Service } from '../components/booking/ServiceCard';
import { BookingsService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  nationality: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  specialRequests: string;
  dietaryRequirements: string;
}

export default function BookingReviewPage() {
  const { state } = useLocation() as { state?: {
    formData: BookingFormData,
    selectedServices: Record<string, { quantity: number; participants: number }>,
    availableServices: Service[]
  }};
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const formData = state?.formData;
  const selectedServices = state?.selectedServices || {};
  const availableServices = state?.availableServices || [];

  // If user enters directly, send them back to the form
  if (!formData || Object.keys(selectedServices).length === 0) {
    navigate('/book');
    return null;
  }

  const totalPrice = useMemo(() => {
    let total = 0;
    Object.entries(selectedServices).forEach(([serviceId, selection]) => {
      const service = availableServices.find(s => s.id === serviceId);
      if (service) {
        let servicePrice = service.basePrice * selection.quantity;
        if (['package-1', 'package-2', 'package-3'].includes(serviceId)) {
          servicePrice = service.basePrice * formData.adults + (formData.children * service.basePrice * 0.7);
        }
        total += servicePrice;
      }
    });
    return total;
  }, [selectedServices, availableServices, formData]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone ? `${formData.phoneCountry} ${formData.phone}` : null,
        booking_date: formData.startDate,
        participants: formData.adults + formData.children,
        total_amount: totalPrice,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        special_requests: [
          formData.specialRequests,
          formData.dietaryRequirements,
          `Selected Services: ${Object.keys(selectedServices).map(id => {
            const service = availableServices.find(s => s.id === id);
            return `${service?.name} (${selectedServices[id].quantity}x)`;
          }).join(', ')}`,
          `Nationality: ${formData.nationality}`,
          formData.endDate ? `End Date: ${formData.endDate}` : ''
        ].filter(Boolean).join('\n')
      };

      const response = await BookingsService.createBooking(bookingData);

      if (response.success && response.data) {
        const reference = `DLX-${response.data.id.substring(0, 8).toUpperCase()}`;
        setBookingReference(reference);
        setBookingComplete(true);
        showToast('success', 'Success!', 'Your booking has been submitted successfully');
      } else {
        throw new Error(response.error?.message || 'Failed to create booking');
      }
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h1>
              <p className="text-orange-100 text-sm">Your adventure awaits</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Booking Reference */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-800 mb-1">Booking Reference</p>
                <p className="text-xl font-bold text-orange-900 font-mono">{bookingReference}</p>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full p-1 flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">What happens next?</h3>
                    <p className="text-sm text-blue-800">
                      We'll contact you within 2 hours to confirm details and arrange payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">🏠</span>
                  Return Home
                </button>

                <a
                  href="https://wa.me/252907793854"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">💬</span>
                  WhatsApp Us
                </a>
              </div>

              {/* Contact Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <span className="mr-2">📧</span>
                    dalxiistta@gmail.com
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📞</span>
                    +252 907793854
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-blue-600 hover:text-orange-500 transition-colors mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Edit
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Review & Confirm</h1>
          <p className="text-gray-600">Please review your selections and details before confirming your booking.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Traveler */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Traveler</h2>
              <p className="text-gray-700">{formData.firstName} {formData.lastName}{formData.nationality ? ` • ${formData.nationality}` : ''}</p>
            </div>
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
              <p className="text-gray-700">{formData.email}</p>
              {formData.phone && (<p className="text-gray-700">{`${formData.phoneCountry} ${formData.phone}`}</p>)}
            </div>
            {/* Trip */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Trip</h2>
              <p className="text-gray-700">Start: {formData.startDate} {formData.endDate ? `• End: ${formData.endDate}` : ''}</p>
              <p className="text-gray-700">Travelers: {formData.adults + formData.children} (Adults: {formData.adults}{formData.children ? `, Children: ${formData.children}` : ''})</p>
            </div>
            {/* Services */}
            <div>
              <SelectedServicesPanel
                selectedServices={selectedServices}
                availableServices={availableServices}
                onQuantityChange={() => {}}
                onRemoveService={() => {}}
              />
            </div>
            {/* Preferences */}
            {(formData.dietaryRequirements || formData.specialRequests) && (
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Preferences</h2>
                {formData.dietaryRequirements && <p className="text-gray-700"><span className="font-medium">Dietary:</span> {formData.dietaryRequirements}</p>}
                {formData.specialRequests && <p className="text-gray-700"><span className="font-medium">Requests:</span> {formData.specialRequests}</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <PricingSummary
              selectedServices={selectedServices}
              availableServices={availableServices}
              formData={formData}
              totalPrice={totalPrice}
              isSubmitting={isSubmitting}
              onSubmit={handleConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
