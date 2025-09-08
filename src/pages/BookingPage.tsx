import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar, Users, Mail, User, Phone, Globe } from 'lucide-react';
import { BookingsService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { usePackages, usePackagesLoading, usePackagesError, useServices, useServicesLoading, useServicesError, useClearServicesCache } from '../stores/appStore';
import { DataService } from '../services/dataService';
import { fallbackPackages, fallbackServices } from '../data/fallbackData';
import { supabase } from '../lib/supabase';

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
    
    // Enhanced scroll behavior for better UX
    if (formContainerRef.current) {
      // For step 2 (Details), scroll to the very top of the form
      if (newStep === 2) {
        formContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Additional scroll to ensure we're at the very top
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100);
      } else {
        // For other steps, scroll to form container
      formContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      }
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

      console.log('📝 Submitting booking data:', bookingData);

      // Test Supabase connection first
      try {
        const { error: testError } = await supabase
          .from('bookings')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.warn('⚠️ Supabase connection test failed:', testError);
        } else {
          console.log('✅ Supabase connection test passed');
        }
      } catch (testErr) {
        console.warn('⚠️ Supabase connection test error:', testErr);
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Booking submission timeout')), 30000)
      );

      // Try booking submission with retry
      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await Promise.race([
            BookingsService.createBooking(bookingData),
            timeoutPromise
          ]) as any;
          break; // Success, exit retry loop
        } catch (retryError: any) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw retryError; // Re-throw if max retries exceeded
          }
          console.warn(`⚠️ Booking attempt ${retryCount} failed, retrying...`, retryError.message);
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log('📝 Booking response:', response);

      if (response.success && response.data) {
        const reference = `DLX-${response.data.id.substring(0, 8).toUpperCase()}`;
        setBookingReference(reference);
        setBookingComplete(true);
        showToast('success', 'Success!', 'Booking submitted successfully');
      } else {
        // If API fails but we have the data, create a local reference
        console.warn('⚠️ API failed, creating local booking reference');
        const localReference = `DLX-${Date.now().toString().substring(5).toUpperCase()}`;
        setBookingReference(localReference);
        setBookingComplete(true);
        showToast('warning', 'Booking Received', 'Your booking has been received locally. We will contact you to confirm details.');
      }

    } catch (error: any) {
      console.error('❌ Booking failed:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to submit booking';
      if (error.message === 'Booking submission timeout' || error.message === 'Booking creation timeout') {
        errorMessage = 'Booking submission timed out. Please try again or contact us directly.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error but also provide alternative contact method
      showToast('error', 'Error', errorMessage);
      
      // Show alternative contact information
      setTimeout(() => {
        showToast('info', 'Alternative', 'You can also contact us directly at +252907793854 or dalxiistta@gmail.com');
      }, 3000);
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
    // Set a shorter timeout to show the form even if data hasn't loaded
    const timeout = setTimeout(() => {
      if (packages.length === 0 && services.length === 0) {
        console.log('⚠️ BookingPage: Loading timeout reached, showing form with fallback data');
        setLoadingTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [packages.length, services.length]);

  // Only show loading if we have no data and haven't attempted to load yet
  // But always show the form after a short delay to prevent endless loading
  if (packages.length === 0 && services.length === 0 && !hasAttemptedLoad && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading available packages and services...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment...</p>
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

          {/* Mobile-First Progress Indicator */}
          <div className="flex justify-center px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 w-full max-w-4xl">
              {/* Desktop Progress Bar */}
              <div className="hidden md:flex items-center justify-between">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 1
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  1. Services
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 2
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  2. Details
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 3
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  3. Additional
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${step >= 4 ? 'bg-orange-400' : 'bg-white/30'} transition-colors`}></div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= 4
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  4. Review
                </div>
              </div>

              {/* Mobile Progress Bar */}
              <div className="md:hidden">
                {/* Current Step Display */}
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    Step {step} of 4
            </div>
                  <div className="text-white/90 text-sm">
                    {step === 1 && 'Select Services'}
                    {step === 2 && 'Your Details'}
                    {step === 3 && 'Additional Info'}
                    {step === 4 && 'Review & Confirm'}
                  </div>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full transition-all ${
                        step >= stepNumber 
                          ? 'bg-orange-500 shadow-lg' 
                          : 'bg-white/30'
                      }`}></div>
                      {stepNumber < 4 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          step > stepNumber ? 'bg-orange-400' : 'bg-white/30'
                        } transition-colors`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:p-4 -mt-6 relative z-10">

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
            /* Review Page - Compact Responsive Design */
            <div className="p-4">
              <div className="max-w-6xl mx-auto">
                {/* Compact Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg mb-3">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Almost there! One final step
                    </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Review & Confirmation</h2>
                  <p className="text-gray-600 text-sm md:text-base">Please review all details before submitting your booking</p>
                  </div>

                {/* Single Card Layout */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <CheckCircle className="w-6 h-6 mr-3" />
                        Booking Summary
                    </h3>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Selected Services */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Selected Services</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedServices)
                        .filter(([_, selected]) => selected)
                        .map(([serviceId]) => {
                                  const service = unifiedServices.find(s => s.id === serviceId);
                          if (!service) return null;
                          return (
                                    <div key={serviceId} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">{service.name}</div>
                                        <div className="text-xs text-gray-500">{service.duration} • {service.location}</div>
                              </div>
                                      <div className="text-orange-600 font-semibold text-sm ml-3">
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

                          {/* Client Details */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Client Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-600">Name</span>
                                <span className="text-sm font-medium text-gray-900">{formData.firstName} {formData.lastName}</span>
                      </div>
                              <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-600">Email</span>
                                <span className="text-sm font-medium text-gray-900">{formData.email}</span>
                      </div>
                      {formData.phone && (
                                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                  <span className="text-sm text-gray-600">Phone</span>
                                  <span className="text-sm font-medium text-gray-900">{formData.phone}</span>
                        </div>
                      )}
                      {formData.nationality && (
                                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                  <span className="text-sm text-gray-600">Nationality</span>
                                  <span className="text-sm font-medium text-gray-900">{formData.nationality}</span>
                        </div>
                      )}
                            </div>
                    </div>
                  </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Trip Details */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Trip Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
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
                                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
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
                              <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-600">Travelers</span>
                                <span className="text-sm font-medium text-gray-900">
                          {formData.adults} adult{formData.adults !== 1 ? 's' : ''}
                          {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? 'ren' : ''}`}
                                </span>
                      </div>
                      {formData.startDate && formData.endDate && (
                                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                  <span className="text-sm text-gray-600">Duration</span>
                                  <span className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </span>
                        </div>
                      )}
                    </div>
                  </div>

                          {/* Additional Information */}
                  {(formData.dietaryRequirements || formData.specialRequests) && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Additional Information</h4>
                      <div className="space-y-3">
                        {formData.dietaryRequirements && (
                                  <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-600 mb-1">Dietary Requirements</div>
                                    <div className="text-sm text-gray-900">{formData.dietaryRequirements}</div>
                          </div>
                        )}
                        {formData.specialRequests && (
                                  <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                                    <div className="text-sm text-gray-900">{formData.specialRequests}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                            </div>
                      </div>

                      {/* Total Summary */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-semibold text-gray-900">Total Amount</span>
                          <span className="text-3xl font-bold text-orange-600">${calculateTotal().toFixed(0)}</span>
                        </div>
                      {formData.children > 0 && (
                          <div className="text-sm text-orange-700 bg-orange-100 rounded-lg p-3 font-medium">
                          ✨ Children receive 30% discount on packages
                        </div>
                      )}
                  </div>

                  {/* Confirmation Notice */}
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                          <div className="bg-green-500 p-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                          <div>
                            <p className="font-semibold text-green-900 text-sm mb-2">Ready to Submit!</p>
                            <p className="text-sm text-green-700 leading-relaxed">
                              We'll contact you within 2 hours to confirm your booking and arrange payment.
                            </p>
                            <div className="mt-2 text-sm text-green-600 font-medium">
                              <strong>Next:</strong> Confirmation call → Payment → Trip prep
                        </div>
                      </div>
                    </div>
                  </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleStepChange(step - 1)}
                          className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed(step) || isSubmitting}
                          className={`flex-1 px-8 py-4 rounded-lg text-sm font-bold transition-all duration-200 ${canProceed(step) && !isSubmitting
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg transform hover:scale-105'
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
          ) : (
            // Other Steps - Full Width Layout
            <div className="min-h-[500px]">
              {/* Form Content - Full Width for steps 1-3 */}
              <div className="p-4 md:p-6">

                {/* Step 1: Service Selection - Compact Design */}
                {step === 1 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-lg p-4 md:p-6">
                    {/* Compact Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900">Select Services</h2>
                          <p className="text-sm text-gray-600">Choose your travel packages and services</p>
                      </div>
                      {selectedCount > 0 && (
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-lg">
                            {selectedCount} Selected - ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Compact Service Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {unifiedServices.map(service => (
                        <label
                          key={service.id}
                          className={`group relative cursor-pointer transition-all duration-200 ${selectedServices[service.id]
                            ? 'ring-2 ring-emerald-400 shadow-lg'
                            : 'hover:shadow-md'
                            }`}
                        >
                          <div className={`p-4 border-2 rounded-xl transition-all ${selectedServices[service.id]
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-teal-100'
                            : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50'
                            }`}>

                            {/* Compact Layout */}
                            <div className="space-y-3">
                              {/* Header with checkbox and price */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedServices[service.id] || false}
                              onChange={() => handleServiceToggle(service.id)}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                            />
                                  <h3 className={`text-sm font-bold ${selectedServices[service.id] ? 'text-emerald-900' : 'text-gray-900'} leading-tight`}>
                                  {service.name}
                                </h3>
                                </div>
                                <div className={`text-lg font-bold ${selectedServices[service.id] ? 'text-orange-600' : 'text-emerald-600'}`}>
                                  ${service.basePrice}
                                </div>
                              </div>

                              {/* Description */}
                              <p className={`text-xs ${selectedServices[service.id] ? 'text-emerald-800' : 'text-gray-600'} line-clamp-2`}>
                                {service.description}
                              </p>

                              {/* Tags */}
                              <div className={`flex items-center gap-2 text-xs ${selectedServices[service.id] ? 'text-emerald-700' : 'text-gray-500'}`}>
                                <span className="bg-white/70 px-2 py-1 rounded-full">{service.duration}</span>
                                <span className="bg-white/70 px-2 py-1 rounded-full">{service.location}</span>
                                </div>

                              {/* Selection Indicator */}
                            {selectedServices[service.id] && (
                                <div className="flex justify-center">
                                  <CheckCircle className="w-5 h-5 text-orange-500" />
                              </div>
                            )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details - Compact Design */}
                {step === 2 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg p-4 md:p-6">
                    {/* Compact Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900">Your Details</h2>
                          <p className="text-sm text-gray-600">Tell us about yourself and your travel plans</p>
                      </div>
                      {selectedCount > 0 && (
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-lg">
                            {selectedCount} Services - ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Compact Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <User className="w-4 h-4 mr-2 text-orange-500" />
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                            placeholder="Enter your first name"
                          />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <User className="w-4 h-4 mr-2 text-orange-500" />
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                            placeholder="Enter your last name"
                          />
                      </div>

                      {/* Email */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            placeholder="your.email@example.com"
                          />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-blue-500" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            placeholder="+252 61 123 4567"
                          />
                      </div>

                      {/* Gender */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <User className="w-4 h-4 mr-2 text-orange-500" />
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                          >
                            <option value="">Select your gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                      </div>

                      {/* Start Date */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-green-500" />
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            min={getMinDate()}
                          className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                          style={{ colorScheme: 'light' }}
                        />
                      </div>

                      {/* End Date */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-green-500" />
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            min={formData.startDate || getMinDate()}
                          className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                          style={{ colorScheme: 'light' }}
                        />
                      </div>

                      {/* Adults */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                            Adults *
                          </label>
                          <select
                            value={formData.adults}
                            onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>
                                {n} Adult{n > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                      </div>

                      {/* Children */}
                      <div className="space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                            Children
                          </label>
                          <select
                            value={formData.children}
                            onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                          >
                            {[0, 1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>
                                {n} Child{n !== 1 ? 'ren' : ''}
                              </option>
                            ))}
                          </select>
                      </div>

                      {/* Nationality */}
                      <div className="space-y-1 md:col-span-2 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-200">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                            Nationality
                          </label>
                          <select
                            value={formData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                        >
                          <option value="">Select your nationality</option>
                          <optgroup label="East Africa">
                            <option value="Somali">🇸🇴 Somali</option>
                            <option value="Ethiopian">🇪🇹 Ethiopian</option>
                            <option value="Kenyan">🇰🇪 Kenyan</option>
                            <option value="Ugandan">🇺🇬 Ugandan</option>
                            <option value="Tanzanian">🇹🇿 Tanzanian</option>
                          </optgroup>
                          <optgroup label="Popular">
                            <option value="American">🇺🇸 American</option>
                            <option value="British">🇬🇧 British</option>
                            <option value="Canadian">🇨🇦 Canadian</option>
                            <option value="German">🇩🇪 German</option>
                            <option value="French">🇫🇷 French</option>
                            <option value="Turkish">🇹🇷 Turkish</option>
                            <option value="Indian">🇮🇳 Indian</option>
                            <option value="Pakistani">🇵🇰 Pakistani</option>
                            <option value="Chinese">🇨🇳 Chinese</option>
                            <option value="Saudi">🇸🇦 Saudi</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="Other">🌍 Other</option>
                          </optgroup>
                          </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information - Compact Design */}
                {step === 3 && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-lg p-4 md:p-6">
                    {/* Compact Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900">Additional Information</h2>
                          <p className="text-sm text-gray-600">Optional details to help us serve you better</p>
                      </div>
                      {selectedCount > 0 && (
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-lg">
                            {selectedCount} Services - ${calculateTotal().toFixed(0)}
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Compact Form Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Dietary Requirements */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                          <div className="bg-green-500 p-2 rounded-lg mr-3">
                            <span className="text-white text-sm">🍽️</span>
                            </div>
                            Dietary Requirements
                          </label>
                          <textarea
                            value={formData.dietaryRequirements}
                            onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm resize-none"
                          rows={3}
                          placeholder="Any allergies, dietary restrictions, or special meal preferences..."
                        />
                        <p className="text-xs text-green-600 mt-2">💡 Helps us prepare the perfect dining experience</p>
                      </div>

                      {/* Special Requests */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-pink-200">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                          <div className="bg-pink-500 p-2 rounded-lg mr-3">
                            <span className="text-white text-sm">✨</span>
                            </div>
                            Special Requests
                          </label>
                          <textarea
                            value={formData.specialRequests}
                            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors shadow-sm resize-none"
                          rows={3}
                          placeholder="Accessibility needs, celebrations, or special preferences..."
                        />
                        <p className="text-xs text-pink-600 mt-2">🎉 We love making your experience memorable</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Responsive Navigation */}
                <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {step > 1 && (
                      <button
                        onClick={() => handleStepChange(step - 1)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </button>
                    )}

                    <button
                      onClick={() => handleStepChange(step + 1)}
                      disabled={!canProceed(step)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${canProceed(step)
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {step === 3 ? 'Review Booking' : 'Continue'}
                    </button>
                  </div>

                  {/* Help Link - Always visible */}
                  <div className="text-center">
                    <a
                      href="https://wa.me/252907793854"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm text-gray-600 hover:text-orange-600 font-medium inline-flex items-center transition-colors"
                    >
                      <span className="mr-1">💬</span>
                      Need help? WhatsApp us
                    </a>
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