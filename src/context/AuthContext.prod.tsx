import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Security: Disable DEV_MODE in production
const DEV_MODE = false; // ⚠️ SECURITY: Never enable in production

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isAdmin: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const initialize = async () => {
			try {
				if (DEV_MODE) {
					// Development mode: Auto-authenticate as admin
					const mockUser = {
						id: 'dev-admin-id',
						email: 'dev@dalxiis.com',
						user_metadata: { full_name: 'Development Admin' }
					} as any;
					
					setUser(mockUser);
					setIsAuthenticated(true);
					setIsAdmin(true);
				} else {
					// Production mode: Normal authentication
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
					} else {
						if (session?.user) {
							setUser(session.user);
							setIsAuthenticated(true);
							await checkRole(session.user.id);
						}
					}
				}
			} catch (error) {
				console.error('❌ Auth initialization error:', error);
			} finally {
				setIsLoading(false);
			}
		};

		initialize();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === 'SIGNED_IN' && session?.user) {
					setUser(session.user);
					setIsAuthenticated(true);
					await checkRole(session.user.id);
				} else if (event === 'SIGNED_OUT') {
					setUser(null);
					setIsAuthenticated(false);
					setIsAdmin(false);
				}
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	const checkRole = async (userId: string): Promise<boolean> => {
		try {
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
			
			const allowed = (data?.role === 'superadmin' || data?.role === 'admin') && data?.is_active;
			setIsAdmin(allowed);
			if (!allowed) {
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
				const mockUser = {
					id: 'dev-admin-id',
					email: 'dev@dalxiis.com',
					user_metadata: { full_name: 'Development Admin' }
				} as any;
				
				setUser(mockUser);
				setIsAuthenticated(true);
				setIsAdmin(true);
				return { success: true };
			}

			// Production mode: Normal Supabase authentication
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return { success: false, error: 'Invalid email format' };
			}

			const { data, error } = await supabase.auth.signInWithPassword({ 
				email, 
				password 
			});
			
			if (error) {
				// Log security events
				if (error.message.includes('Invalid login credentials')) {
					console.warn('🚨 Failed login attempt for:', email);
				}
				return { success: false, error: 'Invalid credentials. Please check your email and password.' };
			}
			
			if (!data.user) {
				return { success: false, error: 'No user returned' };
			}
			
			setUser(data.user);
			setIsAuthenticated(true);
			
			// Check if user has admin role
			const allowed = await checkRole(data.user.id);
			if (!allowed) {
				setIsAuthenticated(false);
				setUser(null);
				return { success: false, error: 'Access denied. Admin privileges required.' };
			}
			
			return { success: true };
		} catch (e: any) {
			console.error('❌ Login exception:', e);
			return { success: false, error: e?.message || 'Login failed' };
		}
	};

	const logout: AuthContextType['logout'] = async () => {
		try {
			if (DEV_MODE) {
				// Development mode: Clear local state
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);
				return;
			}

			// Production mode: Sign out from Supabase
			await supabase.auth.signOut();
			setUser(null);
			setIsAuthenticated(false);
			setIsAdmin(false);
		} catch (error) {
			console.error('❌ Logout error:', error);
		}
	};

	const value: AuthContextType = {
		user,
		isAuthenticated,
		isLoading,
		isAdmin,
		login,
		logout
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
