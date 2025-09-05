/**
 * Utility functions for generating and formatting human-friendly booking IDs
 */

/**
 * Generate a human-friendly booking ID from UUID and creation date
 * Format: DLX-YYMMDD-XXX (e.g., DLX-250830-001)
 */
export const generateFriendlyBookingId = (uuid: string, createdAt: string): string => {
  // Extract date components
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Use first 8 characters of UUID to generate a 3-digit number
  const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
  const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
  const sequenceNumber = hashNumber.toString().padStart(3, '0');
  
  return `DLX-${year}${month}${day}-${sequenceNumber}`;
};

/**
 * Generate a shorter booking reference for display
 * Format: DLX-XXX (e.g., DLX-001)
 */
export const generateShortBookingId = (uuid: string): string => {
  const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
  const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
  const sequenceNumber = hashNumber.toString().padStart(3, '0');
  
  return `DLX-${sequenceNumber}`;
};

/**
 * Generate booking reference for modal header
 * Format: DLX-XXXXXXXX (using first 8 chars of UUID)
 */
export const generateModalBookingRef = (uuid: string): string => {
  const shortId = uuid.replace(/-/g, '').substring(0, 8).toUpperCase();
  return `DLX-${shortId}`;
};

/**
 * Generate a human-friendly invoice/ticket ID
 * Format: INV-YYMMDD-XXX (e.g., INV-250830-001)
 */
export const generateInvoiceId = (uuid: string, createdAt: string): string => {
  // Extract date components
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Use first 8 characters of UUID to generate a 3-digit number
  const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
  const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
  const sequenceNumber = hashNumber.toString().padStart(3, '0');
  
  return `INV-${year}${month}${day}-${sequenceNumber}`;
};

/**
 * Generate a human-friendly ticket ID
 * Format: TKT-YYMMDD-XXX (e.g., TKT-250830-001)
 */
export const generateTicketId = (uuid: string, createdAt: string): string => {
  // Extract date components
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Use first 8 characters of UUID to generate a 3-digit number
  const uuidHash = uuid.replace(/-/g, '').substring(0, 8);
  const hashNumber = parseInt(uuidHash.substring(0, 6), 16) % 999 + 1;
  const sequenceNumber = hashNumber.toString().padStart(3, '0');
  
  return `TKT-${year}${month}${day}-${sequenceNumber}`;
};

/**
 * Format booking ID for different contexts
 */
export const formatBookingId = (uuid: string, createdAt?: string, format: 'full' | 'short' | 'modal' = 'full'): string => {
  switch (format) {
    case 'full':
      return createdAt ? generateFriendlyBookingId(uuid, createdAt) : generateModalBookingRef(uuid);
    case 'short':
      return generateShortBookingId(uuid);
    case 'modal':
      return generateModalBookingRef(uuid);
    default:
      return generateModalBookingRef(uuid);
  }
};