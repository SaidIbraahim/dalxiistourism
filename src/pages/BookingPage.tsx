import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar, Users, Mail, User, Phone, Globe } from 'lucide-react';
import { BookingsService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { usePackages, usePackagesLoading, usePackagesError, useServices, useServicesLoading, useServicesError, useClearServicesCache } from '../stores/appStore';
import { DataService } from '../services/dataService';
import { fallbackPackages, fallbackServices } from '../data/fallbackData';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  nationality: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  specialRequests: string;
  dietaryRequirements: string;
}

interface Service {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  duration: string;
  location: string;
  description: string;
  duration_days?: number | null;
  max_participants?: number | null;
}

const BookingPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const formContainerRef = React.useRef<HTMLDivElement>(null);

  // Get real packages data from Supabase via Zustand store
  const packages = usePackages();
  const isLoading = usePackagesLoading();
  const packagesError = usePackagesError();

  // Get real services data from Supabase via Zustand store
  const services = useServices();
  const isServicesLoading = useServicesLoading();
  const servicesError = useServicesError();
  const clearServicesCache = useClearServicesCache();

  // Strategic data loading - ensure data is available for booking
  useEffect(() => {
    const loadBookingData = async () => {
      console.log('📋 BookingPage: Loading booking data...');
      setHasAttemptedLoad(true);
      
      // Load packages if not available
      if (packages.length === 0 && !isLoading) {
        console.log('📦 BookingPage: Loading packages...');
        await DataService.fetchPackages(1, 50);
      }
      
      // Load services if not available
      if (services.length === 0 && !isServicesLoading) {
        console.log('🔧 BookingPage: Loading services...');
        await DataService.fetchServices();
      }
    };

    loadBookingData();
  }, [packages.length, services.length, isLoading, isServicesLoading]);

  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    nationality: '',
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    dietaryRequirements: ''
  });

  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});

  // Use fallback data if no packages or services are available
  const availablePackages = packages.length > 0 ? packages : fallbackPackages;
  const availableServicesData = services.length > 0 ? services : fallbackServices;
  
  // Show a warning if using fallback data
  const isUsingFallbackData = packages.length === 0 || services.length === 0;
  
  // Check for errors
  const hasErrors = packagesError || servicesError;
  
  // Log errors for debugging
  if (hasErrors) {
    console.warn('⚠️ BookingPage: Data loading errors detected:', { packagesError, servicesError });
  }

  // Load packages and services data on component mount
  useEffect(() => {
    if (packages.length === 0) {
      DataService.fetchPackages(1, 50);
    }
    // Clear services cache and refetch to ensure we get the latest data
    clearServicesCache();
    DataService.fetchServices();
  }, [packages.length, clearServicesCache]);

  // Convert packages and services to unified format
  const unifiedServices: Service[] = [
    // Tour Packages
    ...availablePackages
      .filter(pkg => pkg.status === 'active')
      .map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        basePrice: Number(pkg.price),
        category: pkg.category?.charAt(0).toUpperCase() + pkg.category?.slice(1) || 'Package',
        duration: pkg.duration_days ? `${pkg.duration_days} day${pkg.duration_days > 1 ? 's' : ''}` : 'Flexible',
        location: pkg.name.includes('to') ? pkg.name.split(' to ')[1]?.split(' ')[0] || 'Puntland' : 'Puntland',
        description: pkg.description || 'Experience the beauty of this amazing destination with our carefully crafted tour package.',
        duration_days: pkg.duration_days,
        max_participants: pkg.max_participants
      })),
    // Additional Services
    ...availableServicesData
      .filter(service => service.status === 'active')
      .map(service => ({
        id: service.id,
        name: service.name,
        basePrice: Number(service.price),
        category: service.category?.charAt(0).toUpperCase() + service.category?.slice(1) || 'Service',
        duration: service.duration || 'Per service',
        location: service.location || 'All Locations',
        description: service.description || 'Professional service to enhance your travel experience.',
        duration_days: null,
        max_participants: null
      }))
  ];

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    // Scroll to top of form container smoothly when step changes
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedServices)
      .filter(([_, selected]) => selected)
      .reduce((total, [serviceId]) => {
        const service = unifiedServices.find(s => s.id === serviceId);
        if (!service) return total;

        // Check if it's a package (has duration_days) or a service
        if (service.duration_days) {
          // Package pricing: per person
          return total + (service.basePrice * formData.adults) + (formData.children * service.basePrice * 0.7);
        } else {
          // Service pricing: per service (not per person)
        return total + service.basePrice;
        }
      }, 0);
  };

  const handleSubmit = async () => {
    const selectedServicesList = Object.entries(selectedServices)
      .filter(([_, selected]) => selected)
      .map(([serviceId]) => {
        const service = unifiedServices.find(s => s.id === serviceId);
        return service?.name;
      })
      .filter(Boolean);

    if (selectedServicesList.length === 0) {
      showToast('error', 'Error', 'Please select at least one service');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare selected services data
      const selectedServicesData = Object.entries(selectedServices)
        .filter(([_, selected]) => selected)
        .map(([serviceId]) => {
          const service = unifiedServices.find(s => s.id === serviceId);
          if (!service) return null;
          
          // Check if it's a package (has duration_days) or a service
          let price;
          if (service.duration_days) {
            // Package pricing: per person
            price = service.basePrice * formData.adults + (formData.children * service.basePrice * 0.7);
          } else {
            // Service pricing: per service (not per person)
            price = service.basePrice;
          }
          
          return {
            id: service.id,
            name: service.name,
            quantity: 1,
            price: price,
            category: service.category
          };
        })
        .filter(Boolean);

      const bookingData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        booking_date: formData.startDate,
        end_date: formData.endDate || null,
        participants: formData.adults + formData.children,
        adults: formData.adults,
        children: formData.children,
        total_amount: calculateTotal(),
        status: 'pending' as const,
        payment_status: 'pending' as const,
        dietary_requirements: formData.dietaryRequirements || null,
        selected_services: selectedServicesData,
        special_requests: formData.specialRequests || null
      };

      const response = await BookingsService.createBooking(bookingData);

      if (response.success && response.data) {
        const reference = `DLX-${response.data.id.substring(0, 8).toUpperCase()}`;
        setBookingReference(reference);
        setBookingComplete(true);
        showToast('success', 'Success!', 'Booking submitted successfully');
      } else {
        throw new Error(response.error?.message || 'Failed to create booking');
      }

    } catch (error: any) {
      console.error('Booking failed:', error);
      showToast('error', 'Error', error.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const canProceed = (step: number) => {
    switch (step) {
      case 1: return selectedCount > 0;
      case 2: return formData.firstName && formData.lastName && formData.email && formData.startDate && formData.adults > 0;
      case 3: return true; // Additional info is optional
      case 4: return formData.firstName && formData.lastName && formData.email && formData.startDate && selectedCount > 0;
      default: return true;
    }
  };

  // Show loading state only if we have no data at all and are actively loading
  // This prevents endless loading by showing the form with fallback data
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  useEffect(() => {
    // Set a timeout to show the form even if data hasn't loaded
    const timeout = setTimeout(() => {
      if (packages.length === 0 && services.length === 0) {
        console.log('⚠️ BookingPage: Loading timeout reached, showing form with fallback data');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [packages.length, services.length]);

  // Only show loading if we have no data and haven't attempted to load yet
  if (packages.length === 0 && services.length === 0 && !hasAttemptedLoad && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading available packages and services...</p>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Compact Success Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-center">

                <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">� Booking Coonfirmed!</h1>
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
                  href="https://wa.me/252907797695"
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
                    support@dalxiis.com
                </div>
                  <div className="flex items-center">
                    <span className="mr-2">📞</span>
                    +252 905 345 879
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/20 rounded-full translate-y-32 -translate-x-32"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <Link to="/packages" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Packages</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Book Your
              <span className="block text-orange-300">Dream Trip</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Experience the beauty of Puntland with our carefully curated travel packages
            </p>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
              <div className="flex items-center space-x-1">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 1
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  1. Services
                </div>
                <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 2
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  2. Details
                </div>
                <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 3
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  3. Additional
                </div>
                <div className={`w-8 h-0.5 ${step >= 4 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 4
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  4. Review
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 -mt-6 relative z-10">

        {/* Warning banner for fallback data */}
        {isUsingFallbackData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Some data may not be fully loaded. You can still proceed with booking using available options, or try refreshing the page for the latest information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div ref={formContainerRef} className="bg-white rounded-xl shadow-xl border border-gray-100">
          {step === 4 ? (
            /* Review Page - Modern Compact Design */
            <div className="p-4">
              <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-4">
                    <CheckCircle className="w-5 h-5 mr-2" />
                      Almost there! One final step
                    </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirmation</h2>
                  <p className="text-gray-600">Please review all details before submitting your booking</p>
                  </div>

                {/* Single Card - Minimal Design */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <CheckCircle className="w-6 h-6 mr-3" />
                        Booking Summary
                    </h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Details */}
                        <div className="space-y-6">
                          {/* Services */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Selected Services</h4>
                            <div className="space-y-2">
                      {Object.entries(selectedServices)
                        .filter(([_, selected]) => selected)
                        .map(([serviceId]) => {
                          const service = unifiedServices.find(s => s.id === serviceId);
                          if (!service) return null;
                          return (
                                    <div key={serviceId} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <div>
                                        <div className="font-medium text-gray-900">{service.name}</div>
                                        <div className="text-xs text-gray-500">{service.duration} • {service.location}</div>
                              </div>
                                      <div className="text-orange-600 font-semibold">
                                        {service.duration_days 
                                          ? `$${(service.basePrice * formData.adults + (formData.children * service.basePrice * 0.7)).toFixed(0)}`
                                          : `$${service.basePrice}`
                                        }
                                      </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                          {/* Client Info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Client Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Name</span>
                                <span className="text-sm font-medium text-gray-900">{formData.firstName} {formData.lastName}</span>
                      </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Email</span>
                                <span className="text-sm font-medium text-gray-900">{formData.email}</span>
                      </div>
                      {formData.phone && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Phone</span>
                                  <span className="text-sm font-medium text-gray-900">{formData.phone}</span>
                        </div>
                      )}
                      {formData.nationality && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Nationality</span>
                                  <span className="text-sm font-medium text-gray-900">{formData.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>

                          {/* Trip Info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Trip Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Start Date</span>
                                <span className="text-sm font-medium text-gray-900">
                          {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Not set'}
                                </span>
                      </div>
                      {formData.endDate && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">End Date</span>
                                  <span className="text-sm font-medium text-gray-900">
                            {new Date(formData.endDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                                  </span>
                        </div>
                      )}
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Travelers</span>
                                <span className="text-sm font-medium text-gray-900">
                          {formData.adults} adult{formData.adults !== 1 ? 's' : ''}
                          {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? 'ren' : ''}`}
                                </span>
                      </div>
                      {formData.startDate && formData.endDate && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Duration</span>
                                  <span className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </span>
                        </div>
                      )}
                    </div>
                  </div>

                          {/* Additional Info */}
                  {(formData.dietaryRequirements || formData.specialRequests) && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Additional Information</h4>
                              <div className="space-y-2">
                        {formData.dietaryRequirements && (
                                  <div className="flex justify-between items-start py-1">
                                    <span className="text-sm text-gray-600">Dietary Requirements</span>
                                    <span className="text-sm text-gray-900 text-right max-w-xs">{formData.dietaryRequirements}</span>
                          </div>
                        )}
                        {formData.specialRequests && (
                                  <div className="flex justify-between items-start py-1">
                                    <span className="text-sm text-gray-600">Special Requests</span>
                                    <span className="text-sm text-gray-900 text-right max-w-xs">{formData.specialRequests}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                            </div>

                        {/* Right Side - Total & Actions */}
                        <div className="space-y-6">
                          {/* Total Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                              <span className="text-2xl font-bold text-orange-600">${calculateTotal().toFixed(0)}</span>
                            </div>
                      {formData.children > 0 && (
                              <div className="text-xs text-orange-600 bg-orange-50 rounded p-2 mt-3">
                          ✨ Children receive 30% discount on packages
                        </div>
                      )}
                  </div>

                  {/* Confirmation Notice */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-green-900 text-sm mb-1">Ready to Submit!</p>
                                <p className="text-xs text-green-700 leading-relaxed">
                                  We'll contact you within 2 hours to confirm your booking and arrange payment.
                                </p>
                                <div className="mt-2 text-xs text-green-600">
                                  <strong>Next:</strong> Confirmation call → Payment → Trip prep
                        </div>
                      </div>
                    </div>
                  </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                    <button
                      onClick={() => handleStepChange(step - 1)}
                              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed(step) || isSubmitting}
                              className={`w-full py-4 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${canProceed(step) && !isSubmitting
                                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                  Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm & Submit Booking
                        </div>
                      )}
                    </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Other Steps - Full Width Layout
            <div className="min-h-[500px]">
              {/* Form Content - Full Width for steps 1-3 */}
              <div className="p-6">

                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-teal-900 mb-2">Select Your Services</h2>
                        <p className="text-teal-700">Choose from our premium travel packages and services</p>
                      </div>
                      {selectedCount > 0 && (
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                          {selectedCount} Selected • ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unifiedServices.map(service => (
                        <label
                          key={service.id}
                          className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedServices[service.id]
                            ? 'ring-4 ring-teal-400 shadow-xl'
                            : 'hover:shadow-lg'
                            }`}
                        >
                          <div className={`p-5 border-2 rounded-xl transition-all ${selectedServices[service.id]
                            ? 'border-teal-400 bg-gradient-to-br from-teal-100 to-cyan-100'
                            : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50'
                            }`}>

                            <input
                              type="checkbox"
                              checked={selectedServices[service.id] || false}
                              onChange={() => handleServiceToggle(service.id)}
                              className="absolute top-4 right-4 w-5 h-5 text-teal-600 focus:ring-teal-500 rounded"
                            />

                            <div className="pr-8">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className={`text-lg font-bold ${selectedServices[service.id] ? 'text-teal-900' : 'text-gray-900'} leading-tight`}>
                                  {service.name}
                                </h3>
                              </div>

                              <p className={`text-sm mb-3 ${selectedServices[service.id] ? 'text-teal-800' : 'text-gray-600'}`}>
                                {service.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className={`flex items-center space-x-3 text-xs ${selectedServices[service.id] ? 'text-teal-700' : 'text-gray-500'}`}>
                                  <span className="bg-white/50 px-2 py-1 rounded-full">{service.duration}</span>
                                  <span>•</span>
                                  <span className="bg-white/50 px-2 py-1 rounded-full">{service.location}</span>
                                </div>

                                <div className={`text-xl font-bold ${selectedServices[service.id] ? 'text-orange-600' : 'text-teal-600'}`}>
                                  ${service.basePrice}
                                </div>
                              </div>
                            </div>

                            {selectedServices[service.id] && (
                              <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-orange-500">
                                <CheckCircle className="absolute -top-6 -right-5 w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-orange-900 mb-2">Your Details</h2>
                        <p className="text-orange-700">Tell us about yourself and your travel plans</p>
                      </div>
                      {selectedCount > 0 && (
                        <div className="bg-teal-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                          {selectedCount} Services • ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-400">
                          <label className="flex items-center text-sm font-bold text-orange-800 mb-3">
                            <div className="bg-orange-500 p-2 rounded-lg mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 placeholder-orange-400"
                            placeholder="Enter your first name"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-400">
                          <label className="flex items-center text-sm font-bold text-orange-800 mb-3">
                            <div className="bg-orange-500 p-2 rounded-lg mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 placeholder-orange-400"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl p-5 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-teal-400">
                          <label className="flex items-center text-sm font-bold text-teal-800 mb-3">
                            <div className="bg-teal-500 p-2 rounded-lg mr-3">
                              <Mail className="w-4 h-4 text-white" />
                            </div>
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 placeholder-teal-400"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl p-5 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-teal-400">
                          <label className="flex items-center text-sm font-bold text-teal-800 mb-3">
                            <div className="bg-teal-500 p-2 rounded-lg mr-3">
                              <Phone className="w-4 h-4 text-white" />
                            </div>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 placeholder-teal-400"
                            placeholder="+252 61 123 4567"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-400">
                          <label className="flex items-center text-sm font-bold text-orange-800 mb-3">
                            <div className="bg-orange-500 p-2 rounded-lg mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 cursor-pointer appearance-none"
                          >
                            <option value="">Select your gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      {/* Start Date */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-400">
                          <label className="flex items-center text-sm font-bold text-purple-800 mb-3">
                            <div className="bg-purple-500 p-2 rounded-lg mr-3">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            min={getMinDate()}
                            className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 cursor-pointer"
                            style={{
                              colorScheme: 'light'
                            }}
                          />
                          <p className="text-xs text-purple-600 mt-2">📅 Click to select your travel start date</p>
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-400">
                          <label className="flex items-center text-sm font-bold text-purple-800 mb-3">
                            <div className="bg-purple-500 p-2 rounded-lg mr-3">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            min={formData.startDate || getMinDate()}
                            className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 cursor-pointer"
                            style={{
                              colorScheme: 'light'
                            }}
                          />
                          <p className="text-xs text-purple-600 mt-2">📅 Optional: Select your return date</p>
                        </div>
                      </div>

                      {/* Adults */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-5 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400">
                          <label className="flex items-center text-sm font-bold text-emerald-800 mb-3">
                            <div className="bg-emerald-500 p-2 rounded-lg mr-3">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            Adults *
                          </label>
                          <select
                            value={formData.adults}
                            onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 cursor-pointer appearance-none"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                              <option key={n} value={n} className="bg-white text-gray-800 py-2">
                                {n} Adult{n > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-emerald-600 mt-2">👥 Number of adult travelers</p>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-5 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400">
                          <label className="flex items-center text-sm font-bold text-emerald-800 mb-3">
                            <div className="bg-emerald-500 p-2 rounded-lg mr-3">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            Children
                          </label>
                          <select
                            value={formData.children}
                            onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 cursor-pointer appearance-none"
                          >
                            {[0, 1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={n} className="bg-white text-gray-800 py-2">
                                {n} Child{n !== 1 ? 'ren' : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-emerald-600 mt-2">👶 Children under 12 years old</p>
                        </div>
                      </div>

                      {/* Nationality */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-5 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-indigo-400">
                          <label className="flex items-center text-sm font-bold text-indigo-800 mb-3">
                            <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                              <Globe className="w-4 h-4 text-white" />
                            </div>
                            Nationality
                          </label>
                          <select
                            value={formData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-300 cursor-pointer appearance-none"
                          >
                            <option value="" className="bg-white text-gray-500 py-2">Select your nationality</option>
                            <option value="Somali" className="bg-white text-gray-800 py-2">🇸🇴 Somali</option>
                            <option value="Ethiopian" className="bg-white text-gray-800 py-2">🇪🇹 Ethiopian</option>
                            <option value="Kenyan" className="bg-white text-gray-800 py-2">🇰🇪 Kenyan</option>
                            <option value="American" className="bg-white text-gray-800 py-2">🇺🇸 American</option>
                            <option value="British" className="bg-white text-gray-800 py-2">🇬🇧 British</option>
                            <option value="Canadian" className="bg-white text-gray-800 py-2">🇨🇦 Canadian</option>
                            <option value="Other" className="bg-white text-gray-800 py-2">🌍 Other</option>
                          </select>
                          <p className="text-xs text-indigo-600 mt-2">🌍 This helps us with travel documentation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information */}
                {step === 3 && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-purple-900 mb-2">Additional Information</h2>
                        <p className="text-purple-700">Optional details to help us serve you better</p>
                      </div>
                      {selectedCount > 0 && (
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                          {selectedCount} Services • ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Dietary Requirements */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-400">
                          <label className="flex items-center text-lg font-bold text-green-800 mb-4">
                            <div className="bg-green-500 p-3 rounded-lg mr-3">
                              <span className="text-white text-lg">🍽️</span>
                            </div>
                            Dietary Requirements
                          </label>
                          <textarea
                            value={formData.dietaryRequirements}
                            onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                            className="w-full px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-gray-800 font-medium focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 placeholder-green-400 resize-none"
                            rows={4}
                            placeholder="Tell us about any allergies, dietary restrictions, or special meal preferences you have..."
                          />
                          <p className="text-xs text-green-600 mt-2 italic">💡 This helps us prepare the perfect dining experience for you</p>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div className="group">
                        <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl p-6 border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-pink-400">
                          <label className="flex items-center text-lg font-bold text-pink-800 mb-4">
                            <div className="bg-pink-500 p-3 rounded-lg mr-3">
                              <span className="text-white text-lg">✨</span>
                            </div>
                            Special Requests
                          </label>
                          <textarea
                            value={formData.specialRequests}
                            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                            className="w-full px-5 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 rounded-xl text-gray-800 font-medium focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 placeholder-pink-400 resize-none"
                            rows={4}
                            placeholder="Share any accessibility needs, celebration occasions, specific preferences, or anything else that would make your trip special..."
                          />
                          <p className="text-xs text-pink-600 mt-2 italic">🎉 We love making your experience memorable and personalized</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {step > 1 && (
                      <button
                        onClick={() => handleStepChange(step - 1)}
                        className="flex items-center px-6 py-3 border-2 border-teal-300 rounded-lg text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <a
                      href="https://wa.me/252907797695"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Need help? WhatsApp us
                    </a>

                    <button
                      onClick={() => handleStepChange(step + 1)}
                      disabled={!canProceed(step)}
                      className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${canProceed(step)
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {step === 3 ? 'Review Booking' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;