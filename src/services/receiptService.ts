import { ApiResponse } from './api';
import { formatBookingId, generateInvoiceId } from '../utils/bookingIdGenerator';

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
  
  // Finally, try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services)) {
    const packageService = booking.selected_services.find((s: any) => s.category === 'Package');
    if (packageService) return packageService.name;
    
    // If no package service, use the first service or create a summary
    if (booking.selected_services.length === 1) {
      return booking.selected_services[0].name;
    }
    if (booking.selected_services.length > 1) {
      return `${booking.selected_services.length} Services Package`;
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
  
  // Finally, try to extract from selected_services
  if (booking.selected_services && Array.isArray(booking.selected_services)) {
    const destinations = booking.selected_services
      .map((s: any) => s.location || s.destination)
      .filter(Boolean)
      .filter((dest: any, index: number, arr: any[]) => arr.indexOf(dest) === index);
    
    if (destinations.length === 1) {
      return destinations[0];
    }
    if (destinations.length > 1) {
      return destinations.join(', ');
    }
  }
  
  return 'Multiple Destinations';
};

export interface ReceiptData {
  bookingId: string;
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  packageName: string;
  destination: string;
  bookingDate: string;
  endDate: string | null;
  adults: number;
  children: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  discountType?: string;
  discountValue?: number;
  payableAmount?: number;
  services: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  specialRequests: string | null;
  createdAt: string;
}

