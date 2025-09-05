// Dalxiis Tourism Design System
// Consistent colors, spacing, and styling throughout the application

export const colors = {
  // Dalxiis Brand Colors
  brand: {
    primary: '#1c2c54',    // Dark blue - main brand color
    secondary: '#f29520',  // Orange - accent color
    tertiary: '#2f67b5',   // Light blue - secondary accent
    primaryHover: '#0f1a3a', // Darker blue for hover states
    secondaryHover: '#e08420', // Darker orange for hover states
  },
  
  // Primary Brand Colors (Blue palette)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },
  
  // Secondary Orange (Dalxiis accent)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  },

  // Status Colors
  status: {
    pending: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#f59e0b'
    },
    confirmed: {
      bg: '#d1fae5',
      text: '#065f46',
      border: '#10b981'
    },
    completed: {
      bg: '#dbeafe',
      text: '#1e40af',
      border: '#3b82f6'
    },
    cancelled: {
      bg: '#f3f4f6',
      text: '#374151',
      border: '#6b7280'
    },
    rejected: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#ef4444'
    }
  },

  // Payment Status Colors
  payment: {
    pending: {
      bg: '#fef3c7',
      text: '#92400e'
    },
    paid: {
      bg: '#d1fae5',
      text: '#065f46'
    },
    refunded: {
      bg: '#fee2e2',
      text: '#991b1b'
    }
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

// Typography Scale - Consistent font sizes across the application
export const typography = {
  // Headings
  h1: 'text-2xl font-bold',        // 24px - Main page titles
  h2: 'text-xl font-semibold',     // 20px - Section titles
  h3: 'text-lg font-semibold',     // 18px - Subsection titles
  h4: 'text-base font-semibold',   // 16px - Card titles
  
  // Body text
  body: 'text-sm font-medium',     // 14px - Main body text
  bodyLarge: 'text-base font-medium', // 16px - Large body text
  caption: 'text-xs font-medium',  // 12px - Captions, labels
  
  // Special text
  stat: 'text-2xl font-bold',      // 24px - Statistics numbers
  statLarge: 'text-3xl font-bold', // 30px - Large statistics
  label: 'text-xs font-semibold uppercase tracking-wide text-gray-500', // Form labels
};

// Component Sizing Standards
export const componentSizes = {
  // Buttons
  button: {
    sm: 'px-3 py-1.5 text-xs font-medium',      // Small buttons
    md: 'px-4 py-2 text-sm font-medium',        // Default buttons
    lg: 'px-6 py-3 text-base font-medium',      // Large buttons
    icon: {
      sm: 'p-2',                                 // Small icon buttons
      md: 'p-3',                                 // Default icon buttons
      lg: 'p-4',                                 // Large icon buttons
    }
  },
  
  // Input fields
  input: {
    sm: 'px-3 py-2 text-xs',                    // Small inputs
    md: 'px-4 py-2.5 text-sm',                  // Default inputs
    lg: 'px-4 py-3 text-base',                  // Large inputs
  },
  
  // Cards and containers
  card: {
    padding: 'p-6',                             // Standard card padding
    paddingSmall: 'p-4',                        // Small card padding
    paddingLarge: 'p-8',                        // Large card padding
  },
  
  // Tables
  table: {
    headerPadding: 'px-6 py-4',                 // Table header padding
    cellPadding: 'px-6 py-4',                   // Table cell padding
    headerText: 'text-xs font-semibold uppercase tracking-wide text-gray-700',
    cellText: 'text-sm font-medium text-gray-900',
  },
  
  // Badges and status indicators
  badge: {
    sm: 'px-2 py-1 text-xs font-semibold',      // Small badges
    md: 'px-3 py-1 text-xs font-semibold',      // Default badges
    lg: 'px-4 py-2 text-sm font-semibold',      // Large badges
  },
  
  // Icons
  icon: {
    sm: 'w-4 h-4',                              // Small icons (16px)
    md: 'w-5 h-5',                              // Default icons (20px)
    lg: 'w-6 h-6',                              // Large icons (24px)
    xl: 'w-8 h-8',                              // Extra large icons (32px)
  },
  
  // Avatars
  avatar: {
    sm: 'w-8 h-8',                              // Small avatars
    md: 'w-10 h-10',                            // Default avatars
    lg: 'w-12 h-12',                            // Large avatars
    xl: 'w-16 h-16',                            // Extra large avatars
  },

  // Modals
  modal: {
    sm: 'max-w-md',                             // Small modal
    md: 'max-w-lg',                             // Default modal
    lg: 'max-w-2xl',                            // Large modal
    xl: 'max-w-4xl',                            // Extra large modal
    full: 'max-w-7xl',                          // Full width modal
    header: 'px-6 py-4',                        // Modal header padding
    body: 'px-6 py-4',                          // Modal body padding
    footer: 'px-6 py-4',                        // Modal footer padding
  },
};

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

// Standardized Component Styles
export const components = {
  // Buttons with consistent sizing
  button: {
    primary: 'bg-[#1c2c54] text-white hover:bg-[#0f1a3a] focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md rounded-lg',
    secondary: 'bg-[#f29520] text-white hover:bg-[#e08420] focus:ring-4 focus:ring-orange-200 transition-all duration-200 shadow-md rounded-lg',
    tertiary: 'bg-[#2f67b5] text-white hover:bg-[#1c2c54] focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md rounded-lg',
    success: `bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 
              focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md rounded-lg`,
    danger: `bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 
             focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-md rounded-lg`,
    outline: `border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 
              focus:ring-4 focus:ring-gray-200 transition-all duration-200 bg-white rounded-lg`,
    ghost: `text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-lg`,
    icon: `p-2 rounded-lg transition-all duration-200 hover:scale-105`
  },
  
  // Cards with consistent styling
  card: {
    base: `bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200`,
    elevated: `bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200`,
    flat: `bg-white rounded-lg border border-gray-200`,
    stats: `bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200`
  },

  // Input fields with consistent styling
  input: {
    base: `w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium 
           focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:bg-white transition-all duration-300 
           placeholder-gray-500`,
    error: `w-full bg-white border-2 border-red-300 rounded-lg text-gray-800 font-medium 
            focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-300 
            placeholder-gray-500`,
    search: `bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800 font-medium 
             focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:bg-white transition-all duration-300 
             placeholder-gray-500`
  },

  // Status badges with consistent sizing
  badge: {
    pending: `inline-flex items-center rounded-full border border-yellow-200 
              bg-yellow-100 text-yellow-800 font-semibold`,
    confirmed: `inline-flex items-center rounded-full border border-green-200 
                bg-green-100 text-green-800 font-semibold`,
    completed: `inline-flex items-center rounded-full border border-blue-200 
                bg-blue-100 text-blue-800 font-semibold`,
    cancelled: `inline-flex items-center rounded-full border border-gray-200 
                bg-gray-100 text-gray-800 font-semibold`,
    rejected: `inline-flex items-center rounded-full border border-red-200 
               bg-red-100 text-red-800 font-semibold`,
    active: `inline-flex items-center rounded-full border border-green-200 
             bg-green-100 text-green-800 font-semibold`,
    inactive: `inline-flex items-center rounded-full border border-gray-200 
               bg-gray-100 text-gray-800 font-semibold`
  },

  // Table styling
  table: {
    container: `bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden`,
    header: `bg-gray-50 border-b border-gray-200`,
    row: `hover:bg-blue-50 transition-colors duration-150`,
    cell: `whitespace-nowrap`
  },

  // Modal styling
  modal: {
    base: `relative bg-white rounded-lg shadow-xl transform transition-all`,
    overlay: `fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`,
    header: `px-6 py-4 border-b border-gray-200`,
    body: `px-6 py-4`,
    footer: `px-6 py-4 border-t border-gray-200`
  }
};

// Utility functions
export const getStatusColor = (status: string) => {
  return colors.status[status as keyof typeof colors.status] || colors.status.pending;
};

export const getPaymentColor = (status: string) => {
  return colors.payment[status as keyof typeof colors.payment] || colors.payment.pending;
};

export const getBadgeClass = (status: string) => {
  return components.badge[status as keyof typeof components.badge] || components.badge.pending;
};

// Utility classes for common brand colors
export const brandClasses = {
  // Text colors
  text: {
    primary: 'text-[#1c2c54]',
    secondary: 'text-[#f29520]',
    tertiary: 'text-[#2f67b5]',
  },
  
  // Background colors
  bg: {
    primary: 'bg-[#1c2c54]',
    secondary: 'bg-[#f29520]',
    tertiary: 'bg-[#2f67b5]',
  },
  
  // Border colors
  border: {
    primary: 'border-[#1c2c54]',
    secondary: 'border-[#f29520]',
    tertiary: 'border-[#2f67b5]',
  },
  
  // Hover states
  hover: {
    primary: 'hover:bg-[#0f1a3a]',
    secondary: 'hover:bg-[#e08420]',
  },
  
  // Focus states
  focus: {
    primary: 'focus:ring-[#1c2c54]',
    secondary: 'focus:ring-[#f29520]',
  },
  
  // Gradient backgrounds
  gradient: {
    primary: 'bg-gradient-to-r from-[#1c2c54] to-[#2f67b5]',
    secondary: 'bg-gradient-to-r from-[#f29520] to-[#e08420]',
    hero: 'bg-gradient-to-r from-[#1c2c54] via-[#2f67b5] to-[#1c2c54]',
  }
};