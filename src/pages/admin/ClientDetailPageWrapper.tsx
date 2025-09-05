import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { BookingsService } from '../../services/api';
import ClientDetailPage from './ClientDetailPage';

const ClientDetailPageWrapper: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Try to load real data first, fallback to mock data if needed
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('Starting to load bookings...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const bookingsPromise = BookingsService.getBookings(1, 1000);
      
      const response = await Promise.race([bookingsPromise, timeoutPromise]) as any;
      
      console.log('Bookings response:', response);
      
      if (response.success && response.data) {
        console.log('Bookings loaded successfully:', response.data.length, 'bookings');
        setBookings(response.data as any[]);
      } else {
        console.error('Bookings API error:', response.error);
        throw new Error(response.error?.message || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      
      // For development: Use mock data if API fails
      const mockBookings = [
        {
          id: '1',
          customer_name: 'Said Abdishakur',
          customer_email: 'saidabdishakur2000@gmail.com',
          customer_phone: '+252907841579',
          nationality: 'Somali',
          gender: 'Male',
          package_id: 'pkg-1',
          destination_id: 'dest-1',
          package_name: 'Mogadishu City Tour',
          destination_name: 'Mogadishu',
          booking_date: '2025-01-15',
          end_date: '2025-01-17',
          participants: 2,
          adults: 2,
          children: 0,
          total_amount: 305.00,
          status: 'confirmed',
          payment_status: 'paid',
          special_requests: 'Vegetarian meals preferred',
          dietary_requirements: 'Vegetarian meals preferred',
          selected_services: [
            { id: '1', name: 'City Tour', price: 150, category: 'Tour', quantity: 1 },
            { id: '2', name: 'Hotel Accommodation', price: 155, category: 'Accommodation', quantity: 2 }
          ],
          assigned_to: null,
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-10T10:00:00Z'
        },
        {
          id: '2',
          customer_name: 'Said Abdishakur',
          customer_email: 'saidabdishakur2000@gmail.com',
          customer_phone: '+252907841579',
          nationality: 'Somali',
          gender: 'Male',
          package_id: 'pkg-2',
          destination_id: 'dest-2',
          package_name: 'Beach Resort Package',
          destination_name: 'Lido Beach',
          booking_date: '2024-12-20',
          end_date: '2024-12-23',
          participants: 2,
          adults: 1,
          children: 1,
          total_amount: 450.00,
          status: 'completed',
          payment_status: 'paid',
          special_requests: null,
          dietary_requirements: null,
          selected_services: [
            { id: '3', name: 'Beach Resort', price: 300, category: 'Resort', quantity: 3 },
            { id: '4', name: 'Water Sports', price: 150, category: 'Activity', quantity: 1 }
          ],
          assigned_to: null,
          created_at: '2024-12-15T14:30:00Z',
          updated_at: '2024-12-15T14:30:00Z'
        }
      ];
      
      console.log('Using mock data for development');
      setBookings(mockBookings);
      showToast('warning', 'Warning', 'Using mock data - API connection failed');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return <ClientDetailPage bookings={bookings} />;
};

export default ClientDetailPageWrapper;