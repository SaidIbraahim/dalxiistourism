import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, 
  Star, Award, Activity, Clock, Edit, Trash2, Plus, Filter,
  Download, RefreshCw, MessageSquare, FileText, CreditCard,
  TrendingUp, BarChart3, Eye, MoreHorizontal, AlertCircle,
  CheckCircle, XCircle, Pause, Printer
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { components, componentSizes, getBadgeClass } from '../../styles/designSystem';
import { DatePicker } from '../../components/ui';
import BookingActionButtons from '../../components/admin/booking/BookingActionButtons';
import BookingDetailsModal from '../../components/admin/booking/BookingDetailsModal';
import CancelRefundModal from '../../components/admin/booking/CancelRefundModal';
import ClientEditModal from '../../components/admin/client/ClientEditModal';
import NotesAndActivity from '../../components/admin/client/NotesAndActivity';
import BookingActionService from '../../services/bookingActionService';
import { ClientService } from '../../services/clientService';
import { ClientExportService } from '../../services/clientExportService';
import { formatBookingId } from '../../utils/bookingIdGenerator';
import { cacheService } from '../../services/CacheService';

// Utility function to extract package name from booking data
const getPackageName = (booking: any): string => {
  // First try to get from joined tour_packages table
  if (booking.tour_packages?.name) {
    return booking.tour_packages.name;
  }
  
  // Then try package_name field
  if (booking.package_name) {
    return booking.package_name;
  }
  
  // Try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services) && booking.selected_services.length > 0) {
    // Look for services with specific categories that indicate packages
    const packageService = booking.selected_services.find((s: any) => 
      s.category === 'Package' || 
      s.category === 'Tour' || 
      s.category === 'Accommodation' ||
      s.category === 'Transport'
    );
    
    if (packageService) {
      return packageService.name;
    }
    
    // If no specific package category, look for services that might be packages
    const potentialPackages = booking.selected_services.filter((s: any) => 
      s.name && (
        s.name.toLowerCase().includes('package') ||
        s.name.toLowerCase().includes('tour') ||
        s.name.toLowerCase().includes('resort') ||
        s.name.toLowerCase().includes('hotel') ||
        s.name.toLowerCase().includes('transfer')
      )
    );
    
    if (potentialPackages.length > 0) {
      return potentialPackages[0].name;
    }
    
    // If only one service, use it as the package name
    if (booking.selected_services.length === 1) {
      return booking.selected_services[0].name;
    }
    
    // If multiple services, create a descriptive summary
    if (booking.selected_services.length > 1) {
      const serviceNames = booking.selected_services.map((s: any) => s.name).filter(Boolean);
      if (serviceNames.length > 0) {
        return serviceNames.length === 1 ? serviceNames[0] : `${serviceNames.length} Services Package`;
      }
    }
  }
  
  return 'Custom Package';
};

// Utility function to extract destination name from booking data
const getDestinationName = (booking: any): string => {
  // First try to get from joined destinations table
  if (booking.destinations?.name) {
    return booking.destinations.name;
  }
  
  // Then try destination_name field
  if (booking.destination_name) {
    return booking.destination_name;
  }
  
  // Try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services) && booking.selected_services.length > 0) {
    // Look for location/destination fields in services
    const destinations = booking.selected_services
      .map((s: any) => s.location || s.destination || s.region || s.area)
      .filter(Boolean)
      .filter((dest: any, index: number, arr: any[]) => arr.indexOf(dest) === index);
    
    if (destinations.length === 1) {
      return destinations[0];
    }
    if (destinations.length > 1) {
      return destinations.join(', ');
    }
    
    // If no explicit location fields, try to extract from service names that might contain locations
    const locationServices = booking.selected_services.filter((s: any) => 
      s.name && (
        s.name.toLowerCase().includes('beach') ||
        s.name.toLowerCase().includes('city') ||
        s.name.toLowerCase().includes('island') ||
        s.name.toLowerCase().includes('mountain') ||
        s.name.toLowerCase().includes('park') ||
        s.name.toLowerCase().includes('museum') ||
        s.name.toLowerCase().includes('airport')
      )
    );
    
    if (locationServices.length > 0) {
      const locations = locationServices.map((s: any) => s.name).filter(Boolean);
      return locations.length === 1 ? locations[0] : locations.join(', ');
    }
  }
  
  return 'Multiple Destinations';
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  gender: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  status: 'active' | 'inactive';
  joinDate: string;
  bookings: any[];
  customerType: 'new' | 'returning' | 'vip';
  averageBookingValue: number;
  daysSinceLastBooking: number;
  notes?: string[];
  tags?: string[];
}

