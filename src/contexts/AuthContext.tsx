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
  isRecoveringSession: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveringSession, setIsRecoveringSession] = useState(true);
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
        setIsRecoveringSession(false);
        console.log('🏁 [COOKIE AUTH] Authentication initialization completed');
      }
    };

    initializeAuth();
  }, []);

  // Cross-tab synchronization using storage event
  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key?.includes('supabase.auth.token')) {
        console.log('🔄 [COOKIE AUTH] Detected auth change in another tab, syncing...');

        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('⚠️ [COOKIE AUTH] Error getting session after storage change:', error);
            removeUserCookie();
            setUser(null);
            return;
          }

          if (session && session.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!userError && userData) {
              console.log('✅ [COOKIE AUTH] User synced from another tab');
              setUser(userData);
              saveUserToCookie(userData);
            }
          } else {
            console.log('ℹ️ [COOKIE AUTH] Session removed in another tab, logging out');
            removeUserCookie();
            setUser(null);
          }
        } catch (error) {
          console.error('❌ [COOKIE AUTH] Error during cross-tab sync:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
      console.log('🚪 [COOKIE AUTH] Starting logout process...');
      
      // Clear cookie and state
      removeUserCookie();
      setUser(null);
      
      console.log('✅ [COOKIE AUTH] Local state cleared');
      
      // Navigate immediately to provide instant feedback
      navigate('/login', { replace: true });
      
      // Try to sign out from Supabase in the background
      try {
        setLoading(true);
        await signOut();
        console.log('✅ [COOKIE AUTH] Supabase logout successful');
        toast.success('Sesión cerrada correctamente');
      } catch (supabaseError: any) {
        console.log('⚠️ [COOKIE AUTH] Supabase logout error:', supabaseError);
        
        // Handle specific case where session was already missing/expired
        if (supabaseError.message?.includes('Auth session missing') || 
            supabaseError.message?.includes('AuthSessionMissingError')) {
          console.log('ℹ️ [COOKIE AUTH] Session was already expired/missing');
          toast.success('Sesión cerrada correctamente (la sesión ya había expirado)');
        } else if (supabaseError.message?.includes('403') || 
                   supabaseError.message?.includes('unauthorized')) {
          console.log('ℹ️ [COOKIE AUTH] Session was already invalidated');
          toast.success('Sesión cerrada correctamente (la sesión ya había sido invalidada)');
        } else {
          console.warn('⚠️ [COOKIE AUTH] Unexpected logout error, but local state cleared');
          toast.success('Sesión cerrada localmente (error de conexión con el servidor)');
        }
      } finally {
        setLoading(false);
      }
      
    } catch (error) {
      console.error('❌ [COOKIE AUTH] Unexpected error during logout:', error);
      // Even if there's an unexpected error, ensure user is logged out locally
      removeUserCookie();
      setUser(null);
      navigate('/login', { replace: true });
      toast.success('Sesión cerrada localmente');
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    isRecoveringSession,
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