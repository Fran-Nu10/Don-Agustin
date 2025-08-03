// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentUser, signIn, signOut } from '../lib/supabase';
import { User, LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase/client';
import { useCrossTabSessionSync } from '../hooks/useCrossTabSessionSync';

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
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
  const navigate = useNavigate();

  // Initialize cross-tab session synchronization
  useCrossTabSessionSync({ setUser });

  // Prevent concurrent user checks
  let currentCheckPromise: Promise<void> | null = null;

  // Optimized user state update function
  const updateUserState = useCallback((newUser: User | null) => {
    setUser(prevUser => {
      // If both are null, no change needed
      if (!prevUser && !newUser) {
        console.log('🔄 [AUTH] No user state change needed (both null)');
        return prevUser;
      }
      
      // If one is null and the other isn't, update
      if (!prevUser || !newUser) {
        console.log('🔄 [AUTH] User state changed (null <-> user)');
        return newUser;
      }
      
      // If both exist, only update if key properties changed
      if (prevUser.id !== newUser.id || prevUser.role !== newUser.role) {
        console.log('🔄 [AUTH] User state changed (id or role changed)');
        return newUser;
      }
      
      // No significant change, keep previous reference
      console.log('🔄 [AUTH] No significant user state change, keeping previous reference');
      return prevUser;
    });
  }, []);

  // Memoized permission check functions
  const isOwner = useCallback(() => {
    console.log('isOwner check, user:', user);
    const result = user?.role === 'owner' || user?.role === 'admin';
    console.log('isOwner result:', result);
    return result;
  }, [user]);

  const isEmployee = useCallback(() => {
    console.log('isEmployee check, user:', user);
    const result = user?.role === 'employee' || isOwner();
    console.log('isEmployee result:', result);
    return result;
  }, [user, isOwner]);
  async function login(data: LoginFormData) {
    try {
      setLoading(true);
      console.log('Login attempt with email:', data.email);
      await signIn(data.email, data.password);
      console.log('Login successful, user state will be updated by onAuthStateChange');
      toast.success('¡Sesión iniciada correctamente!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Credenciales incorrectas. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await signOut();
      updateUserState(null);
      toast.success('Sesión cerrada correctamente');
      // Asegurar que la redirección ocurra después de limpiar el estado
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }

  // Centralized user check function
  async function performUserCheck(source: string = 'manual'): Promise<void> {
    // Prevent concurrent calls
    if (currentCheckPromise) {
      console.log(`🔄 [AUTH] User check already in progress, waiting for completion (source: ${source})`);
      return currentCheckPromise;
    }

    console.log(`🚀 [AUTH] Starting user check (source: ${source})`);
    
    let sessionRecoveryTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 2;

    currentCheckPromise = (async () => {
      try {
        setLoading(true);
        const perfStart = performance.now();
        
        // Set recovery timeout for UI feedback (after 3 seconds)
        sessionRecoveryTimeout = setTimeout(() => {
          console.log('⏰ [AUTH] Session recovery taking longer than expected, showing recovery message');
          setIsRecoveringSession(true);
        }, 3000);

        while (retryCount <= maxRetries) {
          try {
            console.log(`🔍 [AUTH] Attempt ${retryCount + 1}/${maxRetries + 1} to get current user`);
            const attemptStart = performance.now();
            
            // getCurrentUser now handles its own timeouts (70s) and retries through handleSupabaseError
            // No additional timeout wrapper needed here
            const currentUser = await getCurrentUser();
            
            const attemptEnd = performance.now();
            console.log(`✅ [AUTH] User check successful (source: ${source}):`, currentUser?.id || 'no user');
            console.log(`📊 [AUTH] User check attempt took ${(attemptEnd - attemptStart).toFixed(1)}ms`);
            updateUserState(currentUser);
            
            const totalTime = performance.now();
            console.log(`📊 [AUTH] Total performUserCheck time: ${(totalTime - perfStart).toFixed(1)}ms`);
            return; // Success, exit the function
            
          } catch (error) {
            retryCount++;
            const attemptEnd = performance.now();
            console.error(`❌ [AUTH] User check attempt ${retryCount} failed:`, error);
            console.log(`📊 [AUTH] Failed attempt took ${(attemptEnd - (sessionRecoveryTimeout ? perfStart : performance.now())).toFixed(1)}ms`);
            
            if (retryCount > maxRetries) {
              console.error(`🚫 [AUTH] Max retries reached, forcing logout (source: ${source})`);
              // Force logout after max retries
              try {
                await signOut();
              } catch (logoutError) {
                console.error('Error during forced logout:', logoutError);
              }
              updateUserState(null);
              return;
            }
            
            // Wait before retry (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 3000);
            console.log(`⏳ [AUTH] Waiting ${delay}ms before retry ${retryCount + 1}`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } finally {
        if (sessionRecoveryTimeout) {
          clearTimeout(sessionRecoveryTimeout);
        }
        setIsRecoveringSession(false);
        setLoading(false);
        currentCheckPromise = null;
        console.log(`🏁 [AUTH] User check completed (source: ${source})`);
      }
    })();

    return currentCheckPromise;
  }


  useEffect(() => {
    console.log('🎯 [AUTH] AuthProvider useEffect mounted');
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔔 [AUTH] Auth state changed: ${event}, Session:`, session?.user?.id || 'none');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 [AUTH] User signed out or no session, clearing user state');
          updateUserState(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          console.log(`🔄 [AUTH] Triggering user check due to: ${event}`);
          await performUserCheck(`onAuthStateChange-${event}`);
        }
      }
    );

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Check if Supabase session keys were removed from localStorage
      if (e.key && e.key.includes('supabase.auth.token') && e.newValue === null) {
        console.log('🔄 [AUTH] Session removed from another tab, triggering user check');
        performUserCheck('storage-change');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial user check
    performUserCheck('initial-mount');

    return () => {
      console.log('🧹 [AUTH] Cleaning up AuthProvider');
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      currentCheckPromise = null;
    };
  }, []); // Empty dependency array - only run once on mount

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