export class ReceiptService {
  // Generate receipt/invoice HTML
  static generateReceiptHTML(data: ReceiptData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.paymentStatus === 'paid' ? 'Receipt' : 'Invoice'} - ${data.invoiceId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            font-size: 14px;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            min-height: 297mm;
            padding: 15mm;
        }
        
        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #0ea5e9;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            font-size: 20px;
            font-weight: 800;
            color: #1c2c54;
            margin-bottom: 3px;
            letter-spacing: -1px;
        }
        
        .company-tagline {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .invoice-title {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title h1 {
            font-size: 20px;
            color: #1c2c54;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .invoice-meta {
            font-size: 12px;
            color: #6b7280;
        }
        
        /* Invoice Details Section */
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 25px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .detail-section h3 {
            font-size: 12px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-section p {
            font-size: 12px;
            color: #374151;
            margin-bottom: 4px;
            line-height: 1.2;
        }
        
        .detail-section strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .payment-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        
        .payment-paid {
            background: #d1fae5;
            color: #065f46;
        }
        
        .payment-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        /* Services Table */
        .services-section {
            margin-bottom: 15px;
        }
        
        .services-section h3 {
            font-size: 14px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        
        .services-table th {
            background: #0ea5e9;
            color: white;
            padding: 8px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .services-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            color: #374151;
        }
        
        .services-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .services-table .text-right {
            text-align: right;
        }
        
        /* Special Requests */
        .special-requests {
            background: #fef3c7;
            border-left: 4px solid #f97316;
            padding: 10px;
            margin: 10px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .special-requests h4 {
            font-size: 12px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .special-requests p {
            font-size: 13px;
            color: #92400e;
            line-height: 1.4;
        }
        
        /* Summary Section */
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }
        
        .summary-table {
            width: 280px;
            border-collapse: collapse;
        }
        
        .summary-table td {
            padding: 6px 12px;
            font-size: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-table .label {
            text-align: left;
            color: #6b7280;
            font-weight: 500;
        }
        
        .summary-table .amount {
            text-align: right;
            color: #1f2937;
            font-weight: 600;
        }
        
        .summary-table .total-row {
            background: #0ea5e9;
            color: white;
            font-weight: 700;
            font-size: 13px;
        }
        
        .summary-table .total-row .label {
            color: white;
        }
        
        .summary-table .total-row .amount {
            color: white;
        }
        
        /* Footer */
        .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }
        
        .footer .thank-you {
            font-size: 14px;
            color: #0ea5e9;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .footer .contact-info {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.4;
        }
        
        .footer .contact-info a {
            color: #0ea5e9;
            text-decoration: none;
        }
        
        .footer .contact-info a:hover {
            text-decoration: underline;
        }
        
        /* Print Styles */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                font-size: 11px !important;
                color: #000000 !important;
            }
            
            .invoice-container {
                max-width: none !important;
                margin: 0 !important;
                padding: 12mm !important;
                min-height: auto !important;
                background: white !important;
            }
            
            .header {
                margin-bottom: 15px !important;
                padding-bottom: 10px !important;
            }
            
            .invoice-details {
                margin-bottom: 15px !important;
                padding: 12px !important;
            }
            
            .services-section {
                margin-bottom: 12px !important;
            }
            
            .summary-section {
                margin-bottom: 15px !important;
            }
            
            .footer {
                margin-top: 20px !important;
                padding-top: 12px !important;
            }
            
            /* Ensure all text is visible in print */
            h1, h2, h3, h4, h5, h6, p, span, div, td, th {
                color: #000000 !important;
            }
            
            .company-logo {
                color: #1c2c54 !important;
            }
            
            .detail-section h3 {
                color: #1c2c54 !important;
            }
            
            .detail-section p {
                color: #000000 !important;
            }
            
            .detail-section strong {
                color: #000000 !important;
            }
            
            .services-section h3 {
                color: #1c2c54 !important;
            }
            
            .invoice-title h1 {
                color: #1c2c54 !important;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .invoice-container {
                padding: 15px;
            }
            
            .header {
                flex-direction: column;
                gap: 15px;
            }
            
            .invoice-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .services-table {
                font-size: 11px;
            }
            
            .services-table th,
            .services-table td {
                padding: 8px 10px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">DALXIIS TOURISM</div>
            <div class="company-tagline">Your Gateway to Somalia's Beauty</div>
        </div>
            <div class="invoice-title">
                <h1>${data.paymentStatus === 'paid' ? 'RECEIPT' : 'INVOICE'}</h1>
                <div class="invoice-meta">
                    <div>${data.paymentStatus === 'paid' ? 'Receipt' : 'Invoice'} #: ${data.invoiceId}</div>
                    <div>Date: ${formatDate(data.createdAt)}</div>
            </div>
            </div>
        </div>
        
        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="detail-section">
                <h3>Bill To</h3>
                <p><strong>${data.customerName}</strong></p>
                <p>${data.customerEmail}</p>
                ${data.customerPhone ? `<p>${data.customerPhone}</p>` : ''}
                </div>
                
            <div class="detail-section">
                <h3>Booking Details</h3>
                <p><strong>Package:</strong> ${data.packageName}</p>
                <p><strong>Destination:</strong> ${data.destination}</p>
                <p><strong>Travel Dates:</strong> ${formatDate(data.bookingDate)}${data.endDate ? ` - ${formatDate(data.endDate)}` : ''}</p>
                <p><strong>Guests:</strong> ${data.adults} Adult${data.adults !== 1 ? 's' : ''}${data.children > 0 ? `, ${data.children} Child${data.children !== 1 ? 'ren' : ''}` : ''}</p>
                </div>
                
            <div class="detail-section">
                <h3>Payment Info</h3>
                <p><strong>Status:</strong> <span class="payment-status payment-${data.paymentStatus}">${data.paymentStatus}</span></p>
                <p><strong>Method:</strong> ${data.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                ${data.discountType && data.discountType !== 'none' ? `
                <p><strong>Discount:</strong> ${data.discountType === 'percent' ? `${data.discountValue}%` : `$${data.discountValue}`} off</p>
                <p><strong>Original Amount:</strong> ${formatCurrency(data.totalAmount)}</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(data.payableAmount || data.totalAmount)}</p>
                ` : `
                <p><strong>Amount:</strong> ${formatCurrency(data.totalAmount)}</p>
                `}
                <p><strong>Issue Date:</strong> ${formatDate(data.createdAt)}</p>
                </div>
            </div>
            
        <!-- Services Section -->
        <div class="services-section">
            <h3>Services & Pricing</h3>
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.services.map(service => `
                    <tr>
                        <td>${service.name}</td>
                        <td class="text-right">${service.quantity}</td>
                        <td class="text-right">${formatCurrency(service.price)}</td>
                        <td class="text-right">${formatCurrency(service.price * service.quantity)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${data.specialRequests ? `
            <div class="special-requests">
                <h4>Special Requests</h4>
                <p>${data.specialRequests}</p>
                </div>
            ` : ''}
                </div>
        
        <!-- Summary Section -->
        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td class="label">Subtotal:</td>
                    <td class="amount">${formatCurrency(data.totalAmount)}</td>
                </tr>
                <tr>
                    <td class="label">Tax (0%):</td>
                    <td class="amount">${formatCurrency(0)}</td>
                </tr>
                <tr class="total-row">
                    <td class="label">Total Amount:</td>
                    <td class="amount">${formatCurrency(data.totalAmount)}</td>
                </tr>
            </table>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="thank-you">Thank you for choosing Dalxiis Tourism!</div>
            <div class="contact-info">
                For questions about this invoice, contact us at <a href="mailto:info@dalxiis.com">info@dalxiis.com</a><br>
                Visit us at <a href="https://www.dalxiis.com">www.dalxiis.com</a> | Follow us @DalxiisTourism
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate and download receipt
  static async generateReceipt(bookingData: any): Promise<ApiResponse<string>> {
    try {
      // Get payment records for this booking
      let paymentRecord = null;
      if (bookingData.payment_records && bookingData.payment_records.length > 0) {
        paymentRecord = bookingData.payment_records[0]; // Use the most recent payment
      }

      const receiptData: ReceiptData = {
        bookingId: formatBookingId(bookingData.id, bookingData.created_at || bookingData.booking_date, 'full'),
        invoiceId: generateInvoiceId(bookingData.id, bookingData.created_at || bookingData.booking_date),
        customerName: bookingData.customer_name,
        customerEmail: bookingData.customer_email,
        customerPhone: bookingData.customer_phone,
        packageName: getPackageName(bookingData),
        destination: getDestinationName(bookingData),
        bookingDate: bookingData.booking_date,
        endDate: bookingData.end_date,
        adults: bookingData.adults || 1,
        children: bookingData.children || 0,
        totalAmount: bookingData.total_amount,
        paymentStatus: bookingData.payment_status || 'pending',
        paymentMethod: paymentRecord?.payment_method || bookingData.payment_method || 'cash',
        discountType: paymentRecord?.discount_type || 'none',
        discountValue: paymentRecord?.discount_value || 0,
        payableAmount: paymentRecord?.amount || bookingData.total_amount,
        services: bookingData.selected_services || [
          {
            name: bookingData.package_name || 'Custom Package',
            price: bookingData.total_amount,
            quantity: 1
          }
        ],
        specialRequests: bookingData.special_requests,
        createdAt: bookingData.created_at
      };

      const html = this.generateReceiptHTML(receiptData);
      return { success: true, data: html, timestamp: new Date().toISOString() };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RECEIPT_GENERATION_FAILED',
          message: 'Failed to generate receipt',
          details: error.message
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Print receipt
  static printReceipt(html: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  // Download receipt as HTML
  static downloadReceipt(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate ticket HTML for print preview
  static generateTicketHTML(data: {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    packageName: string;
    destinationName: string;
    bookingDate: string;
    travelDate: string;
    totalAmount: number;
    status: string;
    createdAt?: string;
    paymentMethod?: string;
    discountType?: string;
    discountValue?: number;
    payableAmount?: number;
  }): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatBookingId = (uuid: string, createdAt: string): string => {
      const date = new Date(createdAt);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
      const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
      const sequenceNumber = hashNumber.toString().padStart(3, '0');
      return `DLX-${year}${month}${day}-${sequenceNumber}`;
    };

    const generateTicketId = (uuid: string, createdAt: string): string => {
      const date = new Date(createdAt);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
      const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
      const sequenceNumber = hashNumber.toString().padStart(3, '0');
      return `TKT-${year}${month}${day}-${sequenceNumber}`;
    };

    const ticketId = generateTicketId(data.bookingId, data.createdAt || data.bookingDate);
    const bookingId = formatBookingId(data.bookingId, data.createdAt || data.bookingDate);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Ticket - ${ticketId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            font-size: 14px;
        }
        
        .ticket-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            min-height: 297mm;
            padding: 12mm;
            border: 2px solid #1c2c54;
            box-sizing: border-box;
        }
        
        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 3px solid #1c2c54;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            font-size: 20px;
            font-weight: 800;
            color: #1c2c54;
            margin-bottom: 3px;
            letter-spacing: -1px;
        }
        
        .company-tagline {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .ticket-title {
            text-align: center;
            flex: 1;
        }
        
        .ticket-title h1 {
            font-size: 20px;
            color: #1c2c54;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .ticket-meta {
            font-size: 12px;
            color: #6b7280;
        }
        
        /* Ticket Details Section */
        .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 12px;
            padding: 10px;
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-radius: 8px;
        }
        
        .detail-section h3 {
            font-size: 12px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-section p {
            font-size: 12px;
            color: #374151;
            margin-bottom: 4px;
            line-height: 1.2;
        }
        
        .detail-section strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        /* Travel Information */
        .travel-info {
            background: #f0f9ff;
            border-left: 4px solid #1c2c54;
            padding: 10px;
            margin: 12px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .travel-info h3 {
            font-size: 14px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .travel-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .travel-item {
            display: flex;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #e0f2fe;
        }
        
        .travel-item:last-child {
            border-bottom: none;
        }
        
        .travel-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
            min-width: 120px;
            margin-right: 8px;
        }
        
        .travel-value {
            font-size: 12px;
            color: #1f2937;
            font-weight: 600;
            flex: 1;
        }
        
        /* Important Information */
        .important-info {
            background: #fff7ed;
            border-left: 4px solid #f29520;
            padding: 10px;
            margin: 12px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .important-info h3 {
            font-size: 14px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .important-info ul {
            list-style: none;
            padding: 0;
        }
        
        .important-info li {
            font-size: 12px;
            color: #92400e;
            margin-bottom: 6px;
            padding-left: 15px;
            position: relative;
        }
        
        .important-info li:before {
            content: "•";
            color: #f29520;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        /* Footer */
        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #1c2c54;
            text-align: center;
        }
        
        .footer .thank-you {
            font-size: 14px;
            color: #1c2c54;
            font-weight: 600;
            margin-bottom: 6px;
        }
        
        .footer .contact-info {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.4;
        }
        
        .footer .contact-info a {
            color: #0ea5e9;
            text-decoration: none;
        }
        
        .footer .contact-info a:hover {
            text-decoration: underline;
        }
        
        /* Print Styles */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                font-size: 14px !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #000000 !important;
            }
            
            .ticket-container {
                max-width: 210mm !important;
                margin: 0 auto !important;
                padding: 10mm !important;
                min-height: auto !important;
                max-height: 297mm !important;
                border: 2px solid #1c2c54 !important;
                background: white !important;
                box-sizing: border-box !important;
            }
            
            /* Header Section */
            .header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                margin-bottom: 15px !important;
                padding-bottom: 10px !important;
                border-bottom: 3px solid #1c2c54 !important;
            }
            
            .company-info {
                flex: 1 !important;
            }
            
            .company-logo {
                font-size: 24px !important;
                font-weight: 800 !important;
                color: #1c2c54 !important;
                margin-bottom: 3px !important;
                letter-spacing: -1px !important;
            }
            
            .company-tagline {
                font-size: 12px !important;
                color: #333333 !important;
                font-weight: 500 !important;
            }
            
            .ticket-title {
                text-align: right !important;
                flex: 1 !important;
            }
            
            .ticket-title h1 {
                font-size: 20px !important;
                color: #1c2c54 !important;
                font-weight: 700 !important;
                margin-bottom: 8px !important;
            }
            
            .ticket-meta {
                font-size: 12px !important;
                color: #333333 !important;
            }
            
            /* Ticket Details Section */
            .ticket-details {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 15px !important;
                margin-bottom: 12px !important;
                padding: 10px !important;
                background: #f0f9ff !important;
                border: 1px solid #e0f2fe !important;
                border-radius: 8px !important;
            }
            
            .detail-section h3 {
                font-size: 12px !important;
                color: #1c2c54 !important;
                font-weight: 600 !important;
                margin-bottom: 6px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            .detail-section p {
                font-size: 12px !important;
                color: #000000 !important;
                margin-bottom: 4px !important;
                line-height: 1.4 !important;
            }
            
            .detail-section strong {
                color: #000000 !important;
                font-weight: 600 !important;
            }
            
            /* Travel Information */
            .travel-info {
                background: #f0f9ff !important;
                border-left: 4px solid #1c2c54 !important;
                padding: 10px !important;
                margin: 12px 0 !important;
                border-radius: 0 8px 8px 0 !important;
            }
            
            .travel-info h3 {
                font-size: 14px !important;
                color: #1c2c54 !important;
                font-weight: 600 !important;
                margin-bottom: 8px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            .travel-details {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 15px !important;
            }
            
            .travel-item {
                display: flex !important;
                align-items: center !important;
                padding: 6px 0 !important;
                border-bottom: 1px solid #cccccc !important;
            }
            
            .travel-item:last-child {
                border-bottom: none !important;
            }
            
            .travel-label {
                font-size: 12px !important;
                color: #333333 !important;
                font-weight: 500 !important;
                min-width: 120px !important;
                margin-right: 8px !important;
            }
            
            .travel-value {
                font-size: 12px !important;
                color: #000000 !important;
                font-weight: 600 !important;
                flex: 1 !important;
            }
            
            /* Important Information */
            .important-info {
                background: #fff7ed !important;
                border-left: 4px solid #f29520 !important;
                padding: 10px !important;
                margin: 12px 0 !important;
                border-radius: 0 8px 8px 0 !important;
            }
            
            .important-info h3 {
                font-size: 14px !important;
                color: #1c2c54 !important;
                font-weight: 600 !important;
                margin-bottom: 8px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            .important-info ul {
                list-style: none !important;
                padding: 0 !important;
            }
            
            .important-info li {
                font-size: 12px !important;
                color: #000000 !important;
                margin-bottom: 6px !important;
                padding-left: 15px !important;
                position: relative !important;
            }
            
            .important-info li:before {
                content: "•" !important;
                color: #000000 !important;
                font-weight: bold !important;
                position: absolute !important;
                left: 0 !important;
            }
            
            /* Footer */
            .footer {
                margin-top: 15px !important;
                padding-top: 10px !important;
                border-top: 2px solid #1c2c54 !important;
                text-align: center !important;
            }
            
            .footer .thank-you {
                font-size: 14px !important;
                color: #1c2c54 !important;
                font-weight: 600 !important;
                margin-bottom: 6px !important;
            }
            
            .footer .contact-info {
                font-size: 11px !important;
                color: #333333 !important;
                line-height: 1.4 !important;
            }
            
            .footer .contact-info a {
                color: #000000 !important;
                text-decoration: none !important;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .ticket-container {
                padding: 15px;
            }
            
            .header {
                flex-direction: column;
                gap: 15px;
            }
            
            .ticket-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .travel-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">DALXIIS TOURISM</div>
                <div class="company-tagline">Your Gateway to Somalia's Beauty</div>
            </div>
            <div class="ticket-title">
                <h1>TRAVEL TICKET</h1>
                <div class="ticket-meta">
                    <div>Ticket #: ${ticketId}</div>
                    <div>Date: ${formatDate(new Date().toISOString())}</div>
                </div>
            </div>
        </div>

        <!-- Ticket Details -->
        <div class="ticket-details">
            <div class="detail-section">
                <h3>Booking Information</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
                <p><strong>Original Amount:</strong> ${formatCurrency(data.totalAmount)}</p>
                ${data.discountType && data.discountType !== 'none' ? `
                <p><strong>Discount:</strong> ${data.discountType === 'percent' ? `${data.discountValue}%` : `$${data.discountValue}`} off</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(data.payableAmount || data.totalAmount)}</p>
                ` : `
                <p><strong>Amount Paid:</strong> ${formatCurrency(data.totalAmount)}</p>
                `}
                ${data.paymentMethod ? `<p><strong>Payment Method:</strong> ${data.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>` : ''}
            </div>
            <div class="detail-section">
                <h3>Passenger Information</h3>
                <p><strong>Name:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                <p><strong>Package:</strong> ${data.packageName}</p>
            </div>
        </div>

        <!-- Travel Information -->
        <div class="travel-info">
            <h3>Travel Details</h3>
            <div class="travel-details">
                <div class="travel-item">
                    <span class="travel-label">Departure Date:</span>
                    <span class="travel-value">${formatDate(data.travelDate)}</span>
                </div>
                <div class="travel-item">
                    <span class="travel-label">Destination:</span>
                    <span class="travel-value">${data.destinationName}</span>
                </div>
                <div class="travel-item">
                    <span class="travel-label">Package:</span>
                    <span class="travel-value">${data.packageName}</span>
                </div>
                <div class="travel-item">
                    <span class="travel-label">Booking Date:</span>
                    <span class="travel-value">${formatDate(data.bookingDate)}</span>
                </div>
            </div>
        </div>

        <!-- Important Information -->
        <div class="important-info">
            <h3>Important Information</h3>
            <ul>
                <li>Please arrive 30 minutes before departure time</li>
                <li>Bring valid identification documents</li>
                <li>This ticket is non-transferable</li>
                <li>Contact us for any changes or cancellations</li>
                <li>Keep this ticket safe and present it when required</li>
                <li>For support, contact us at info@dalxiistourism.com</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="thank-you">Thank you for choosing DALXIIS TOURISM!</div>
            <div class="contact-info">
                <p>For any questions or support, please contact us:</p>
                <p>Email: <a href="mailto:info@dalxiistourism.com">info@dalxiistourism.com</a> | Phone: +252 61 234 5678</p>
                <p>Website: <a href="https://dalxiistourism.com">www.dalxiistourism.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}