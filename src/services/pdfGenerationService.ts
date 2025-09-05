import { jsPDF } from 'jspdf';
import { formatBookingId, generateTicketId } from '../utils/bookingIdGenerator';

export interface DocumentData {
  type: 'receipt' | 'payment' | 'ticket';
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  services: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  bookingDate: string;
  endDate?: string;
  adults: number;
  children: number;
  destination?: string;
  generatedAt: string;
  documentNumber: string;
}

export interface BrandingConfig {
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

class PDFGenerationService {
  private branding: BrandingConfig = {
    companyName: 'Dalxiis Tourism',
    primaryColor: '#f29520',
    secondaryColor: '#1f2937',
    address: '123 Tourism Street, Mogadishu, Somalia',
    phone: '+252 61 123 4567',
    email: 'info@dalxiis-tourism.com',
    website: 'www.dalxiis-tourism.com'
  };

  setBranding(branding: Partial<BrandingConfig>) {
    this.branding = { ...this.branding, ...branding };
  }

  private addHeader(doc: jsPDF, title: string) {
    // Company header with logo placeholder
    doc.setFillColor(parseInt(this.branding.primaryColor.slice(1, 3), 16), 
                     parseInt(this.branding.primaryColor.slice(3, 5), 16), 
                     parseInt(this.branding.primaryColor.slice(5, 7), 16));
    doc.rect(0, 0, 210, 40, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(this.branding.companyName, 105, 20, { align: 'center' });
    
    // Document title
    doc.setFontSize(16);
    doc.text(title, 105, 35, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
  }

  private addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFillColor(parseInt(this.branding.secondaryColor.slice(1, 3), 16), 
                     parseInt(this.branding.secondaryColor.slice(3, 5), 16), 
                     parseInt(this.branding.secondaryColor.slice(5, 7), 16));
    doc.rect(0, pageHeight - 30, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Company contact info
    doc.text(this.branding.address, 20, pageHeight - 20);
    doc.text(`Phone: ${this.branding.phone}`, 20, pageHeight - 15);
    doc.text(`Email: ${this.branding.email}`, 20, pageHeight - 10);
    doc.text(`Website: ${this.branding.website}`, 20, pageHeight - 5);
    
    // Generated timestamp
    doc.text(`Generated: ${new Date().toLocaleString()}`, 150, pageHeight - 10);
  }

  private addCustomerInfo(doc: jsPDF, data: DocumentData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information:', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.customerName}`, 20, yPosition + 8);
    doc.text(`Email: ${data.customerEmail}`, 20, yPosition + 16);
    doc.text(`Booking ID: ${data.bookingId}`, 20, yPosition + 24);
    doc.text(`Booking Date: ${new Date(data.bookingDate).toLocaleDateString()}`, 20, yPosition + 32);
    
    if (data.endDate) {
      doc.text(`End Date: ${new Date(data.endDate).toLocaleDateString()}`, 20, yPosition + 40);
    }
    
    doc.text(`Travelers: ${data.adults} adult(s), ${data.children} child(ren)`, 20, yPosition + 48);
    
    if (data.destination) {
      doc.text(`Destination: ${data.destination}`, 20, yPosition + 56);
    }
    
    return yPosition + 64;
  }

  private addServicesTable(doc: jsPDF, data: DocumentData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Services & Pricing:', 20, yPosition);
    
    // Table headers
    const headers = ['Service', 'Quantity', 'Price', 'Total'];
    const colWidths = [80, 25, 30, 35];
    let xPos = 20;
    
    doc.setFillColor(parseInt(this.branding.primaryColor.slice(1, 3), 16), 
                     parseInt(this.branding.primaryColor.slice(3, 5), 16), 
                     parseInt(this.branding.primaryColor.slice(5, 7), 16));
    
    headers.forEach((header, index) => {
      doc.rect(xPos, yPosition + 8, colWidths[index], 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(header, xPos + 2, yPosition + 14);
      xPos += colWidths[index];
    });
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let currentY = yPosition + 20;
    
    data.services.forEach((service, index) => {
      if (currentY > doc.internal.pageSize.height - 60) {
        doc.addPage();
        currentY = 60;
      }
      
      xPos = 20;
      doc.text(service.name, xPos + 2, currentY + 6);
      xPos += colWidths[0];
      
      doc.text(service.quantity.toString(), xPos + 2, currentY + 6);
      xPos += colWidths[1];
      
      doc.text(`$${service.price.toFixed(2)}`, xPos + 2, currentY + 6);
      xPos += colWidths[2];
      
      const total = service.price * service.quantity;
      doc.text(`$${total.toFixed(2)}`, xPos + 2, currentY + 6);
      
      currentY += 12;
    });
    
    // Total amount
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total Amount: $${data.amount.toFixed(2)}`, 150, currentY);
    
    return currentY + 20;
  }

  generateReceipt(data: DocumentData): jsPDF {
    const doc = new jsPDF();
    
    // Add header
    this.addHeader(doc, `Receipt #${data.documentNumber}`);
    
    // Add customer info
    let yPos = this.addCustomerInfo(doc, data, 60);
    
    // Add services table
    yPos = this.addServicesTable(doc, data, yPos);
    
    // Add receipt-specific content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: Paid`, 20, yPos + 8);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 20, yPos + 16);
    doc.text(`Receipt Number: ${data.documentNumber}`, 20, yPos + 24);
    
    // Add footer
    this.addFooter(doc);
    
    return doc;
  }

  generatePaymentConfirmation(data: DocumentData): jsPDF {
    const doc = new jsPDF();
    
    // Add header
    this.addHeader(doc, `Payment Confirmation #${data.documentNumber}`);
    
    // Add customer info
    let yPos = this.addCustomerInfo(doc, data, 60);
    
    // Add payment details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: Credit Card`, 20, yPos + 8);
    doc.text(`Transaction ID: TXN${Date.now()}`, 20, yPos + 16);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 20, yPos + 24);
    doc.text(`Amount Paid: $${data.amount.toFixed(2)}`, 20, yPos + 32);
    
    // Add services summary
    yPos += 50;
    yPos = this.addServicesTable(doc, data, yPos);
    
    // Add footer
    this.addFooter(doc);
    
    return doc;
  }

  generateTicket(data: DocumentData): jsPDF {
    const doc = new jsPDF();
    
    // Add header
    this.addHeader(doc, `Travel Ticket #${data.documentNumber}`);
    
    // Add customer info
    let yPos = this.addCustomerInfo(doc, data, 60);
    
    // Add travel details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Details:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Departure Date: ${new Date(data.bookingDate).toLocaleDateString()}`, 20, yPos + 8);
    if (data.endDate) {
      doc.text(`Return Date: ${new Date(data.endDate).toLocaleDateString()}`, 20, yPos + 16);
    }
    doc.text(`Destination: ${data.destination || 'Multiple Destinations'}`, 20, yPos + 24);
    doc.text(`Passengers: ${data.adults + data.children}`, 20, yPos + 32);
    
    // Add services summary
    yPos += 50;
    yPos = this.addServicesTable(doc, data, yPos);
    
    // Add important notes
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Important Information:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('• Please arrive 30 minutes before departure time', 20, yPos + 8);
    doc.text('• Bring valid identification documents', 20, yPos + 16);
    doc.text('• This ticket is non-transferable', 20, yPos + 24);
    doc.text('• Contact us for any changes or cancellations', 20, yPos + 32);
    
    // Add footer
    this.addFooter(doc);
    
    return doc;
  }

  generateDocument(data: DocumentData): jsPDF {
    switch (data.type) {
      case 'receipt':
        return this.generateReceipt(data);
      case 'payment':
        return this.generatePaymentConfirmation(data);
      case 'ticket':
        return this.generateTicket(data);
      default:
        throw new Error(`Unknown document type: ${data.type}`);
    }
  }

  // Utility method to save PDF
  savePDF(doc: jsPDF, filename: string) {
    doc.save(filename);
  }

  // Utility method to get PDF as blob for email/download
  getPDFBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  // Utility method to get PDF as data URL for preview
  getPDFDataURL(doc: jsPDF): string {
    return doc.output('dataurlstring');
  }
}

export const pdfGenerationService = new PDFGenerationService();
export default PDFGenerationService;

export const generatePaymentReceipt = async (data: {
  bookingId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  packageName: string;
  destinationName: string;
}): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Company branding
  doc.setFontSize(24);
  doc.setTextColor(242, 149, 32); // Orange brand color
  doc.text('DALXIIS TOURISM', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Your Trusted Travel Partner', 105, 40, { align: 'center' });
  
  // Receipt header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('PAYMENT RECEIPT', 105, 60, { align: 'center' });
  
  // Receipt details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 80;
  
  // Receipt number
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Receipt #:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(`RCP-${Date.now().toString().slice(-8)}`, 80, yPosition);
  
  yPosition += 15;
  
  // Date
  doc.setFont(undefined, 'bold');
  doc.text('Date:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(new Date(data.paymentDate).toLocaleDateString(), 80, yPosition);
  
  yPosition += 15;
  
  // Customer information
  doc.setFont(undefined, 'bold');
  doc.text('Customer Name:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(data.customerName, 80, yPosition);
  
  yPosition += 15;
  
  // Booking ID
  doc.setFont(undefined, 'bold');
  doc.text('Booking ID:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(data.bookingId, 80, yPosition);
  
  yPosition += 15;
  
  // Package
  doc.setFont(undefined, 'bold');
  doc.text('Package:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(data.packageName, 80, yPosition);
  
  yPosition += 15;
  
  // Destination
  doc.setFont(undefined, 'bold');
  doc.text('Destination:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(data.destinationName, 80, yPosition);
  
  yPosition += 20;
  
  // Payment details section
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Details', 20, yPosition);
  
  yPosition += 15;
  
  // Amount
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Amount Paid:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 128, 0); // Green for amount
  doc.text(`$${data.amount.toFixed(2)}`, 80, yPosition);
  doc.setTextColor(0, 0, 0);
  
  yPosition += 15;
  
  // Payment method
  doc.setFont(undefined, 'bold');
  doc.text('Payment Method:', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(data.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 80, yPosition);
  
  yPosition += 15;
  
  // Transaction ID (if available)
  if (data.transactionId) {
    doc.setFont(undefined, 'bold');
    doc.text('Transaction ID:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(data.transactionId, 80, yPosition);
    yPosition += 15;
  }
  
  yPosition += 20;
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Dalxiis Tourism!', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.text('For any questions, please contact our customer service team.', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.text('This receipt serves as proof of payment for your booking.', 105, yPosition, { align: 'center' });
  
  // Company contact info
  yPosition += 20;
  doc.setFontSize(8);
  doc.text('Dalxiis Tourism | Email: info@dalxiis.com | Phone: +252-XXX-XXXXXXX', 105, yPosition, { align: 'center' });
  
  return doc.output('blob');
};

export const generateBookingTicket = async (data: {
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
}): Promise<Blob> => {
  try {
    console.log('generateBookingTicket called with data:', data);
    
    // Validate required data
    if (!data.bookingId || !data.customerName || !data.customerEmail) {
      throw new Error('Missing required booking data for ticket generation');
    }
    
    const doc = new jsPDF();
  
  // Set up colors (using company branding colors)
  const primaryBlue = [14, 165, 233]; // #0ea5e9
  const orangeAccent = [249, 115, 22]; // #f97316
  const darkGray = [31, 41, 55]; // #1f2937
  const lightGray = [107, 114, 128]; // #6b7280
  
  // Define A4-safe margins and dimensions
  const margin = 20; // 20mm margins on all sides
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const contentWidth = pageWidth - (2 * margin); // 170mm content width
  const contentHeight = pageHeight - (2 * margin); // 257mm content height
  
  // Header Section
  doc.setFontSize(18);
  doc.setTextColor(...primaryBlue);
  doc.setFont(undefined, 'bold');
  doc.text('DALXIIS TOURISM', margin, margin + 5);
  
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.setFont(undefined, 'normal');
  doc.text('Your Gateway to Somalia\'s Beauty', margin, margin + 11);
  
  // Ticket title (right side)
  doc.setFontSize(16);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'bold');
  doc.text('TRAVEL TICKET', margin + contentWidth - 70, margin + 5);
  
  // Ticket metadata
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont(undefined, 'normal');
  const ticketId = generateTicketId(data.bookingId, data.createdAt || data.bookingDate);
  doc.text(`Ticket #: ${ticketId}`, margin + contentWidth - 70, margin + 11);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + contentWidth - 70, margin + 15);
  
  // Draw header line
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 20, margin + contentWidth, margin + 20);
  
  let yPosition = margin + 30;
  
  // Passenger Information Section
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.setFont(undefined, 'bold');
  doc.text('PASSENGER INFORMATION', margin, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'normal');
  
  // Passenger details in two columns
  doc.text('Name:', margin, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(data.customerName, margin + 15, yPosition);
  
  doc.setFont(undefined, 'normal');
  doc.text('Email:', margin, yPosition + 5);
  doc.text(data.customerEmail, margin + 15, yPosition + 5);
  
  // Booking details on the right
  doc.text('Booking ID:', margin + contentWidth - 50, yPosition);
  doc.setFont(undefined, 'bold');
  const friendlyBookingId = formatBookingId(data.bookingId, data.createdAt || data.bookingDate, 'full');
  doc.text(friendlyBookingId, margin + contentWidth - 30, yPosition);
  
  doc.setFont(undefined, 'normal');
  doc.text('Status:', margin + contentWidth - 50, yPosition + 5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...orangeAccent);
  doc.text(data.status.toUpperCase(), margin + contentWidth - 30, yPosition + 5);
  
  yPosition += 18;
  
  // Travel Details Section
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.setFont(undefined, 'bold');
  doc.text('TRAVEL DETAILS', margin, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'normal');
  
  // Travel details in compact format
  doc.text('Package:', margin, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(data.packageName, margin + 18, yPosition);
  
  doc.setFont(undefined, 'normal');
  doc.text('Destination:', margin, yPosition + 5);
  doc.setFont(undefined, 'bold');
  doc.text(data.destinationName, margin + 18, yPosition + 5);
  
  doc.setFont(undefined, 'normal');
  doc.text('Travel Date:', margin, yPosition + 10);
  doc.setFont(undefined, 'bold');
  doc.text(new Date(data.travelDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }), margin + 18, yPosition + 10);
  
  // Amount on the right
  doc.setFont(undefined, 'normal');
  doc.text('Total Amount:', margin + contentWidth - 50, yPosition);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(11);
  doc.text(`$${data.totalAmount.toFixed(2)}`, margin + contentWidth - 30, yPosition);
  
  yPosition += 22;
  
  // Important Information Box
  doc.setFillColor(248, 250, 252); // Light blue background
  doc.rect(margin, yPosition, contentWidth, 20, 'F');
  
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPosition, contentWidth, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.setFont(undefined, 'bold');
  doc.text('IMPORTANT INFORMATION', margin + 5, yPosition + 6);
  
  doc.setFontSize(7);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'normal');
  doc.text('• This ticket is valid for the specified travel dates only', margin + 5, yPosition + 11);
  doc.text('• Please present this ticket at check-in', margin + 5, yPosition + 16);
  
  yPosition += 30;
  
  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('For any questions about this ticket, contact us at info@dalxiis.com', margin + (contentWidth / 2), yPosition, { align: 'center' });
  
  yPosition += 4;
  doc.text('Visit us at www.dalxiis.com | Follow us @DalxiisTourism', margin + (contentWidth / 2), yPosition, { align: 'center' });
  
  // Add a decorative border with proper A4 margins
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.5);
  doc.rect(margin - 5, margin - 5, contentWidth + 10, contentHeight + 10);
  
  console.log('PDF generation completed successfully');
  return doc.output('blob');
  
  } catch (error: any) {
    console.error('Error in generateBookingTicket:', error);
    throw new Error(`Failed to generate ticket PDF: ${error.message}`);
  }
};
