// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut } from '../lib/supabase';
import { User, LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase/client';
import { useSessionCleanup } from '../hooks/useSessionCleanup';


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

  // Prevent concurrent user checks
  let currentCheckPromise: Promise<void> | null = null;

  async function login(data: LoginFormData) {
    try {
      setLoading(true);
      console.log('Login attempt with email:', data.email);
      const userData = await signIn(data.email, data.password);
      console.log('Login response:', userData);
      setUser(userData);
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
      setUser(null);
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
        
        // Set recovery timeout for UI feedback (after 3 seconds)
        sessionRecoveryTimeout = setTimeout(() => {
          console.log('⏰ [AUTH] Session recovery taking longer than expected, showing recovery message');
          setIsRecoveringSession(true);
        }, 3000);

        while (retryCount <= maxRetries) {
          try {
            console.log(`🔍 [AUTH] Attempt ${retryCount + 1}/${maxRetries + 1} to get current user`);
            
            // Create timeout promise for getCurrentUser (10 seconds)
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('⏰ getCurrentUser timeout after 10 seconds'));
              }, 10000);
            });

            const getUserPromise = getCurrentUser();
            const currentUser = await Promise.race([getUserPromise, timeoutPromise]);
            
            console.log(`✅ [AUTH] User check successful (source: ${source}):`, currentUser?.id || 'no user');
            setUser(currentUser);
            return; // Success, exit the function
            
          } catch (error) {
            retryCount++;
            console.error(`❌ [AUTH] User check attempt ${retryCount} failed:`, error);
            
            if (retryCount > maxRetries) {
              console.error(`🚫 [AUTH] Max retries reached, forcing logout (source: ${source})`);
              // Force logout after max retries
              try {
                await signOut();
              } catch (logoutError) {
                console.error('Error during forced logout:', logoutError);
              }
              setUser(null);
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

  function isOwner() {
    console.log('isOwner check, user:', user);
    const result = user?.role === 'owner' || user?.role === 'admin';
    console.log('isOwner result:', result);
    return result;
  }

  function isEmployee() {
    console.log('isEmployee check, user:', user);
    const result = user?.role === 'employee' || isOwner();
    console.log('isEmployee result:', result);
    return result;
  }

  useEffect(() => {
    console.log('🎯 [AUTH] AuthProvider useEffect mounted');
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔔 [AUTH] Auth state changed: ${event}, Session:`, session?.user?.id || 'none');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 [AUTH] User signed out or no session, clearing user state');
          setUser(null);
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