import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { signIn, signOut } from '../lib/supabase';
import { User, LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase/client';
import { saveUserToCookie, getUserFromCookie, removeUserCookie } from '../utils/auth-cookies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memoized permission check functions
  const isOwner = useCallback(() => {
    const result = user?.role === 'owner';
    console.log('🔑 [COOKIE AUTH] isOwner check:', result, 'for user:', user?.email);
    return result;
  }, [user?.role, user?.email]);

  const isEmployee = useCallback(() => {
    const result = user?.role === 'employee' || isOwner();
    console.log('🔑 [COOKIE AUTH] isEmployee check:', result, 'for user:', user?.email);
    return result;
  }, [user?.role, user?.email, isOwner]);

  // Initialize user from cookie on app start
  useEffect(() => {
    console.log('🚀 [COOKIE AUTH] Initializing authentication from cookie...');
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Try to get user from cookie first
        const cookieUser = getUserFromCookie();
        
        if (cookieUser) {
          console.log('✅ [COOKIE AUTH] User found in cookie, validating session...');
          
          // Validate that the Supabase session is still active
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('⚠️ [COOKIE AUTH] Session validation failed:', error);
            removeUserCookie();
            setUser(null);
          } else if (session && session.user) {
            console.log('✅ [COOKIE AUTH] Session validated, user authenticated');
            setUser(cookieUser);
          } else {
            console.log('⚠️ [COOKIE AUTH] No active session, removing cookie');
            removeUserCookie();
            setUser(null);
          }
        } else {
          console.log('ℹ️ [COOKIE AUTH] No user cookie found, checking Supabase session...');
          
          // Check if there's an active Supabase session without cookie
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!error && session && session.user) {
            console.log('✅ [COOKIE AUTH] Found active Supabase session, fetching user data...');
            
            // Get user data from database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (!userError && userData) {
              console.log('✅ [COOKIE AUTH] User data fetched, saving to cookie');
              setUser(userData);
              saveUserToCookie(userData);
            } else {
              console.log('⚠️ [COOKIE AUTH] Could not fetch user data');
              setUser(null);
            }
          } else {
            console.log('ℹ️ [COOKIE AUTH] No active session found');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ [COOKIE AUTH] Error during initialization:', error);
        removeUserCookie();
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 [COOKIE AUTH] Authentication initialization completed');
      }
    };

    initializeAuth();
  }, []);

  // Simple login function
  async function login(data: LoginFormData) {
    try {
      setLoading(true);
      console.log('🔐 [COOKIE AUTH] Starting login process...');
      
      // Authenticate with Supabase
      const userData = await signIn(data.email, data.password);
      
      // Save to cookie and update state
      saveUserToCookie(userData);
      setUser(userData);
      
      console.log('✅ [COOKIE AUTH] Login successful, user saved to cookie');
      toast.success('¡Sesión iniciada correctamente!');
    } catch (error) {
      console.error('❌ [COOKIE AUTH] Login error:', error);
      toast.error('Credenciales incorrectas. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Simple logout function
  async function logout() {
    try {
      setLoading(true);
      console.log('🚪 [COOKIE AUTH] Starting logout process...');
      
      // Sign out from Supabase
      await signOut();
      
      // Clear cookie and state
      removeUserCookie();
      setUser(null);
      
      console.log('✅ [COOKIE AUTH] Logout successful');
      toast.success('Sesión cerrada correctamente');
      
      // Navigate to login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ [COOKIE AUTH] Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isOwner,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}