interface ClientDetailPageProps {
  bookings: any[];
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ bookings }) => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'timeline' | 'notes'>('overview');
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  // Enhanced controls for Booking History
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'id' | 'status' | 'payment' | 'service'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (clientId && bookings.length > 0) {
      console.log('useEffect triggered - clientId:', clientId, 'bookings length:', bookings.length);
      loadCustomerData(clientId);
    } else if (clientId && bookings.length === 0) {
      // If no bookings are available, show not found
      console.log('No bookings available, setting customer to null');
      setCustomer(null);
      setLoading(false);
    }
  }, [clientId, bookings.length]); // Use bookings.length instead of bookings array

  const loadCustomerData = async (email: string) => {
    console.log('Loading customer data for email:', email);
    const cacheKey = `client_${email}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      setCustomer(cached.customer);
      setNotes(cached.notes || []);
      setActivities(cached.activities || []);
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    try {
      // Decode the email from URL encoding
      const decodedEmail = decodeURIComponent(email);
      console.log('Decoded email:', decodedEmail);
      
      // Use ClientService to get comprehensive client data
      const response = await ClientService.getClientProfile(decodedEmail);
      
      if (response.success && response.data) {
        const { profile, bookings: clientBookings, notes: clientNotes, activities: clientActivities } = response.data;
        
        // Set customer data
        setCustomer({
          id: profile.customer_email,
          name: profile.customer_name,
          email: profile.customer_email,
          phone: profile.customer_phone || '',
          nationality: profile.nationality || '',
          gender: profile.gender || '',
          totalBookings: clientBookings.length,
          totalSpent: clientBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
          lastBooking: clientBookings.length > 0 ? clientBookings[0].booking_date : '',
          status: 'active' as const,
          joinDate: profile.created_at,
          bookings: clientBookings,
          customerType: clientBookings.length > 1 ? 'returning' as const : 'new' as const,
          averageBookingValue: clientBookings.length > 0 ? clientBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / clientBookings.length : 0,
          daysSinceLastBooking: clientBookings.length > 0 ? Math.floor((Date.now() - new Date(clientBookings[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          notes: clientNotes.map(note => note.content),
          tags: []
        });
        
        // Set notes and activities
        setNotes(clientNotes);
        setActivities(clientActivities);
        
        console.log('Customer data loaded successfully:', profile.customer_name);
        cacheService.set(cacheKey, { customer: {
          id: profile.customer_email,
          name: profile.customer_name,
          email: profile.customer_email,
          phone: profile.customer_phone || '',
          nationality: profile.nationality || '',
          gender: profile.gender || '',
          totalBookings: clientBookings.length,
          totalSpent: clientBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
          lastBooking: clientBookings.length > 0 ? clientBookings[0].booking_date : '',
          status: 'active' as const,
          joinDate: profile.created_at,
          bookings: clientBookings,
          customerType: clientBookings.length > 1 ? 'returning' as const : 'new' as const,
          averageBookingValue: clientBookings.length > 0 ? clientBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / clientBookings.length : 0,
          daysSinceLastBooking: clientBookings.length > 0 ? Math.floor((Date.now() - new Date(clientBookings[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          notes: clientNotes.map(note => note.content),
          tags: []
        }, notes: clientNotes, activities: clientActivities }, 5 * 60 * 1000);
      } else {
        console.error('Failed to load customer data:', response.error);
        setCustomer(null);
        setNotes([]);
        setActivities([]);
      }
    } catch (error: any) {
      console.error('Error loading customer data:', error);
      setCustomer(null);
      setNotes([]);
      setActivities([]);
    } finally {
        setLoading(false);
    }
  };

  // Note management functions
  const handleAddNote = async (noteData: any) => {
    if (!customer) return;
    
    try {
      const response = await ClientService.addNote(customer.email, noteData);
      if (response.success) {
        showToast('success', 'Success', 'Note added successfully');
        // Reload customer data to get updated notes
        await loadCustomerData(customer.email);
      } else {
        showToast('error', 'Error', response.error?.message || 'Failed to add note');
      }
    } catch (error: any) {
      showToast('error', 'Error', 'Failed to add note');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const response = await ClientService.updateNote(noteId, content);
      if (response.success) {
        showToast('success', 'Success', 'Note updated successfully');
        // Reload customer data to get updated notes
        if (customer) {
          await loadCustomerData(customer.email);
        }
      } else {
        showToast('error', 'Error', response.error?.message || 'Failed to update note');
      }
    } catch (error: any) {
      showToast('error', 'Error', 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await ClientService.deleteNote(noteId);
      if (response.success) {
        showToast('success', 'Success', 'Note deleted successfully');
        // Reload customer data to get updated notes
        if (customer) {
          await loadCustomerData(customer.email);
        }
      } else {
        showToast('error', 'Error', response.error?.message || 'Failed to delete note');
      }
    } catch (error: any) {
      showToast('error', 'Error', 'Failed to delete note');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (start: string, end?: string) => {
    const s = new Date(start);
    const e = end ? new Date(end) : undefined;
    const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!e) return startStr;
    const endStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} to ${endStr}`;
  };

  const getCustomerTypeConfig = (type: string) => {
    switch (type) {
      case 'vip':
        return { 
          label: 'VIP Customer', 
          icon: Award, 
          color: 'text-purple-600',
          bg: 'bg-purple-100',
          border: 'border-purple-200'
        };
      case 'returning':
        return { 
          label: 'Returning Customer', 
          icon: Star, 
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-200'
        };
      default:
        return { 
          label: 'New Customer', 
          icon: User, 
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-200'
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Action handlers
  const handleViewBooking = async (bookingId: string) => {
    try {
      const booking = customer?.bookings?.find((b: any) => b.id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setIsBookingModalOpen(true);
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to load booking details');
    }
  };

  const handleViewInvoice = async (bookingId: string) => {
    try {
      const booking = customer?.bookings?.find((b: any) => b.id === bookingId);
      if (booking) {
        // Map the booking data to match BookingActionData interface
        const bookingActionData = {
          id: booking.id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          package_name: getPackageName(booking),
          destination: getDestinationName(booking),
          booking_date: booking.booking_date,
          travel_date: booking.end_date || booking.booking_date,
          total_amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          selected_services: booking.selected_services,
          adults: booking.adults || 1,
          children: booking.children || 0,
          created_at: booking.created_at,
          payment_records: booking.payment_records || []
        };

        console.log('Viewing invoice for booking:', bookingActionData);
        
        const response = await BookingActionService.viewInvoice(bookingActionData);
        if (response.success) {
          showToast('success', 'Success', 'Invoice opened in new window');
        } else {
          console.error('Invoice generation failed:', response.error);
          showToast('error', 'Error', response.error?.message || 'Failed to generate invoice');
        }
      }
    } catch (error: any) {
      console.error('Error in handleViewInvoice:', error);
      showToast('error', 'Error', `Failed to view invoice: ${error.message}`);
    }
  };

  const handlePrintInvoice = async (bookingId: string) => {
    try {
      const booking = customer?.bookings?.find((b: any) => b.id === bookingId);
      if (booking) {
        // Map the booking data to match BookingActionData interface
        const bookingActionData = {
          id: booking.id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          package_name: getPackageName(booking),
          destination: getDestinationName(booking),
          booking_date: booking.booking_date,
          travel_date: booking.end_date || booking.booking_date,
          total_amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          selected_services: booking.selected_services,
          adults: booking.adults || 1,
          children: booking.children || 0,
          created_at: booking.created_at,
          payment_records: booking.payment_records || []
        };

        console.log('Printing invoice for booking:', bookingActionData);
        
        const response = await BookingActionService.printInvoice(bookingActionData);
        if (response.success) {
          const documentType = booking.payment_status === 'paid' ? 'Receipt' : 'Invoice';
          showToast('success', 'Success', `${documentType} print dialog opened successfully`);
        } else {
          console.error('Invoice print failed:', response.error);
          showToast('error', 'Error', response.error?.message || 'Failed to print invoice');
        }
      }
    } catch (error: any) {
      console.error('Error in handlePrintInvoice:', error);
      showToast('error', 'Error', `Failed to print invoice: ${error.message}`);
    }
  };

  const handlePrintTicket = async (bookingId: string) => {
    try {
      const booking = customer?.bookings?.find((b: any) => b.id === bookingId);
      if (booking) {
        // Map the booking data to match BookingActionData interface
        const bookingActionData = {
          id: booking.id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          package_name: getPackageName(booking),
          destination: getDestinationName(booking),
          booking_date: booking.booking_date,
          travel_date: booking.end_date || booking.booking_date,
          total_amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          selected_services: booking.selected_services,
          adults: booking.adults || 1,
          children: booking.children || 0,
          created_at: booking.created_at,
          payment_records: booking.payment_records || []
        };

        console.log('Printing ticket for booking:', bookingActionData);
        
        const response = await BookingActionService.printTicket(bookingActionData);
        if (response.success) {
          showToast('success', 'Success', 'Ticket print dialog opened successfully');
        } else {
          console.error('Ticket generation failed:', response.error);
          showToast('error', 'Error', response.error?.message || 'Failed to generate ticket');
        }
      }
    } catch (error: any) {
      console.error('Error in handlePrintTicket:', error);
      showToast('error', 'Error', `Failed to print ticket: ${error.message}`);
    }
  };

  const handleCancelRefund = (bookingId: string) => {
    const booking = customer?.bookings?.find((b: any) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsCancelModalOpen(true);
    }
  };

  const handleConfirmCancelRefund = async (action: 'cancel' | 'refund', reason?: string) => {
    if (!selectedBooking) return;

    try {
      const response = await BookingActionService.cancelRefundBooking(selectedBooking.id, action, reason);
      if (response.success) {
        showToast('success', 'Success', response.data || `${action} completed successfully`);
        // Refresh the customer data to reflect the status change
        if (clientId) {
          loadCustomerData(clientId);
        }
      } else {
        showToast('error', 'Error', response.error?.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      showToast('error', 'Error', `Failed to ${action} booking`);
    }
  };

  // Helpers for actions visibility
  const canPrintTicket = (booking: any) => booking.payment_status === 'paid';
  const canCancel = (booking: any) => ['pending', 'confirmed'].includes(booking.status);
  const canRefund = (booking: any) => booking.status === 'completed' && booking.payment_status === 'paid';

  // Handle edit customer
  const handleEditCustomer = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveCustomer = (updatedCustomer: any) => {
    setCustomer(prev => prev ? { ...prev, ...updatedCustomer } : null);
    showToast('success', 'Success', 'Customer information updated successfully');
  };

  // Handle export customer - direct export without modal
  const handleExportCustomer = async () => {
    if (!customer) {
      showToast('error', 'Export Failed', 'No customer data available');
      return;
    }

    try {
      showToast('info', 'Exporting', 'Preparing customer data for export...');
      
      const response = await ClientExportService.exportClientToExcel(customer.email);
      
      if (response.success) {
        showToast('success', 'Export Complete', 'Customer data exported to Excel successfully');
      } else {
        showToast('error', 'Export Failed', response.error?.message || 'Failed to export customer data');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      showToast('error', 'Export Failed', error.message || 'An unexpected error occurred during export');
    }
  };

  // Enhanced filtering logic with better accuracy
  const normalizedFiltered = (customer?.bookings || [])
    // status filter - exact match
    .filter((booking: any) => {
      if (bookingFilter === 'all') return true;
      return booking.status?.toLowerCase() === bookingFilter.toLowerCase();
    })
    // date range filter - improved date handling
    .filter((booking: any) => {
      if (!fromDate && !toDate) return true;
      
      // Try multiple date fields in order of preference
      const dateFields = [
        booking.booking_date,
        booking.travel_date,
        booking.start_date,
        booking.created_at,
        booking.updated_at
      ];
      
      let bookingDate: Date | null = null;
      for (const field of dateFields) {
        if (field) {
          const parsed = new Date(field);
          if (!isNaN(parsed.getTime())) {
            bookingDate = parsed;
            break;
          }
        }
      }
      
      if (!bookingDate) return true; // Include if no valid date found
      
      // Create date boundaries
      const fromDateTime = fromDate ? new Date(fromDate + 'T00:00:00.000Z') : null;
      const toDateTime = toDate ? new Date(toDate + 'T23:59:59.999Z') : null;
      
      // Check date range
      if (fromDateTime && bookingDate < fromDateTime) return false;
      if (toDateTime && bookingDate > toDateTime) return false;
      
      return true;
    })


  const getSortValue = (booking: any) => {
    switch (sortBy) {
      case 'date':
        // Try multiple date fields for sorting
        const dateFields = [
          booking.booking_date,
          booking.travel_date,
          booking.start_date,
          booking.created_at
        ];
        
        for (const field of dateFields) {
          if (field) {
            const date = new Date(field);
            if (!isNaN(date.getTime())) {
              return date.getTime();
            }
          }
        }
        return 0;
        
      case 'amount':
        return Number(booking.total_amount || booking.amount || 0);
        
      case 'id':
        // Handle different ID formats
        const idValue = booking.id || booking.booking_id || booking.reference_number || '';
        // Extract numeric part for better sorting
        const numericMatch = String(idValue).match(/\d+/);
        return numericMatch ? Number(numericMatch[0]) : 0;
        
      case 'status':
        // Sort by status priority
        const statusPriority = {
          'pending': 1,
          'confirmed': 2,
          'completed': 3,
          'cancelled': 4,
          'rejected': 5
        };
        return statusPriority[booking.status as keyof typeof statusPriority] || 999;
        
      case 'payment':
        // Sort by payment status priority
        const paymentPriority = {
          'pending': 1,
          'paid': 2,
          'refunded': 3,
          'failed': 4
        };
        return paymentPriority[booking.payment_status as keyof typeof paymentPriority] || 999;
        
      case 'service':
        return String(booking.package_name || booking.tour_name || booking.service_name || '').toLowerCase();
        
      default:
        return 0;
    }
  };

  const sortedBookings = [...normalizedFiltered].sort((a, b) => {
    const va = getSortValue(a);
    const vb = getSortValue(b);
    if (va < vb) return sortDirection === 'asc' ? -1 : 1;
    if (va > vb) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sortedBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentPageItems = sortedBookings.slice(startIndex, startIndex + pageSize);

  if (loading && !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 animate-pulse">
            <div className="h-28 bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
            <div className="h-5 bg-gray-200 w-40 rounded mb-6"></div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-6">The requested customer could not be found.</p>
          <button
            onClick={() => navigate('/admin/booking-management')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const typeConfig = getCustomerTypeConfig(customer.customerType);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 py-3 text-sm text-gray-500 border-b border-gray-100">
            <button
              onClick={() => navigate('/admin')}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              Admin Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/admin?section=bookings')}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              Booking Management
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/admin?section=bookings')}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              Customers
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{customer?.name || 'Customer Details'}</span>
          </div>
          
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin?section=bookings')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Back to Booking Management"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customer Profile</h1>
                <p className="text-sm text-gray-600">Complete customer information and booking history</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportCustomer}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <button 
                onClick={handleEditCustomer}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{customer.name}</h2>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.nationality && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{customer.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border} bg-white`}>
                  <TypeIcon className="w-4 h-4 mr-2" />
                  {typeConfig.label}
                </div>
                <div className="mt-3 text-blue-100 text-sm">
                  Customer since {formatDate(customer.joinDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{customer.totalBookings}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{formatCurrency(customer.totalSpent)}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{formatCurrency(customer.averageBookingValue)}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Average Booking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{customer.daysSinceLastBooking}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Days Since Last Booking</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'bookings', label: 'Booking History', icon: Calendar },
                { id: 'timeline', label: 'Activity Timeline', icon: Clock },
                { id: 'notes', label: 'Notes & Tags', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.id === 'bookings' && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {customer.totalBookings}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Customer Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name</span>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-gray-900">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone</span>
                          <span className="font-medium text-gray-900">{customer.phone}</span>
                        </div>
                      )}
                      {customer.nationality && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nationality</span>
                          <span className="font-medium text-gray-900">{customer.nationality}</span>
                        </div>
                      )}
                      {customer.gender && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender</span>
                          <span className="font-medium text-gray-900">{customer.gender}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          {customer.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Booking Analytics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Type</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.color}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeConfig.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bookings</span>
                        <span className="font-medium text-gray-900">{customer.totalBookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-medium text-green-600">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Booking Value</span>
                        <span className="font-medium text-gray-900">{formatCurrency(customer.averageBookingValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Booking</span>
                        <span className="font-medium text-gray-900">{formatDate(customer.joinDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Booking</span>
                        <span className="font-medium text-gray-900">{formatDate(customer.lastBooking)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Preview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Recent Bookings
                    </h3>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {customer.bookings.slice(0, 3).map((booking, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{getPackageName(booking)}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{getDestinationName(booking)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(booking.booking_date)} • {formatBookingId(booking.id, booking.created_at, 'short')}
                            </div>
                            {/* Payment Information */}
                            {booking.payment_records && booking.payment_records.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-3 h-3" />
                                  <span>
                                    {booking.payment_records[0].payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </span>
                                  {booking.payment_records[0].discount_type && booking.payment_records[0].discount_type !== 'none' && (
                                    <span className="text-orange-600">
                                      ({booking.payment_records[0].discount_type === 'percent' 
                                        ? `${booking.payment_records[0].discount_value}% off` 
                                        : `$${booking.payment_records[0].discount_value} off`})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{formatCurrency(booking.total_amount)}</div>
                            <div className="flex items-center text-sm mt-1">
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize text-gray-700">{booking.status}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {booking.payment_status || 'unpaid'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Total: {customer?.bookings?.length || 0} bookings</span>
                    <span>•</span>
                    <span>Filtered: {normalizedFiltered.length} bookings</span>
                    {(bookingFilter !== 'all' || fromDate || toDate) && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">Filters Active</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Simplified Filters Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Filters</h4>
                    </div>
                    <button
                      onClick={() => {
                        setBookingFilter('all');
                        setFromDate('');
                        setToDate('');
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap">
                    {/* Date Range */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-blue-800 whitespace-nowrap">Date Range:</label>
                      <DatePicker
                        value={fromDate}
                        onChange={(date) => { setFromDate(date); setCurrentPage(1); }}
                        placeholder="From date"
                        className="w-36"
                      />
                      <span className="text-gray-500">to</span>
                      <DatePicker
                        value={toDate}
                        onChange={(date) => { setToDate(date); setCurrentPage(1); }}
                        placeholder="To date"
                        className="w-36"
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-blue-800 whitespace-nowrap">Status:</label>
                    <select
                      value={bookingFilter}
                        onChange={(e) => { setBookingFilter(e.target.value as any); setCurrentPage(1); }}
                        className="px-3 py-2 h-10 bg-white border-2 border-blue-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    >
                        <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className={`hidden md:grid grid-cols-12 ${componentSizes.table.headerPadding} ${componentSizes.table.headerText} ${components.table.header} rounded-lg`}>
                  <div className="col-span-4">Booking Details</div>
                  <div className="col-span-2">Travel Date</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Payment</div>
                  <div className="col-span-2">Payment Details</div>
                          </div>

                {/* Rows */}
                <div className={`${components.card.base} rounded-xl divide-y`}>
                  {currentPageItems.map((booking, index) => (
                    <div key={index} className={`grid grid-cols-12 items-center ${componentSizes.table.cellPadding} ${components.table.row}`}>
                      {/* Booking Details */}
                      <div className="col-span-12 md:col-span-4">
                        <div className="font-medium text-gray-900">{getPackageName(booking)}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{getDestinationName(booking)}</span>
                            </div>
                        <div className="mt-2 inline-flex items-center text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {formatBookingId(booking.id, booking.created_at, 'short')}
                                </div>
                            </div>

                      {/* Travel Date */}
                      <div className="col-span-12 md:col-span-2 text-gray-900">
                        <div className="text-sm">
                          {formatDateRange(booking.booking_date, booking.end_date)}
                          </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.adults + booking.children} guests
                            </div>
                        </div>

                      {/* Amount */}
                      <div className="col-span-6 md:col-span-2 font-bold text-green-600 mt-3 md:mt-0">
                            {formatCurrency(booking.total_amount)}
                          </div>

                      {/* Status & Payment */}
                      <div className="col-span-6 md:col-span-1 flex md:justify-center mt-3 md:mt-0">
                        <span className={`${getBadgeClass(booking.status)} ${componentSizes.badge.md} inline-flex items-center gap-1`}>
                          {getStatusIcon(booking.status)} {booking.status}
                            </span>
                          </div>
                      <div className="col-span-6 md:col-span-1 flex md:justify-center mt-3 md:mt-0">
                        <span className={`${(booking.payment_status === 'paid' ? components.badge.confirmed : booking.payment_status === 'pending' ? components.badge.pending : components.badge.rejected)} ${componentSizes.badge.md}`}>
                          {booking.payment_status || 'unpaid'}
                        </span>
                      </div>
                      
                      {/* Payment Details */}
                      <div className="col-span-12 md:col-span-2 mt-3 md:mt-0">
                        {booking.payment_records && booking.payment_records.length > 0 ? (
                          <div className="space-y-1">
                            {booking.payment_records.map((payment: any, paymentIndex: number) => (
                              <div key={paymentIndex} className="text-xs">
                                <div className="font-medium text-gray-900">
                                  {payment.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </div>
                                <div className="text-gray-600">
                                  {formatCurrency(payment.amount)}
                                  {payment.discount_type && payment.discount_type !== 'none' && (
                                    <span className="text-orange-600 ml-1">
                                      ({payment.discount_type === 'percent' ? `${payment.discount_value}% off` : `$${payment.discount_value} off`})
                              </span>
                                  )}
                          </div>
                                {payment.transaction_id && (
                                  <div className="text-gray-500 font-mono text-xs">
                                    {payment.transaction_id}
                        </div>
                      )}
                    </div>
                  ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">No payment records</div>
                        )}
                </div>

                      {/* Actions */}
                                            <div className="col-span-12 md:col-span-12 flex items-center gap-3 md:justify-end mt-4 md:mt-0">
                        <BookingActionButtons
                          booking={booking}
                          onViewBooking={handleViewBooking}
                          onViewInvoice={handleViewInvoice}
                          onPrintInvoice={handlePrintInvoice}
                          onPrintTicket={handlePrintTicket}
                          onCancelRefund={handleCancelRefund}
                        />
                          </div>
                    </div>
                  ))}
                </div>

                {totalItems === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h4>
                    <p className="text-gray-500">
                      {bookingFilter === 'all' 
                        ? 'This customer has no booking history yet.'
                        : `No ${bookingFilter} bookings found for this customer.`
                      }
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          safeCurrentPage > 1 ? 'text-gray-700 border-gray-200 hover:bg-gray-50' : 'text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                        title={safeCurrentPage > 1 ? 'Previous page' : 'No previous page'}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">Page {safeCurrentPage} of {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          safeCurrentPage < totalPages ? 'text-gray-700 border-gray-200 hover:bg-gray-50' : 'text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                        title={safeCurrentPage < totalPages ? 'Next page' : 'No next page'}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                <div className="space-y-4">
                  {/* Show real activities from database */}
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">{activity.type.replace('_', ' ')}</h4>
                            <span className="text-sm text-gray-500">{formatDateTime(activity.created_at)}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{activity.description}</p>
                          {activity.user_name && (
                            <p className="text-xs text-gray-500 mt-1">By: {activity.user_name}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback to booking timeline if no activities */
                    customer.bookings.map((booking, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Booking Created</h4>
                          <span className="text-sm text-gray-500">{formatDateTime(booking.created_at)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Created booking for {getPackageName(booking)} - {formatCurrency(booking.total_amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {formatBookingId(booking.id, booking.created_at, 'short')}
                        </p>
                      </div>
                    </div>
                    ))
                  )}
                  
                  {/* Show notes as timeline items */}
                  {notes.length > 0 && (
                    <>
                      {notes.map((note, index) => (
                        <div key={`note-${index}`} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 capitalize">{note.type} Note</h4>
                              <span className="text-sm text-gray-500">{formatDateTime(note.created_at)}</span>
                    </div>
                            <p className="text-gray-600 text-sm">{note.content}</p>
                            <p className="text-xs text-gray-500 mt-1">By: {note.author}</p>
                  </div>
                        </div>
                      ))}
                    </>
                )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && customer && (
              <NotesAndActivity
                customerId={customer.email}
                customerName={customer.name}
                notes={notes}
                activities={activities}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedBooking(null);
        }}
      />

      <CancelRefundModal
        booking={selectedBooking}
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmCancelRefund}
      />

      {/* Client Edit Modal */}
      <ClientEditModal
        client={customer ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          nationality: customer.nationality || '',
          gender: customer.gender || '',
          dietary_requirements: customer.notes?.[0] || ''
        } : null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCustomer}
      />


    </div>
  );
};

export default ClientDetailPage;