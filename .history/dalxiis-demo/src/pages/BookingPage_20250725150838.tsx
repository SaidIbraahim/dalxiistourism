import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Phone, Mail, MessageCircle, Clock, CheckCircle, Star } from 'lucide-react';

interface BookingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  
  // Trip Details
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  
  // Service Specific
  pickupLocation?: string;
  dropoffLocation?: string;
  flightNumber?: string;
  arrivalTime?: string;
  hotelCity?: string;
  hotelPreference?: string;
  vehicleType?: string;
  tourDestinations?: string[];
  
  // Additional
  specialRequests: string;
  dietaryRequirements: string;
}

const BookingPage = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: 0,
    specialRequests: '',
    dietaryRequirements: '',
    tourDestinations: []
  });

  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Service configurations
  const serviceConfigs: Record<string, any> = {
    'package-1': {
      title: 'Garowe to Bosaso Adventure',
      type: 'VIP Package',
      price: 450,
      duration: '3 Days',
      description: 'Experience the coastal beauty of Bosaso with premium accommodations',
      includes: ['Luxury Transport', '4-Star Hotels', 'All Meals', 'Private Guide', 'Airport Transfer'],
      highlights: ['Mareera Beach', 'Biyo Kuleele', 'Cultural Tours', 'Traditional Qaaci'],
      fields: ['personal', 'dates', 'group', 'preferences']
    },
    'package-2': {
      title: 'Eyl Beach Retreat',
      type: 'Basic Package',
      price: 280,
      duration: '2 Days',
      description: 'Relax and unwind at the beautiful Eyl beaches',
      includes: ['Standard Transport', 'Beach Resort', 'Breakfast', 'Activities', 'Guide'],
      highlights: ['Eyl Resort', 'Boat Rides', 'Traditional Music', 'Fishing Experience'],
      fields: ['personal', 'dates', 'group', 'preferences']
    },
    'package-3': {
      title: 'Puntland Explorer',
      type: 'VIP Package',
      price: 650,
      duration: '5 Days',
      description: 'Comprehensive tour covering the best of Puntland\'s destinations',
      includes: ['Luxury Transport', 'Premium Hotels', 'All Meals', 'Private Guide', 'All Activities'],
      highlights: ['Multiple Cities', 'Caluula Coast', 'Raas Xaafuun', 'Historical Sites'],
      fields: ['personal', 'dates', 'group', 'destinations', 'preferences']
    },
    'airport-transfer': {
      title: 'Airport Transfer Service',
      type: 'Transportation',
      price: 25,
      duration: 'Per trip',
      description: '24/7 professional airport pickup and drop-off services',
      includes: ['Professional Driver', 'Meet & Greet', 'Luggage Assistance', 'Flight Tracking'],
      fields: ['personal', 'pickup', 'preferences']
    },
    'accommodation': {
      title: 'Hotel Booking Service',
      type: 'Accommodation',
      price: 'Varies',
      duration: 'Per night',
      description: 'Premium hotel bookings with our trusted partners',
      includes: ['Best Rate Guarantee', 'Instant Confirmation', 'Concierge Support'],
      fields: ['personal', 'dates', 'hotel', 'preferences']
    },
    'vehicle-rental': {
      title: 'Vehicle Rental',
      type: 'Transportation',
      price: 40,
      duration: 'Per day',
      description: 'Modern fleet of well-maintained vehicles',
      includes: ['Insurance', 'GPS Navigation', 'Fuel Efficient', 'Emergency Support'],
      fields: ['personal', 'dates', 'vehicle', 'preferences']
    }
  };

  const config = serviceConfigs[serviceType || ''] || serviceConfigs['package-1'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleDestinationToggle = (destination: string) => {
    setFormData(prev => ({
      ...prev,
      tourDestinations: prev.tourDestinations?.includes(destination)
        ? prev.tourDestinations.filter(d => d !== destination)
        : [...(prev.tourDestinations || []), destination]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = calculateTotalPrice();
    
    const whatsappMessage = `🌟 *NEW BOOKING REQUEST* 🌟

*Service:* ${config.title} (${config.type})
*Estimated Total:* $${totalPrice}

*👤 PERSONAL INFORMATION*
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Nationality: ${formData.nationality}

*📅 TRIP DETAILS*
${formData.startDate ? `Start Date: ${formData.startDate}` : ''}
${formData.endDate ? `End Date: ${formData.endDate}` : ''}
Adults: ${formData.adults}
${formData.children > 0 ? `Children: ${formData.children}` : ''}

${formData.pickupLocation ? `*✈️ PICKUP DETAILS*
Pickup: ${formData.pickupLocation}
${formData.dropoffLocation ? `Drop-off: ${formData.dropoffLocation}` : ''}
${formData.flightNumber ? `Flight: ${formData.flightNumber}` : ''}
${formData.arrivalTime ? `Arrival: ${formData.arrivalTime}` : ''}` : ''}

${formData.hotelCity ? `*🏨 ACCOMMODATION*
City: ${formData.hotelCity}
Hotel Preference: ${formData.hotelPreference || 'Any'}` : ''}

${formData.vehicleType ? `*🚗 VEHICLE*
Type: ${formData.vehicleType}` : ''}

${formData.tourDestinations && formData.tourDestinations.length > 0 ? `*🗺️ DESTINATIONS*
${formData.tourDestinations.join(', ')}` : ''}

${formData.dietaryRequirements ? `*🍽️ DIETARY REQUIREMENTS*
${formData.dietaryRequirements}` : ''}

${formData.specialRequests ? `*💭 SPECIAL REQUESTS*
${formData.specialRequests}` : ''}

---
*Thank you for choosing Dalxiis Tourism! We'll contact you within 2 hours to confirm your booking and arrange payment details.*`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/252905345879?text=${encodedMessage}`, '_blank');
  };

  const calculateTotalPrice = () => {
    const basePrice = typeof config.price === 'number' ? config.price : 0;
    const nights = formData.startDate && formData.endDate ? 
      Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) : 1;
    
    if (serviceType?.includes('package')) {
      return basePrice * formData.adults + (formData.children * basePrice * 0.7);
    } else if (serviceType === 'vehicle-rental') {
      return basePrice * nights;
    }
    return basePrice;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#1c2c54] mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  placeholder="Your last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  placeholder="+252 xxx xxx xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
              >
                <option value="">Select nationality</option>
                <option value="Somali">Somali</option>
                <option value="Ethiopian">Ethiopian</option>
                <option value="Kenyan">Kenyan</option>
                <option value="American">American</option>
                <option value="British">British</option>
                <option value="Canadian">Canadian</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#1c2c54] mb-6">Trip Details</h3>
            
            {serviceType === 'airport-transfer' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
                    <select
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    >
                      <option value="">Select pickup location</option>
                      <option value="Garowe Airport">Garowe Airport</option>
                      <option value="Bosaso Airport">Bosaso Airport</option>
                      <option value="Galkaio Airport">Galkaio Airport</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Other">Other Location</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Location *</label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                      placeholder="Enter destination address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flight Number</label>
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                      placeholder="e.g., ET123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                    <input
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : serviceType === 'accommodation' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <select
                    name="hotelCity"
                    value={formData.hotelCity}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  >
                    <option value="">Select city</option>
                    <option value="Garowe">Garowe</option>
                    <option value="Bosaso">Bosaso</option>
                    <option value="Eyl">Eyl</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Preference</label>
                  <select
                    name="hotelPreference"
                    value={formData.hotelPreference}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  >
                    <option value="">Any available hotel</option>
                    {formData.hotelCity === 'Garowe' && (
                      <>
                        <option value="Martisoor">Martisoor Hotel</option>
                        <option value="DreamPoint">DreamPoint Hotel</option>
                        <option value="Militon">Militon Hotel</option>
                      </>
                    )}
                    {formData.hotelCity === 'Bosaso' && (
                      <>
                        <option value="Mareera">Mareera Hotel</option>
                        <option value="Jabir">Jabir Hotel</option>
                      </>
                    )}
                    {formData.hotelCity === 'Eyl' && (
                      <option value="Eyl Resort Hotel">Eyl Resort Hotel</option>
                    )}
                  </select>
                </div>
              </div>
            ) : serviceType === 'vehicle-rental' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Economy Car">Economy Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury Sedan">Luxury Sedan</option>
                    <option value="Van">Van (7-8 seats)</option>
                    <option value="Bus">Bus (15+ seats)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adults *</label>
                    <select
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Children (Under 12)</label>
                    <select
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                    >
                      {[0,1,2,3,4].map(num => (
                        <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        if (serviceType === 'package-3' && config.fields.includes('destinations')) {
          return (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-[#1c2c54] mb-6">Select Destinations</h3>
              <p className="text-gray-600 mb-6">Choose the destinations you'd like to visit during your Puntland Explorer tour:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Caluula', 'Baargaal', 'Raas Xaafuun', 'Mareera', 'Biyo Kuleele',
                  'Eyl', 'Marraya', 'Suuj', 'Garacad'
                ].map((destination) => (
                  <label key={destination} className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#f29520] transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tourDestinations?.includes(destination) || false}
                      onChange={() => handleDestinationToggle(destination)}
                      className="w-5 h-5 text-[#f29520] rounded focus:ring-[#f29520] mr-3"
                    />
                    <span className="text-gray-700">{destination}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        // Fall through to preferences step
        setCurrentStep(4);
        return null;

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#1c2c54] mb-6">Additional Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Requirements</label>
              <textarea
                name="dietaryRequirements"
                value={formData.dietaryRequirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                placeholder="Any dietary restrictions, allergies, or special meal requests..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-transparent transition-all"
                placeholder="Any special requests, accessibility needs, preferred activities, or other requirements..."
              />
            </div>
            
            {/* Price Summary */}
            <div className="bg-gradient-to-br from-[#f29520] to-[#2f67b5] text-white rounded-2xl p-6">
              <h4 className="text-xl font-semibold mb-4">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price ({config.type})</span>
                  <span>${typeof config.price === 'number' ? config.price : 0}</span>
                </div>
                {formData.adults > 1 && (
                  <div className="flex justify-between">
                    <span>Adults × {formData.adults}</span>
                    <span>${typeof config.price === 'number' ? config.price * formData.adults : 0}</span>
                  </div>
                )}
                {formData.children > 0 && (
                  <div className="flex justify-between">
                    <span>Children × {formData.children} (30% off)</span>
                    <span>${typeof config.price === 'number' ? Math.round(config.price * formData.children * 0.7) : 0}</span>
                  </div>
                )}
                <div className="border-t border-white border-opacity-30 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Estimated Total</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-90 mt-4">
                *Final price may vary based on availability and special requirements. 
                Our team will confirm the exact amount before payment.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTotalSteps = () => {
    if (serviceType === 'airport-transfer') return 3;
    if (serviceType === 'package-3') return 4;
    return 3;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        if (serviceType === 'airport-transfer') {
          return formData.pickupLocation && formData.dropoffLocation;
        }
        if (serviceType === 'accommodation') {
          return formData.startDate && formData.endDate && formData.hotelCity;
        }
        if (serviceType === 'vehicle-rental') {
          return formData.startDate && formData.endDate && formData.vehicleType;
        }
        return formData.startDate && formData.adults > 0;
      case 3:
        if (serviceType === 'package-3') {
          return formData.tourDestinations && formData.tourDestinations.length > 0;
        }
        return true;
      default:
        return true;
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1c2c54] mb-4">Service Not Found</h1>
          <Link to="/" className="text-[#f29520] hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/packages"
            className="inline-flex items-center text-[#2f67b5] hover:text-[#f29520] transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Services
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-2xl">D</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#1c2c54]">{config.title}</h1>
                    <p className="text-[#f29520] font-semibold text-lg">{config.type}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg mb-6">{config.description}</p>
                
                {config.includes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#1c2c54] mb-3">What's Included:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {config.includes.map((item: string, index: number) => (
                        <div key={index} className="flex items-center text-gray-600">
                          <CheckCircle className="h-4 w-4 text-[#f29520] mr-2" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {config.highlights && (
                  <div>
                    <h3 className="font-semibold text-[#1c2c54] mb-3">Highlights:</h3>
                    <div className="flex flex-wrap gap-2">
                      {config.highlights.map((highlight: string, index: number) => (
                        <span key={index} className="bg-[#e0dddf] text-[#1c2c54] px-3 py-1 rounded-full text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-[#1c2c54] to-[#2f67b5] text-white rounded-xl p-6 sticky top-24">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold mb-1">
                      ${typeof config.price === 'number' ? config.price : 'Varies'}
                    </div>
                    <div className="text-sm opacity-90">{config.duration}</div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{config.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-[#f29520]" />
                      <span>4.9 average rating</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Professional guides</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                    <p className="text-xs opacity-80">
                      Free cancellation up to 24 hours before your trip. 
                      Contact us for group discounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            {Array.from({ length: getTotalSteps() }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive
                        ? 'bg-[#f29520] text-white'
                        : isCompleted
                        ? 'bg-[#2f67b5] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  {stepNumber < getTotalSteps() && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        isCompleted ? 'bg-[#2f67b5]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">
              Step {currentStep} of {getTotalSteps()}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3 border-2 border-[#2f67b5] text-[#2f67b5] rounded-full font-semibold hover:bg-[#2f67b5] hover:text-white transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              
              {currentStep < getTotalSteps() ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!isStepValid()}
                  className="px-6 py-3 bg-[#f29520] text-white rounded-full font-semibold hover:bg-[#e08420] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className="px-8 py-3 bg-[#f29520] text-white rounded-full font-semibold hover:bg-[#e08420] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Complete Booking
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contact Support */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Need Help with Your Booking?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our travel experts are available 24/7 to assist you with any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/252905345879"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f29520] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+252907793854"
              className="border-2 border-[#f29520] text-[#f29520] px-6 py-3 rounded-full font-semibold hover:bg-[#f29520] hover:text-white transition-colors inline-flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;