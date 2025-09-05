import React from 'react';
import { DollarSign, Users, Calendar, Tag, CreditCard, Shield } from 'lucide-react';
import type { Service } from './ServiceCard';

interface PricingSummaryProps {
  selectedServices: Record<string, { quantity: number; participants: number }>;
  availableServices: Service[];
  formData: {
    adults: number;
    children: number;
    startDate: string;
    endDate: string;
  };
  totalPrice: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  className?: string;
}

export const PricingSummary: React.FC<PricingSummaryProps> = ({
  selectedServices,
  availableServices,
  formData,
  totalPrice,
  isSubmitting,
  onSubmit,
  className = ''
}) => {
  const selectedServiceIds = Object.keys(selectedServices);
  
  if (selectedServiceIds.length === 0) {
    return null;
  }

  const calculateServiceBreakdown = () => {
    return selectedServiceIds.map(serviceId => {
      const service = availableServices.find(s => s.id === serviceId);
      const selection = selectedServices[serviceId];
      
      if (!service || !selection) return null;

      let serviceTotal = service.basePrice * selection.quantity;
      
      // Apply participant-based pricing for packages
      if (['package-1', 'package-2', 'package-3'].includes(serviceId)) {
        serviceTotal = service.basePrice * formData.adults + (formData.children * service.basePrice * 0.7);
      }

      return {
        id: serviceId,
        name: service.name,
        quantity: selection.quantity,
        unitPrice: service.basePrice,
        total: serviceTotal,
        isPackage: ['package-1', 'package-2', 'package-3'].includes(serviceId)
      };
    }).filter(Boolean);
  };

  const serviceBreakdown = calculateServiceBreakdown();
  const subtotal = serviceBreakdown.reduce((sum, item) => sum + (item?.total || 0), 0);
  const groupDiscount = (formData.adults + formData.children) > 6 ? subtotal * 0.1 : 0;
  const childrenDiscount = formData.children > 0 ? 
    serviceBreakdown
      .filter(item => item?.isPackage)
      .reduce((sum, item) => sum + (item ? formData.children * item.unitPrice * 0.3 : 0), 0) : 0;

  const totalDiscounts = groupDiscount + childrenDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscounts);

  const canSubmit = selectedServiceIds.length > 0 && formData.adults > 0 && formData.startDate;

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <h3 className="text-xl font-bold flex items-center">
          <DollarSign className="mr-2" size={24} />
          Booking Summary
        </h3>
        <p className="text-green-100 text-sm mt-1">
          Review your total before booking
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Trip Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Trip Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                Start Date
              </span>
              <span className="font-medium">
                {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not selected'}
              </span>
            </div>
            {formData.endDate && (
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  End Date
                </span>
                <span className="font-medium">
                  {new Date(formData.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                Travelers
              </span>
              <span className="font-medium">
                {formData.adults} adult{formData.adults !== 1 ? 's' : ''}
                {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? 'ren' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* Service Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Services</h4>
          <div className="space-y-3">
            {serviceBreakdown.map(item => {
              if (!item) return null;
              
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.isPackage ? (
                        <>
                          {formData.adults} adult{formData.adults !== 1 ? 's' : ''} × ${item.unitPrice}
                          {formData.children > 0 && (
                            <> + {formData.children} child{formData.children !== 1 ? 'ren' : ''} × ${Math.round(item.unitPrice * 0.7)}</>
                          )}
                        </>
                      ) : (
                        `${item.quantity}x × $${item.unitPrice}`
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.total.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discounts */}
        {totalDiscounts > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Tag className="mr-2" size={16} />
              Discounts Applied
            </h4>
            <div className="space-y-2">
              {childrenDiscount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-sm">Children's Discount (30% off)</span>
                  <span className="font-medium">-${childrenDiscount.toFixed(2)}</span>
                </div>
              )}
              {groupDiscount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-sm">Group Discount (10% off)</span>
                  <span className="font-medium">-${groupDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {totalDiscounts > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600">Total Savings</span>
              <span className="font-medium text-green-600">-${totalDiscounts.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-green-600">${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200
            ${canSubmit && !isSubmitting
              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard className="mr-2" size={20} />
              Complete Booking
            </div>
          )}
        </button>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="text-blue-600 mt-0.5" size={16} />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Secure Booking</p>
              <p>Your information is encrypted and secure. No payment required now - we'll contact you to arrange payment after confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};