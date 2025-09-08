import React, { useState, useEffect } from 'react';
import { Search, Filter, Receipt, Ticket, Download, Printer, Eye, FileText, Calendar, User, Package, DollarSign } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { cacheService } from '../../../services/CacheService';
import { colors, typography, componentSizes, borderRadius, shadows, components } from '../../../styles/designSystem';
import { formatBookingId } from '../../../utils/bookingIdGenerator';
import DocumentPreviewModal from '../booking/receipts/DocumentPreviewModal';
import { generatePaymentReceipt, generateBookingTicket } from '../../../services/pdfGenerationService';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  package_name?: string;
  destination_name?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_date: string;
  travel_date?: string;
  created_at: string;
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

interface DocumentRecord {
  id: string;
  booking_id: string;
  customer_name: string;
  document_type: 'receipt' | 'ticket';
  generated_at: string;
  print_count: number;
  last_printed: string;
}

const ReceiptManagementTab: React.FC = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'receipts' | 'tickets' | 'documents'>('receipts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cacheKey = 'receipt_management_data';
      const cached = cacheService.get(cacheKey);
      if (cached) {
        setBookings(cached.bookings || []);
        setPayments(cached.payments || []);
        setDocuments(cached.documents || []);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // Load confirmed and paid bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, customer_name, total_amount, status, payment_status, created_at')
        .in('status', ['confirmed', 'completed'])
        .in('payment_status', ['paid'])
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Load payment records
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_records')
        .select('id, booking_id, customer_name, amount, payment_method, status, created_at')
        .eq('type', 'payment')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        if (paymentsError.code === 'PGRST205') {
          console.log('Payment records table not found, initializing with empty data');
          setPayments([]);
        } else {
          throw paymentsError;
        }
      } else {
        setPayments(paymentsData || []);
      }

      // Load document records (if table exists)
      const { data: documentsData, error: documentsError } = await supabase
        .from('document_records')
        .select('id, booking_id, customer_name, document_type, generated_at, print_count, document_url, status')
        .order('generated_at', { ascending: false });

      if (documentsError) {
        if (documentsError.code === 'PGRST205') {
          console.log('Document records table not found, initializing with empty data');
          setDocuments([]);
        } else {
          throw documentsError;
        }
      } else {
        setDocuments(documentsData || []);
      }

      cacheService.set(cacheKey, { bookings: bookingsData || [], payments: paymentsData || [], documents: documentsData || [] }, 2 * 60 * 1000);

    } catch (error: any) {
      console.error('Error loading data:', error);
      showToast('error', 'Error', `Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async (payment: PaymentRecord) => {
    try {
      const booking = bookings.find(b => b.id === payment.booking_id);
      if (!booking) {
        showToast('error', 'Error', 'Booking not found for this payment');
        return;
      }

      // Generate receipt PDF
      const receiptBlob = await generatePaymentReceipt({
        bookingId: formatBookingId(booking.id, booking.created_at, 'full'),
        customerName: payment.customer_name,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        paymentDate: payment.created_at,
        packageName: booking.package_name || 'Custom Package',
        destinationName: booking.destination_name || 'Multiple Destinations'
      });

      // Create document record
      await createDocumentRecord(booking.id, payment.customer_name, 'receipt');

      // Show preview modal
      setSelectedDocument({
        type: 'receipt',
        blob: receiptBlob,
        filename: `Receipt_${formatBookingId(booking.id, booking.created_at, 'full')}.pdf`,
        data: { payment, booking }
      });
      setIsPreviewModalOpen(true);

      showToast('success', 'Success', 'Payment receipt generated successfully');

    } catch (error: any) {
      console.error('Error generating receipt:', error);
      showToast('error', 'Error', `Failed to generate receipt: ${error.message}`);
    }
  };

  const handleGenerateTicket = async (booking: Booking) => {
    try {
      // Generate ticket PDF
      const ticketBlob = await generateBookingTicket({
        bookingId: formatBookingId(booking.id, booking.created_at, 'full'),
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        packageName: booking.package_name || 'Custom Package',
        destinationName: booking.destination_name || 'Multiple Destinations',
        bookingDate: booking.booking_date,
        travelDate: booking.travel_date || booking.booking_date,
        totalAmount: booking.total_amount,
        status: booking.status
      });

      // Create document record
      await createDocumentRecord(booking.id, booking.customer_name, 'ticket');

      // Show preview modal
      setSelectedDocument({
        type: 'ticket',
        blob: ticketBlob,
        filename: `Ticket_${formatBookingId(booking.id, booking.created_at, 'full')}.pdf`,
        data: { booking }
      });
      setIsPreviewModalOpen(true);

      showToast('success', 'Success', 'Booking ticket generated successfully');

    } catch (error: any) {
      console.error('Error generating ticket:', error);
      showToast('error', 'Error', `Failed to generate ticket: ${error.message}`);
    }
  };

  const createDocumentRecord = async (bookingId: string, customerName: string, documentType: 'receipt' | 'ticket') => {
    try {
      // Try to insert into document_records table if it exists
      const { error: insertError } = await supabase
        .from('document_records')
        .insert({
          booking_id: bookingId,
          customer_name: customerName,
          document_type: documentType,
          generated_at: new Date().toISOString(),
          print_count: 0,
          last_printed: null
        });

      if (insertError && insertError.code !== 'PGRST205') {
        console.error('Error creating document record:', insertError);
      }
    } catch (error) {
      // Table might not exist yet, that's okay for development
      console.log('Document records table not available yet');
    }
  };



  const handleDownload = async (document: any) => {
    try {
      const url = URL.createObjectURL(document.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      showToast('error', 'Error', `Failed to download document: ${error.message}`);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.package_name && booking.package_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f29520]"></div>
        <span className="ml-3 text-lg text-gray-600">Loading receipt data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${typography.h2} text-gray-900`}>Receipt & Ticket Management</h2>
          <p className={`${typography.body} text-gray-600 mt-1`}>Generate, print, and manage payment receipts and booking tickets</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'receipts'
                ? `${components.button.secondary}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧾 Payment Receipts
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tickets'
                ? `${components.button.secondary}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎫 Booking Tickets
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? `${components.button.secondary}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Document History
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${components.card.base} ${componentSizes.card.padding}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${componentSizes.icon.sm}`} />
            <input
              type="text"
              placeholder="Search by customer name, email, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${components.input.search} ${componentSizes.input.md} pl-10 pr-4 focus:ring-orange-200 focus:border-orange-500`}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${components.input.base} ${componentSizes.input.md} focus:ring-orange-200 focus:border-orange-500`}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className={`${components.input.base} ${componentSizes.input.md} focus:ring-orange-200 focus:border-orange-500`}
            >
              <option value="all">All Document Types</option>
              <option value="receipt">Receipts</option>
              <option value="ticket">Tickets</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'receipts' ? (
        <div className={components.card.base}>
          <div className={`${componentSizes.card.padding} border-b border-gray-200`}>
            <h3 className={`${typography.h3} text-gray-900`}>Payment Receipts</h3>
            <p className={`${typography.body} text-gray-600`}>Generate receipts for completed payments</p>
          </div>
          <div className={componentSizes.card.padding}>
            {filteredPayments.length > 0 ? (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <Receipt className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-bold text-gray-900">{payment.customer_name}</h4>
                            <span className="px-3 py-1 rounded-full text-xs font-medium border-2 bg-green-100 text-green-800 border-green-200">
                              Payment Completed
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Amount:</span> <span className="font-bold text-lg text-green-600">{formatCurrency(payment.amount)}</span></p>
                            <p><span className="font-medium">Payment Method:</span> {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                            {payment.transaction_id && <p><span className="font-medium">Transaction ID:</span> {payment.transaction_id}</p>}
                            <p><span className="font-medium">Payment Date:</span> {formatDate(payment.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleGenerateReceipt(payment)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Generate Receipt</span>
                        </button>
                        <div className="text-xs text-gray-500 text-center">
                          Payment ID: {payment.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-300">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Receipt className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No payment receipts available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria to find more results.'
                    : 'No completed payments found to generate receipts for.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'tickets' ? (
        <div className={components.card.base}>
          <div className={`${componentSizes.card.padding} border-b border-gray-200`}>
            <h3 className={`${typography.h3} text-gray-900`}>Booking Tickets</h3>
            <p className={`${typography.body} text-gray-600`}>Generate tickets for confirmed and paid bookings</p>
          </div>
          <div className={componentSizes.card.padding}>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <Ticket className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-bold text-gray-900">{booking.customer_name}</h4>
                            <span className="px-3 py-1 rounded-full text-xs font-medium border-2 bg-blue-100 text-blue-800 border-blue-200">
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium border-2 bg-green-100 text-green-800 border-green-200">
                              Paid
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Package:</span> {booking.package_name || 'Custom Package'}</p>
                            <p><span className="font-medium">Destination:</span> {booking.destination_name || 'Multiple Destinations'}</p>
                            <p><span className="font-medium">Booking Date:</span> {formatDate(booking.booking_date)}</p>
                            {booking.travel_date && <p><span className="font-medium">Travel Date:</span> {formatDate(booking.travel_date)}</p>}
                            <p><span className="font-medium">Total Amount:</span> <span className="font-bold text-lg text-green-600">{formatCurrency(booking.total_amount)}</span></p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleGenerateTicket(booking)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Generate Ticket</span>
                        </button>
                        <div className="text-xs text-gray-500 text-center">
                          Booking ID: {formatBookingId(booking.id, booking.created_at, 'full')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Ticket className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No booking tickets available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria to find more results.'
                    : 'No confirmed and paid bookings found to generate tickets for.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={components.card.base}>
          <div className={`${componentSizes.card.padding} border-b border-gray-200`}>
            <h3 className={`${typography.h3} text-gray-900`}>Document History</h3>
            <p className={`${typography.body} text-gray-600`}>Track all generated receipts and tickets</p>
          </div>
          <div className={componentSizes.card.padding}>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gradient-to-r from-gray-50 to-yellow-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          doc.document_type === 'receipt' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {doc.document_type === 'receipt' ? (
                            <Receipt className="w-8 h-8 text-green-600" />
                          ) : (
                            <Ticket className="w-8 h-8 text-blue-600" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-bold text-gray-900">{doc.customer_name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${
                              doc.document_type === 'receipt' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Generated:</span> {formatDate(doc.generated_at)}</p>
                            <p><span className="font-medium">Print Count:</span> {doc.print_count}</p>
                            {doc.last_printed && <p><span className="font-medium">Last Printed:</span> {formatDate(doc.last_printed)}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Doc ID: {doc.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-yellow-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <FileText className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No document history found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || documentTypeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria to find more results.'
                    : 'No documents have been generated yet. Generate receipts and tickets to see them here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {isPreviewModalOpen && selectedDocument && (
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onDownload={() => handleDownload(selectedDocument)}
        />
      )}
    </div>
  );
};

export default ReceiptManagementTab;
