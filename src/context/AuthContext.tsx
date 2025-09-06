import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🚧 DEVELOPMENT MODE: Set to false for production deployment
// ⚠️ SECURITY: Never set to true in production!
const DEV_MODE = false; // ✅ PRODUCTION: Development mode disabled

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
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
				
				// Increased timeout for better reliability
				const sessionPromise = supabase.auth.getSession();
				const timeoutPromise = new Promise((_, reject) => 
					setTimeout(() => reject(new Error('Session check timeout')), 15000)
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
						// Check role asynchronously without blocking
						checkRole(session.user.id).catch(err => 
							console.warn('⚠️ Role check failed:', err)
						);
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
			console.log('🔐 Auth state change:', event);
			
			if (event === 'SIGNED_IN' && session?.user) {
				setUser(session.user);
				setIsAuthenticated(true);
				await checkRole(session.user.id);
			} else if (event === 'SIGNED_OUT') {
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);
			}
		});
		
		return () => subscription.unsubscribe();
	}, []);

	const checkRole = async (userId: string): Promise<boolean> => {
		try {
			console.log('🔐 Checking role for user ID:', userId);
			
			// Add timeout to prevent hanging
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Role check timeout')), 10000)
			);
			
			const rolePromise = supabase
				.from('profiles')
				.select('role, is_active')
				.eq('id', userId)
				.single();
				
			const { data, error } = await Promise.race([
				rolePromise,
				timeoutPromise
			]) as any;
				
			if (error) {
				console.error('❌ Profile role check error:', error);
				setIsAdmin(false);
				return false;
			}
			
			console.log('🔐 Profile data:', data);
			
			const allowed = (data?.role === 'superadmin' || data?.role === 'admin') && data?.is_active;
			console.log('🔐 Role check result:', allowed ? 'Authorized' : 'Not authorized');
			
			setIsAdmin(allowed);
			if (!allowed) {
				console.log('❌ User not authorized, clearing session');
				setIsAuthenticated(false);
				setUser(null);
			}
			return allowed;
		} catch (error) {
			console.error('❌ Role check exception:', error);
			setIsAdmin(false);
			// Don't clear session on timeout, just set admin to false
			if (error.message !== 'Role check timeout') {
				setIsAuthenticated(false);
				setUser(null);
			}
			return false;
		}
	};

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
			
			// Check user role with timeout handling
			try {
				const allowed = await checkRole(data.user.id);
				if (!allowed) {
					console.error('❌ User role check failed');
					setIsAuthenticated(false);
					setUser(null);
					return { success: false, error: 'Access restricted to Dalxiis staff' };
				}
			} catch (roleError: any) {
				console.error('❌ Role check failed:', roleError);
				// If role check times out, still allow login but set admin to false
				if (roleError.message === 'Role check timeout') {
					console.warn('⚠️ Role check timed out, allowing login but restricting admin access');
					setIsAdmin(false);
				} else {
					setIsAuthenticated(false);
					setUser(null);
					return { success: false, error: 'Role verification failed' };
				}
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
		<AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
};
