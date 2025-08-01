// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut } from '../lib/supabase';
import { User, LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase/client';

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
    let sessionRecoveryTimeout: NodeJS.Timeout | null = null;
    let getCurrentUserPromise: Promise<User | null> | null = null;

    async function checkUser() {
      try {
        console.log('Checking current user...');
        
        // Set recovery timeout for UI feedback
        sessionRecoveryTimeout = setTimeout(() => {
          setIsRecoveringSession(true);
        }, 3000);
        
        // Prevent multiple simultaneous calls to getCurrentUser
        if (!getCurrentUserPromise) {
          getCurrentUserPromise = getCurrentUser();
        }
        
        const currentUser = await getCurrentUserPromise;
        const currentUser = await getCurrentUser();
        console.log('Current user from getCurrentUser:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
        
        // If getCurrentUser fails twice or times out, force logout
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount < maxRetries) {
          try {
            retryCount++;
            console.log(`Retry attempt ${retryCount}/${maxRetries} for getCurrentUser`);
            const retryUser = await getCurrentUser();
            setUser(retryUser);
            break;
          } catch (retryError) {
            console.error(`Retry ${retryCount} failed:`, retryError);
            if (retryCount >= maxRetries) {
              console.log('Max retries reached, forcing logout');
              await signOut();
              setUser(null);
            }
          }
        }
        setUser(null);
      } finally {
        if (sessionRecoveryTimeout) {
          clearTimeout(sessionRecoveryTimeout);
        }
        setIsRecoveringSession(false);
        setLoading(false);
        getCurrentUserPromise = null;
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, 'Session:', session?.user?.id);
          if (session?.user) {
            // Prevent redundant calls if we already have a getCurrentUser promise
            if (!getCurrentUserPromise) {
              getCurrentUserPromise = getCurrentUser();
            }
            const currentUser = await getCurrentUserPromise;
            const currentUser = await getCurrentUser();
            console.log('User from getCurrentUser after auth change:', currentUser);
            setUser(currentUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Let getCurrentUser handle its own retries and error recovery
          // Only set user to null if getCurrentUser definitively fails
          setUser(null);
        } finally {
          setLoading(false);
          getCurrentUserPromise = null;
        }
      }
    );

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Check if Supabase session keys were removed from localStorage
      if (e.key && e.key.includes('supabase.auth.token') && e.newValue === null) {
        console.log('Session removed from another tab, forcing logout');
        setUser(null);
        setLoading(false);
        // Don't call signOut() here to avoid infinite loops
      }
    };

    window.addEventListener('storage', handleStorageChange);
    checkUser();


    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      if (sessionRecoveryTimeout) {
        clearTimeout(sessionRecoveryTimeout);
      }
    };
  }, []);



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
