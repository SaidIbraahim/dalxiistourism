import React from 'react';
import { X, Plus, Minus, Star, MapPin, Clock } from 'lucide-react';
import type { Service } from './ServiceCard';

interface SelectedServicesPanelProps {
  selectedServices: Record<string, { quantity: number; participants: number }>;
  availableServices: Service[];
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onRemoveService: (serviceId: string) => void;
  className?: string;
}

export const SelectedServicesPanel: React.FC<SelectedServicesPanelProps> = ({
  selectedServices,
  availableServices,
  onQuantityChange,
  onRemoveService,
  className = ''
}) => {
  const selectedServiceIds = Object.keys(selectedServices);

  if (selectedServiceIds.length === 0) {
    return null;
  }

  const calculateSubtotal = () => {
    return selectedServiceIds.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      const selection = selectedServices[serviceId];
      if (service && selection) {
        return total + (service.basePrice * selection.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Star className="mr-2" size={20} />
          Your Selected Services ({selectedServiceIds.length})
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          Review and adjust your selections
        </p>
      </div>

      <div className="p-4 space-y-4">
        {selectedServiceIds.map(serviceId => {
          const service = availableServices.find(s => s.id === serviceId);
          const selection = selectedServices[serviceId];
          
          if (!service || !selection) return null;

          return (
            <div key={serviceId} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              {/* Service Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {service.images && service.images[0] ? (
                  <img 
                    src={service.images[0]} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{service.name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {service.duration}
                      </span>
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {service.location}
                      </span>
                      {service.rating && (
                        <span className="flex items-center">
                          <Star size={14} className="mr-1 text-yellow-500" />
                          {service.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveService(serviceId)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove service"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onQuantityChange(serviceId, Math.max(1, selection.quantity - 1))}
                        disabled={selection.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      
                      <span className="w-8 text-center font-medium">{selection.quantity}</span>
                      
                      <button
                        onClick={() => onQuantityChange(serviceId, Math.min(10, selection.quantity + 1))}
                        disabled={selection.quantity >= 10}
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      ${service.basePrice} × {selection.quantity}
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${service.basePrice * selection.quantity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Subtotal */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Subtotal</span>
            <span className="text-xl font-bold text-blue-600">
              ${calculateSubtotal().toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Final price will be calculated based on dates and group size
          </p>
        </div>
      </div>
    </div>
  );
};