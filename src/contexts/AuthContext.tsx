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
  let cancelled = false;

  async function checkUser() {
    try {
      console.log('Checking current user...');
      const currentUser = await getCurrentUser();
      if (!cancelled) {
        console.log('Current user from getCurrentUser:', currentUser);
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      if (!cancelled) setUser(null);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      try {
        console.log('Auth state changed:', event, 'Session:', session?.user?.id);
        if (session?.user) {
          const currentUser = await getCurrentUser();
          if (!cancelled) setUser(currentUser);

          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentUser && currentSession) {
            console.warn('Corrupt session. Forcing logout.');
            await supabase.auth.signOut();
            if (!cancelled) setUser(null);
            toast.error('Tu sesión es inválida. Iniciá sesión de nuevo.');
          }
        } else {
          if (!cancelled) setUser(null);
        }
      } catch (error) {
        console.error('Error en cambio de sesión:', error);
        await supabase.auth.signOut();
        if (!cancelled) setUser(null);
        toast.error('Error de sesión. Iniciá sesión de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
  );

  checkUser();

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      console.log('Revalidando por visibilidad...');
      setLoading(true);
      getCurrentUser()
        .then((currentUser) => {
          if (!cancelled) setUser(currentUser);
        })
        .catch((err) => {
          console.error('Error al revalidar:', err);
          if (!cancelled) setUser(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    cancelled = true;
    subscription?.unsubscribe?.();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);


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
