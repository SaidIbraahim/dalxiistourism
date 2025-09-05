import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { Tables } from '../lib/supabase';

// User state interface
interface User {
	id: string;
	email: string;
	full_name: string | null;
	role: 'customer' | 'admin' | 'staff';
	avatar_url: string | null;
}

// App state interface as per REQUIREMENTS.md
interface AppState {
	// User state
	user: User | null;
	isAuthenticated: boolean;
	userRole: 'customer' | 'admin' | 'staff' | null;

	// UI state
	sidebarCollapsed: boolean;
	theme: 'light' | 'dark';
	language: 'en' | 'so';

	// Data state
	packages: Tables<'tour_packages'>[];
	bookings: Tables<'bookings'>[];
	destinations: Tables<'destinations'>[];
	services: Tables<'services'>[];
	income: Tables<'income'>[];
	expenses: Tables<'expenses'>[];
	financialReports: Tables<'financial_reports'>[];
	
	// Loading states
	isLoading: {
		packages: boolean;
		bookings: boolean;
		destinations: boolean;
		services: boolean;
		financial: boolean;
	};

	// Error states
	errors: {
		packages: string | null;
		bookings: string | null;
		destinations: string | null;
		services: string | null;
		financial: string | null;
	};

	// Actions
	setUser: (user: User | null) => void;
	setAuthenticated: (isAuthenticated: boolean) => void;
	setUserRole: (role: 'customer' | 'admin' | 'staff' | null) => void;
	
	toggleSidebar: () => void;
	setTheme: (theme: 'light' | 'dark') => void;
	setLanguage: (language: 'en' | 'so') => void;
	
	setPackages: (packages: Tables<'tour_packages'>[]) => void;
	setBookings: (bookings: Tables<'bookings'>[]) => void;
	setDestinations: (destinations: Tables<'destinations'>[]) => void;
	setServices: (services: Tables<'services'>[]) => void;
	setIncome: (income: Tables<'income'>[]) => void;
	setExpenses: (expenses: Tables<'expenses'>[]) => void;
	setFinancialReports: (reports: Tables<'financial_reports'>[]) => void;
	
	addPackage: (pkg: Tables<'tour_packages'>) => void;
	updatePackage: (id: string, updates: Partial<Tables<'tour_packages'>>) => void;
	removePackage: (id: string) => void;
	
	addBooking: (booking: Tables<'bookings'>) => void;
	updateBooking: (id: string, updates: Partial<Tables<'bookings'>>) => void;
	removeBooking: (id: string) => void;
	
	addDestination: (destination: Tables<'destinations'>) => void;
	updateDestination: (id: string, updates: Partial<Tables<'destinations'>>) => void;
	removeDestination: (id: string) => void;
	
	addService: (service: Tables<'services'>) => void;
	updateService: (id: string, updates: Partial<Tables<'services'>>) => void;
	removeService: (id: string) => void;
	
	addIncome: (income: Tables<'income'>) => void;
	updateIncome: (id: string, updates: Partial<Tables<'income'>>) => void;
	removeIncome: (id: string) => void;
	
	addExpense: (expense: Tables<'expenses'>) => void;
	updateExpense: (id: string, updates: Partial<Tables<'expenses'>>) => void;
	removeExpense: (id: string) => void;
	
	addFinancialReport: (report: Tables<'financial_reports'>) => void;
	updateFinancialReport: (id: string, updates: Partial<Tables<'financial_reports'>>) => void;
	removeFinancialReport: (id: string) => void;
	
	setLoading: (key: keyof AppState['isLoading'], loading: boolean) => void;
	setError: (key: keyof AppState['errors'], error: string | null) => void;
	
	clearErrors: () => void;
	resetState: () => void;
	clearServicesCache: () => void;
}

// Initial state
const initialState = {
	user: null,
	isAuthenticated: false,
	userRole: null,
	
	sidebarCollapsed: false,
	theme: 'light' as const,
	language: 'en' as const,
	
	packages: [],
	bookings: [],
	services: [],
	destinations: [],
	income: [],
	expenses: [],
	financialReports: [],
	
	isLoading: {
		packages: false,
		bookings: false,
		services: false,
		destinations: false,
		financial: false,
	},
	
	errors: {
		packages: null,
		bookings: null,
		services: null,
		destinations: null,
		financial: null,
	},
};

