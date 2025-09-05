import React from 'react';
import { Star, MapPin, Clock, Users, Check, Plus, Minus } from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'accommodation' | 'transport' | 'activity' | 'guide' | 'meal';
  duration: string;
  location: string;
  maxParticipants: number;
  highlights: string[];
  images: string[];
  rating?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  quantity: number;
  participants: number;
  onSelect: (serviceId: string) => void;
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onShowDetails: (service: Service) => void;
  className?: string;
  compact?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  quantity,
  participants: _participants,
  onSelect,
  onQuantityChange,
  onShowDetails,
  className = '',
  compact = false
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation': return 'bg-blue-100 text-blue-800';
      case 'transport': return 'bg-green-100 text-green-800';
      case 'activity': return 'bg-purple-100 text-purple-800';
      case 'guide': return 'bg-orange-100 text-orange-800';
      case 'meal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation': return '';
      case 'transport': return '';
      case 'activity': return '';
      case 'guide': return '';
      case 'meal': return '';
      default: return '';
    }
  };

  const getCategoryAccent = (category: string) => {
    switch (category) {
      case 'accommodation': return 'border-l-blue-400';
      case 'transport': return 'border-l-green-400';
      case 'activity': return 'border-l-purple-400';
      case 'guide': return 'border-l-orange-400';
      case 'meal': return 'border-l-red-400';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className={`
      relative bg-white rounded-xl shadow-md border transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-blue-200 overflow-hidden h-full
      ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
      ${getCategoryAccent(service.category)} border-l-4
      ${className}
    `}>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <Check className="text-white" size={16} />
        </div>
      )}

      {/* Status badges removed to avoid overlap; using single ribbon on image */}

      {/* Image */}
      <div className={`relative overflow-hidden rounded-t-xl ${compact ? 'h-24 w-40 md:w-48 rounded-tr-none rounded-bl-xl sm:rounded-bl-none sm:rounded-tr-xl sm:h-28' : 'h-32 md:h-36 lg:h-40'}`}>
        {/* Ribbon */}
        {(service.isRecommended || service.isPopular) && (
          <div className="absolute top-0 left-0 z-10">
            <div className={`px-3 py-1 text-xs font-semibold text-white rounded-br-lg ${service.isRecommended ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
              {service.isRecommended ? 'Best Value' : 'Popular'}
            </div>
          </div>
        )}
        {service.images && service.images[0] ? (
          <img 
            src={service.images[0]} 
            alt={service.name}
            className={`object-cover ${compact ? 'w-full h-full' : 'w-full h-full'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-6xl">{getCategoryIcon(service.category)}</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className={`absolute ${compact ? 'bottom-1.5 right-1.5' : 'bottom-2 right-2 md:bottom-3 md:right-3'} bg-white/95 backdrop-blur rounded-lg px-2 py-0.5 shadow-md`}>        
          <span className="text-base md:text-lg font-bold text-gray-900">${service.basePrice}</span>
          <span className="text-xs md:text-sm text-gray-600">/{service.duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`${compact ? 'p-3 sm:p-4' : 'p-4 md:p-5'} flex-1`}>        
        {/* Header */}
        <div className={`flex items-start justify-between ${compact ? 'mb-1' : 'mb-3'}`}>
          <div className="flex-1 min-w-0">
            <h3 className={`${compact ? 'text-sm sm:text-base' : 'text-base md:text-lg'} font-bold text-gray-900 mb-1 truncate`}>{service.name}</h3>
            <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 ${compact ? 'text-[11px] sm:text-xs' : 'text-sm'} text-gray-600`}>
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {service.location}
              </span>
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {service.duration}
              </span>
              {service.rating && (
                <span className="flex items-center">
                  <Star size={14} className="mr-1 text-yellow-500" />
                  {service.rating}
                </span>
              )}
            </div>
          </div>
          
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryColor(service.category)}`}>
            {service.category}
          </span>
        </div>

        {/* Description */}
        <p className={`text-gray-600 ${compact ? 'text-[11px] sm:text-xs mb-2 line-clamp-1' : 'text-sm mb-3 line-clamp-2'}`}>{service.description}</p>

        {/* Highlights */}
        {!compact && service.highlights && service.highlights.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {service.highlights.slice(0, 3).map((highlight, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {highlight}
                </span>
              ))}
              {service.highlights.length > 3 && (
                <span className="text-xs text-gray-500">+{service.highlights.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Capacity */}
        <div className={`flex items-center ${compact ? 'text-[11px] sm:text-xs mb-2' : 'text-sm mb-3'} text-gray-600`}>
          <Users size={14} className="mr-1" />
          <span>Up to {service.maxParticipants} people</span>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-2 ${compact ? 'mt-1' : ''}`}>
          <button
            onClick={() => onSelect(service.id)}
            className={`
              flex-1 ${compact ? 'py-1.5 px-3 text-sm' : 'py-2.5 px-4 sm:py-2.5'} rounded-xl font-medium transition-all duration-200
              ${isSelected
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isSelected ? (
              <span className="flex items-center justify-center">
                <Check size={16} className="mr-2" />
                Selected
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Plus size={16} className="mr-2" />
                Select
              </span>
            )}
          </button>
          
          <button
            onClick={() => onShowDetails(service)}
            className={`${compact ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2 sm:px-3.5 sm:py-2.5'} border border-blue-200 rounded-xl text-blue-700 hover:bg-blue-50 transition-colors`}
          >
            Details
          </button>
        </div>

        {/* Quantity Selector (if selected) */}
        {isSelected && (
          <div className={`${compact ? 'mt-2.5' : 'mt-3'} p-2.5 bg-blue-50 rounded-lg border border-blue-100`}>            
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-medium text-blue-900">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => onQuantityChange(service.id, Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white border border-blue-300 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus size={14} className="text-blue-600" />
                </button>
                <span className="w-7 md:w-8 text-center font-medium text-blue-900 text-sm" aria-live="polite">{quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => onQuantityChange(service.id, Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs md:text-sm text-blue-900">
              <span className="opacity-80">Subtotal</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((service.basePrice || 0) * (quantity || 1))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};