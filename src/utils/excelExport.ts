import * as XLSX from 'xlsx';
import { formatBookingId } from './bookingIdGenerator';

export interface ExportableBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  package_name?: string;
  destination_name?: string;
  booking_date: string;
  participants: number;
  total_amount: number;
  status: string;
  payment_status: string;
  special_requests: string | null;
  created_at: string;
}

export interface ExportableCustomer {
  email: string;
  name: string;
  phone: string | null;
  total_bookings: number;
  total_spent: number;
  last_booking: string | null;
  status: string;
}

export const exportBookingsToExcel = (
  bookings: ExportableBooking[],
  filename: string = 'bookings-export'
) => {
  // Transform data for Excel with friendly booking IDs
  const excelData = bookings.map(booking => ({
    'Booking Reference': formatBookingId(booking.id, booking.created_at, 'full'),
    'Short ID': formatBookingId(booking.id, booking.created_at, 'short'),
    'Customer Name': booking.customer_name,
    'Customer Email': booking.customer_email,
    'Customer Phone': booking.customer_phone || 'N/A',
    'Package Name': booking.package_name || 'N/A',
    'Destination': booking.destination_name || 'N/A',
    'Booking Date': new Date(booking.booking_date).toLocaleDateString(),
    'Participants': booking.participants,
    'Total Amount': `$${booking.total_amount.toFixed(2)}`,
    'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    'Payment Status': booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1),
    'Special Requests': booking.special_requests || 'None',
    'Created At': new Date(booking.created_at).toLocaleDateString(),
    'System ID': booking.id
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add summary information at the top
  const summaryData = [
    ['DALXIIS TRAVEL BOOKING EXPORT REPORT'],
    [`Export Date: ${new Date().toLocaleDateString()}`],
    [`Total Bookings: ${bookings.length}`],
    [`Export Generated: ${new Date().toLocaleString()}`],
    [''], // Empty row
    ['BOOKING DETAILS:']
  ];

  // Insert summary at the top
  XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: 'A1' });
  
  // Shift the data down to make room for summary
  const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const newDataStart = summaryData.length + 1;
  
  // Re-add the data starting from the new position
  XLSX.utils.sheet_add_json(worksheet, excelData, { 
    origin: `A${newDataStart}`,
    skipHeader: false 
  });

  // Set column widths
  const columnWidths = [
    { wch: 18 }, // Booking Reference
    { wch: 12 }, // Short ID
    { wch: 20 }, // Customer Name
    { wch: 25 }, // Customer Email
    { wch: 15 }, // Customer Phone
    { wch: 20 }, // Package Name
    { wch: 15 }, // Destination
    { wch: 15 }, // Booking Date
    { wch: 12 }, // Participants
    { wch: 15 }, // Total Amount
    { wch: 12 }, // Status
    { wch: 15 }, // Payment Status
    { wch: 30 }, // Special Requests
    { wch: 15 }, // Created At
    { wch: 40 }  // System ID
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  // Generate filename with timestamp and booking count
  const timestamp = new Date().toISOString().split('T')[0];
  const bookingCount = bookings.length;
  const finalFilename = `${filename}-${bookingCount}-bookings-${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, finalFilename);
};

export const exportCustomersToExcel = (
  customers: ExportableCustomer[],
  filename: string = 'customers-export'
) => {
  // Transform data for Excel
  const excelData = customers.map(customer => ({
    'Email': customer.email,
    'Name': customer.name,
    'Phone': customer.phone || 'N/A',
    'Total Bookings': customer.total_bookings,
    'Total Spent': `$${customer.total_spent.toFixed(2)}`,
    'Last Booking': customer.last_booking ? new Date(customer.last_booking).toLocaleDateString() : 'Never',
    'Status': customer.status
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Email
    { wch: 20 }, // Name
    { wch: 15 }, // Phone
    { wch: 15 }, // Total Bookings
    { wch: 15 }, // Total Spent
    { wch: 15 }, // Last Booking
    { wch: 12 }  // Status
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, finalFilename);
};

export const exportFinancialDataToExcel = (
  income: any[],
  expenses: any[],
  filename: string = 'financial-report'
) => {
  const workbook = XLSX.utils.book_new();

  // Income worksheet
  if (income.length > 0) {
    const incomeData = income.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'Type': item.type,
      'Source': item.source || 'N/A',
      'Amount': `$${item.amount.toFixed(2)}`,
      'Status': item.status,
      'Payment Method': item.payment_method || 'N/A',
      'Notes': item.notes || 'None'
    }));

    const incomeWorksheet = XLSX.utils.json_to_sheet(incomeData);
    incomeWorksheet['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, 
      { wch: 12 }, { wch: 20 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, incomeWorksheet, 'Income');
  }

  // Expenses worksheet
  if (expenses.length > 0) {
    const expenseData = expenses.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'Category': item.category,
      'Description': item.description,
      'Amount': `$${item.amount.toFixed(2)}`,
      'Status': item.status,
      'Vendor': item.vendor || 'N/A',
      'Notes': item.notes || 'None'
    }));

    const expenseWorksheet = XLSX.utils.json_to_sheet(expenseData);
    expenseWorksheet['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, 
      { wch: 12 }, { wch: 20 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, expenseWorksheet, 'Expenses');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, finalFilename);
};

export const exportOverviewReportToExcel = (
  stats: any,
  filename: string = 'overview-report'
) => {
  const workbook = XLSX.utils.book_new();

  // Summary worksheet
  const summaryData = [
    { 'Metric': 'Total Bookings', 'Value': stats.totalBookings },
    { 'Metric': 'Total Revenue', 'Value': `$${stats.totalRevenue.toFixed(2)}` },
    { 'Metric': 'Total Expenses', 'Value': `$${stats.totalExpenses.toFixed(2)}` },
    { 'Metric': 'Net Profit', 'Value': `$${stats.netProfit.toFixed(2)}` },
    { 'Metric': 'Active Packages', 'Value': stats.activePackages },
    { 'Metric': 'Active Destinations', 'Value': stats.activeDestinations },
    { 'Metric': 'Pending Bookings', 'Value': stats.pendingBookings }
  ];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Recent Activity worksheet
  if (stats.recentActivity && stats.recentActivity.length > 0) {
    const activityData = stats.recentActivity.map((activity: any) => ({
      'Type': activity.type,
      'Description': activity.description,
      'Timestamp': activity.timestamp,
      'Status': activity.status,
      'Amount': activity.amount ? `$${activity.amount.toFixed(2)}` : 'N/A'
    }));

    const activityWorksheet = XLSX.utils.json_to_sheet(activityData);
    activityWorksheet['!cols'] = [
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, activityWorksheet, 'Recent Activity');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, finalFilename);
};