// Create the store
export const useAppStore = create<AppState>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				// User actions
				setUser: (user) => set({ user }),
				setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
				setUserRole: (userRole) => set({ userRole }),

				// UI actions
				toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
				setTheme: (theme) => set({ theme }),
				setLanguage: (language) => set({ language }),

				// Data setters
				setPackages: (packages) => set({ packages }),
				setBookings: (bookings) => set({ bookings }),
				setDestinations: (destinations) => set({ destinations }),
				setServices: (services) => set({ services }),
				setIncome: (income) => set({ income }),
				setExpenses: (expenses) => set({ expenses }),
				setFinancialReports: (financialReports) => set({ financialReports }),

				// Package actions
				addPackage: (pkg) => set((state) => ({ packages: [pkg, ...state.packages] })),
				updatePackage: (id, updates) => set((state) => ({
					packages: state.packages.map(pkg => 
						pkg.id === id ? { ...pkg, ...updates } : pkg
					)
				})),
				removePackage: (id) => set((state) => ({
					packages: state.packages.filter(pkg => pkg.id !== id)
				})),

				// Booking actions
				addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
				updateBooking: (id, updates) => set((state) => ({
					bookings: state.bookings.map(booking => 
						booking.id === id ? { ...booking, ...updates } : booking
					)
				})),
				removeBooking: (id) => set((state) => ({
					bookings: state.bookings.filter(booking => booking.id !== id)
				})),



				// Destination actions
				addDestination: (destination) => set((state) => ({ destinations: [destination, ...state.destinations] })),
				updateDestination: (id, updates) => set((state) => ({
					destinations: state.destinations.map(destination => 
						destination.id === id ? { ...destination, ...updates } : destination
					)
				})),
				removeDestination: (id) => set((state) => ({
					destinations: state.destinations.filter(destination => destination.id !== id)
				})),

				// Service actions
				addService: (service) => set((state) => ({ services: [service, ...state.services] })),
				updateService: (id, updates) => set((state) => ({
					services: state.services.map(service => 
						service.id === id ? { ...service, ...updates } : service
					)
				})),
				removeService: (id) => set((state) => ({
					services: state.services.filter(service => service.id !== id)
				})),

				// Income actions
				addIncome: (income) => set((state) => ({ income: [income, ...state.income] })),
				updateIncome: (id, updates) => set((state) => ({
					income: state.income.map(item => 
						item.id === id ? { ...item, ...updates } : item
					)
				})),
				removeIncome: (id) => set((state) => ({
					income: state.income.filter(item => item.id !== id)
				})),

				// Expense actions
				addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
				updateExpense: (id, updates) => set((state) => ({
					expenses: state.expenses.map(item => 
						item.id === id ? { ...item, ...updates } : item
					)
				})),
				removeExpense: (id) => set((state) => ({
					expenses: state.expenses.filter(item => item.id !== id)
				})),

				// Financial report actions
				addFinancialReport: (report) => set((state) => ({ financialReports: [report, ...state.financialReports] })),
				updateFinancialReport: (id, updates) => set((state) => ({
					financialReports: state.financialReports.map(report => 
						report.id === id ? { ...report, ...updates } : report
					)
				})),
				removeFinancialReport: (id) => set((state) => ({
					financialReports: state.financialReports.filter(report => report.id !== id)
				})),

				// Loading actions
				setLoading: (key, loading) => set((state) => ({
					isLoading: { ...state.isLoading, [key]: loading }
				})),

				// Error actions
				setError: (key, error) => set((state) => ({
					errors: { ...state.errors, [key]: error }
				})),

				clearErrors: () => set((state) => ({
					errors: {
						packages: null,
						bookings: null,
						destinations: null,
						services: null,
						financial: null,
					}
				})),

				clearServicesCache: () => set((state) => ({
					services: [],
					isLoading: { ...state.isLoading, services: false },
					errors: { ...state.errors, services: null }
				})),

				resetState: () => set(initialState),
			}),
			{
				name: 'dalxiis-app-store',
				partialize: (state) => ({
					user: state.user,
					isAuthenticated: state.isAuthenticated,
					userRole: state.userRole,
					sidebarCollapsed: state.sidebarCollapsed,
					theme: state.theme,
					language: state.language,
				}),
			}
		),
		{
			name: 'dalxiis-app-store',
		}
	)
);

