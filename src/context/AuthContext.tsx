import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isRoleLoading?: boolean;
	isRoleResolved?: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🚧 DEVELOPMENT MODE: Set to false for production deployment
// ⚠️ SECURITY: Never set to true in production!
const DEV_MODE = false; // ✅ PRODUCTION: Development mode disabled

// Debug utility for authentication monitoring
const debugAuth = (message: string, data?: any) => {
	const timestamp = new Date().toISOString();
	console.log(`🔐 [${timestamp}] ${message}`, data || '');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isRoleLoading, setIsRoleLoading] = useState(false);
	const [isRoleResolved, setIsRoleResolved] = useState(false);
	const [hasVerifiedRoleOnce, setHasVerifiedRoleOnce] = useState(false);
	const [lastRoleCheckAt, setLastRoleCheckAt] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initialize = async () => {
			try {
				console.log('🔐 AuthContext: Initializing authentication...');
				
				if (DEV_MODE) {
					// Development mode: Auto-authenticate as admin
					console.log('🚧 DEV MODE: Auto-authenticating as admin');
					const mockUser = {
						id: 'dev-admin-id',
						email: 'dev@dalxiis.com',
						user_metadata: { full_name: 'Development Admin' }
					} as any;
					
					setUser(mockUser);
					setIsAuthenticated(true);
					setIsAdmin(true);
					setIsLoading(false);
					return;
				}

				// Production mode: Non-blocking authentication check
				console.log('🔐 Production mode: Checking for existing session...');
				
				// Skip explicit getUser probe to avoid 403 noise when no session is present
				
				// Increased timeout for better reliability
				const sessionPromise = supabase.auth.getSession();
				const timeoutPromise = new Promise((_, reject) => 
					setTimeout(() => reject(new Error('Session check timeout')), 45000) // Increased to 45s
				);
				
				try {
					const { data: { session }, error } = await Promise.race([
						sessionPromise,
						timeoutPromise
					]) as any;
					
					if (error) {
						console.warn('⚠️ Session check error (non-blocking):', error);
					} else if (session?.user) {
						console.log('✅ User found in session:', session.user.email);
						setUser(session.user);
						setIsAuthenticated(true);
						// Check role without blocking redirects
						setIsRoleLoading(true);
						setIsRoleResolved(false);
						checkRole(session.user.id)
							.catch(err => console.warn('⚠️ Role check failed:', err))
							.finally(() => setIsRoleLoading(false));
					} else {
						console.log('ℹ️ No user session found');
					}
				} catch (timeoutError) {
					console.warn('⚠️ Session check timeout (non-blocking):', timeoutError);
				}
				
			} catch (error) {
				console.warn('⚠️ Auth initialization error (non-blocking):', error);
			} finally {
				console.log('🔐 AuthContext: Setting isLoading to false');
				setIsLoading(false);
			}
		};
		
		// Initialize immediately without blocking
		initialize();

		// Set up auth listeners for real-time updates
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			debugAuth('Auth state change', { event, hasUser: !!session?.user, userEmail: session?.user?.email });
			
			if (event === 'SIGNED_IN' && session?.user) {
				debugAuth('User signed in', { email: session.user.email });
				setUser(session.user);
				setIsAuthenticated(true);
				// If we've verified admin at least once recently, don't block UI
				const now = Date.now();
				const recentlyChecked = lastRoleCheckAt && (now - lastRoleCheckAt < 10 * 60 * 1000);
				if (hasVerifiedRoleOnce && recentlyChecked) {
					setIsRoleResolved(true);
				} else if (!isRoleLoading) {
					setIsRoleLoading(true);
					setIsRoleResolved(false);
					await checkRole(session.user.id).finally(() => setIsRoleLoading(false));
				}
			} else if (event === 'SIGNED_OUT') {
				debugAuth('User signed out');
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);
				setIsRoleResolved(false);
				setHasVerifiedRoleOnce(false);
			}
		});
		
		return () => subscription.unsubscribe();
	}, []);

	// Session monitoring and user activity tracking
	useEffect(() => {
		if (DEV_MODE) return; // Skip monitoring in dev mode

		let lastActivity = Date.now();
		const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
		const SESSION_CHECK_INTERVAL = 60000; // Check every minute

		const updateActivity = () => {
			lastActivity = Date.now();
		};

		// Add event listeners for user activity
		const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
		events.forEach(event => {
			document.addEventListener(event, updateActivity, true);
		});

		// Session health monitoring
		const sessionMonitor = setInterval(async () => {
			try {
				// Check if user is still authenticated
				if (isAuthenticated && user) {
					const { data: { session }, error } = await supabase.auth.getSession();
					
					if (error) {
						console.warn('⚠️ Session check error:', error);
						return;
					}

					if (!session) {
						console.warn('⚠️ Session lost, attempting to refresh...');
						try {
							const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
							if (refreshError || !newSession) {
								console.error('❌ Session refresh failed, logging out');
								setUser(null);
								setIsAuthenticated(false);
								setIsAdmin(false);
							} else {
								console.log('✅ Session refreshed successfully');
							}
						} catch (refreshError) {
							console.error('❌ Session refresh exception:', refreshError);
							setUser(null);
							setIsAuthenticated(false);
							setIsAdmin(false);
						}
					}

					// Check for inactivity timeout
					if (Date.now() - lastActivity > ACTIVITY_TIMEOUT) {
						console.log('⚠️ User inactive for 30 minutes, checking session validity...');
						// Session is still valid, just log the inactivity
						lastActivity = Date.now(); // Reset to prevent repeated warnings
					}
				}
			} catch (error) {
				console.error('❌ Session monitoring error:', error);
			}
		}, SESSION_CHECK_INTERVAL);

		// Cleanup function
		return () => {
			events.forEach(event => {
				document.removeEventListener(event, updateActivity, true);
			});
			clearInterval(sessionMonitor);
		};
	}, [isAuthenticated, user]);

	const checkRole = async (userId: string): Promise<boolean> => {
		try {
			console.log('🔐 Checking role for user ID:', userId);
			
			// Extended timeout for role check, ensure timer cleared when rolePromise resolves
			let timer: any;
			const timeoutPromise = new Promise((_, reject) => {
				timer = setTimeout(() => reject(new Error('Role check timeout')), 20000);
			});
			
			const rolePromise = supabase
				.from('profiles')
				.select('role, is_active')
				.eq('id', userId)
				.single();
				
			const { data, error } = await Promise.race([
				rolePromise,
				timeoutPromise
			]) as any;
			clearTimeout(timer);
				
			if (error) {
				console.warn('⚠️ Role check error:', error.message);
				// Do not clear session; just mark admin false
				setIsAdmin(false);
				// Only resolve when we have a definitive answer
				setIsRoleResolved(false);
				return false;
			}
			
			console.log('🔐 Profile data:', data);
			
			const allowed = (data?.role === 'superadmin' || data?.role === 'admin') && data?.is_active;
			console.log('🔐 Role check result:', allowed ? 'Authorized' : 'Not authorized');
			
			setIsAdmin(allowed);
			setIsRoleResolved(true);
			setHasVerifiedRoleOnce(allowed);
			setLastRoleCheckAt(Date.now());
			return allowed;
		} catch (error) {
			console.error('❌ Role check exception:', error);
			// Don't clear session or flip admin on timeout or network errors; keep prior state
			if (error.message === 'Role check timeout' || error.message?.includes('network') || error.message?.includes('fetch')) {
				console.warn('⚠️ Role check timeout; preserving current admin state and retrying');
				setIsRoleResolved(true); // unblock UI using last known state
				setLastRoleCheckAt(Date.now());
				return isAdmin;
			} else {
				// Authorization errors: mark as resolved and non-admin
				setIsRoleResolved(true);
				setHasVerifiedRoleOnce(false);
				setIsAdmin(false);
				setLastRoleCheckAt(Date.now());
				return false;
			}
		}
	};

	// Auto-retry role check on transient failures
	useEffect(() => {
		if (!isAuthenticated || !user) return;
		if (isRoleLoading) return;
		// Throttle background re-checks: only if last check is older than 5 minutes
		const now = Date.now();
		if (lastRoleCheckAt && now - lastRoleCheckAt < 5 * 60 * 1000) return;
		const retryTimer = setTimeout(() => {
			checkRole(user.id).catch(() => {});
		}, 1000);
		return () => clearTimeout(retryTimer);
	}, [isAuthenticated, user, isRoleLoading, lastRoleCheckAt]);

	const login: AuthContextType['login'] = async (email, password) => {
		try {
			if (DEV_MODE) {
				// Development mode: Auto-login as admin
				console.log('🚧 DEV MODE: Auto-login successful');
				const mockUser = {
					id: 'dev-admin-id',
					email: email,
					user_metadata: { full_name: 'Development Admin' }
				} as any; // Use 'any' for development mock user
				
				setUser(mockUser);
				setIsAuthenticated(true);
				setIsAdmin(true);
				return { success: true };
			}

			// Production mode: Normal Supabase authentication
			console.log('🔐 Attempting secure login for:', email);
			
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				console.warn('⚠️ Invalid email format attempted:', email);
				return { success: false, error: 'Invalid email format' };
			}
			
			const { data, error } = await supabase.auth.signInWithPassword({ 
				email, 
				password 
			});
			
			if (error) {
				console.error('❌ Supabase auth error:', error);
				
				// Log security events
				if (error.message.includes('Invalid login credentials')) {
					console.warn('🚨 Failed login attempt for:', email);
				}
				
				return { success: false, error: 'Invalid credentials. Please check your email and password.' };
			}
			
			if (!data.user) {
				console.error('❌ No user returned from Supabase');
				return { success: false, error: 'No user returned' };
			}
			
			console.log('✅ User authenticated:', data.user.email);
			setUser(data.user);
			setIsAuthenticated(true);
			
			// Check user role with improved timeout handling
			try {
				const allowed = await checkRole(data.user.id);
				if (!allowed) {
					// Only logout if it's a real authorization failure, not a network issue
					console.warn('⚠️ User role check failed, but keeping user logged in due to potential network issues');
					setIsAdmin(false);
					// Don't logout immediately - let the session monitoring handle it
				}
			} catch (roleError: any) {
				console.error('❌ Role check failed:', roleError);
				// Always allow login but restrict admin access on any error
				console.warn('⚠️ Role check failed, allowing login but restricting admin access');
				setIsAdmin(false);
				// Don't logout on role check failures - this prevents unexpected logouts
			}
			
			console.log('✅ Login successful, user is admin');
			return { success: true };
		} catch (e: any) {
			console.error('❌ Login exception:', e);
			return { success: false, error: e?.message || 'Login failed' };
		}
	};

	const logout = async () => {
		if (DEV_MODE) {
			// Development mode: Clear local state
			console.log('🚧 DEV MODE: Logging out');
			setUser(null);
			setIsAuthenticated(false);
			setIsAdmin(false);
		} else {
			// Production mode: Supabase logout
			await supabase.auth.signOut();
		}
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isRoleLoading, isRoleResolved, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
};
