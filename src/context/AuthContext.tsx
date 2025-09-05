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
				console.log('🔐 DEV_MODE:', DEV_MODE);
				
				if (DEV_MODE) {
					// Development mode: Auto-authenticate as admin
					console.log('🚧 DEV MODE: Auto-authenticating as admin');
					const mockUser = {
						id: 'dev-admin-id',
						email: 'dev@dalxiis.com',
						user_metadata: { full_name: 'Development Admin' }
					} as any; // Use 'any' for development mock user
					
					setUser(mockUser);
					setIsAuthenticated(true);
					setIsAdmin(true);
				} else {
					// Production mode: Normal authentication
					console.log('🔐 Production mode: Checking for existing session...');
					
					          // Add timeout to prevent hanging (increased to 15 seconds)
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 15000)
          );
					
					const { data: { session }, error } = await Promise.race([
						sessionPromise,
						timeoutPromise
					]) as any;
					
					if (error) {
						console.error('❌ Session check error:', error);
						// Don't set loading to false here, let it continue to finally block
					} else {
						console.log('🔐 Session check result:', session ? 'Session found' : 'No session');
						
						if (session?.user) {
							console.log('✅ User found in session:', session.user.email);
							setUser(session.user);
							setIsAuthenticated(true);
							await checkRole(session.user.id);
						} else {
							console.log('ℹ️ No user session found');
						}
					}
				}
			} catch (error) {
				console.error('❌ Auth initialization error:', error);
			} finally {
				console.log('🔐 AuthContext: Setting isLoading to false');
				setIsLoading(false);
			}
		};
		initialize();

		// Only set up auth listeners in production mode
		if (!DEV_MODE) {
			const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
				if (event === 'SIGNED_IN' && session?.user) {
					setUser(session.user);
					setIsAuthenticated(true);
					await checkRole(session.user.id);
				}
				if (event === 'SIGNED_OUT') {
					setUser(null);
					setIsAuthenticated(false);
					setIsAdmin(false);
				}
			});
			return () => subscription.unsubscribe();
		}
	}, []);

	const checkRole = async (userId: string): Promise<boolean> => {
		try {
			console.log('🔐 Checking role for user ID:', userId);
			
			const { data, error } = await supabase
				.from('profiles')
				.select('role, is_active')
				.eq('id', userId)
				.single();
				
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
			
			// Check user role
			const allowed = await checkRole(data.user.id);
			if (!allowed) {
				console.error('❌ User role check failed');
				setIsAuthenticated(false);
				setUser(null);
				return { success: false, error: 'Access restricted to Dalxiis staff' };
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