// Selector hooks for better performance - return primitive values to prevent infinite loops
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useUserRole = () => useAppStore((state) => state.userRole);
export const useSetUser = () => useAppStore((state) => state.setUser);
export const useSetAuthenticated = () => useAppStore((state) => state.setAuthenticated);
export const useSetUserRole = () => useAppStore((state) => state.setUserRole);

export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useToggleSidebar = () => useAppStore((state) => state.toggleSidebar);
export const useSetTheme = () => useAppStore((state) => state.setTheme);
export const useSetLanguage = () => useAppStore((state) => state.setLanguage);

export const usePackages = () => useAppStore((state) => state.packages);
export const usePackagesLoading = () => useAppStore((state) => state.isLoading.packages);
export const usePackagesError = () => useAppStore((state) => state.errors.packages);
export const useSetPackages = () => useAppStore((state) => state.setPackages);
export const useAddPackage = () => useAppStore((state) => state.addPackage);
export const useUpdatePackage = () => useAppStore((state) => state.updatePackage);
export const useRemovePackage = () => useAppStore((state) => state.removePackage);

export const useBookings = () => useAppStore((state) => state.bookings);
export const useBookingsLoading = () => useAppStore((state) => state.isLoading.bookings);
export const useBookingsError = () => useAppStore((state) => state.errors.bookings);
export const useSetBookings = () => useAppStore((state) => state.setBookings);
export const useAddBooking = () => useAppStore((state) => state.addBooking);
export const useUpdateBooking = () => useAppStore((state) => state.updateBooking);
export const useRemoveBooking = () => useAppStore((state) => state.removeBooking);



export const useDestinations = () => useAppStore((state) => state.destinations);
export const useDestinationsLoading = () => useAppStore((state) => state.isLoading.destinations);
export const useDestinationsError = () => useAppStore((state) => state.errors.destinations);
export const useSetDestinations = () => useAppStore((state) => state.setDestinations);
export const useAddDestination = () => useAppStore((state) => state.addDestination);
export const useUpdateDestination = () => useAppStore((state) => state.updateDestination);
export const useRemoveDestination = () => useAppStore((state) => state.removeDestination);

export const useServices = () => useAppStore((state) => state.services);
export const useServicesLoading = () => useAppStore((state) => state.isLoading.services);
export const useServicesError = () => useAppStore((state) => state.errors.services);
export const useSetServices = () => useAppStore((state) => state.setServices);
export const useAddService = () => useAppStore((state) => state.addService);
export const useUpdateService = () => useAppStore((state) => state.updateService);
export const useRemoveService = () => useAppStore((state) => state.removeService);
export const useClearServicesCache = () => useAppStore((state) => state.clearServicesCache);

export const useIncome = () => useAppStore((state) => state.income);
export const useExpenses = () => useAppStore((state) => state.expenses);
export const useFinancialReports = () => useAppStore((state) => state.financialReports);
export const useFinancialLoading = () => useAppStore((state) => state.isLoading.financial);
export const useFinancialError = () => useAppStore((state) => state.errors.financial);
export const useSetIncome = () => useAppStore((state) => state.setIncome);
export const useSetExpenses = () => useAppStore((state) => state.setExpenses);
export const useSetFinancialReports = () => useAppStore((state) => state.setFinancialReports);
export const useAddIncome = () => useAppStore((state) => state.addIncome);
export const useUpdateIncome = () => useAppStore((state) => state.updateIncome);
export const useRemoveIncome = () => useAppStore((state) => state.removeIncome);
export const useAddExpense = () => useAppStore((state) => state.addExpense);
export const useUpdateExpense = () => useAppStore((state) => state.updateExpense);
export const useRemoveExpense = () => useAppStore((state) => state.removeExpense);
export const useAddFinancialReport = () => useAppStore((state) => state.addFinancialReport);
export const useUpdateFinancialReport = () => useAppStore((state) => state.updateFinancialReport);
export const useRemoveFinancialReport = () => useAppStore((state) => state.removeFinancialReport);

export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useSetError = () => useAppStore((state) => state.setError);
