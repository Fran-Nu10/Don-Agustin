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

  async function logout() {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      localStorage.clear(); // Ensure localStorage is cleared on explicit logout
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking current user...');
        const currentUser = await getCurrentUser(); // This calls the wrapped getCurrentUser
        console.log('Current user:', currentUser);
        setUser(currentUser);

        // --- NUEVA LÓGICA DE VALIDACIÓN DE SESIÓN ---
        const { data: { session } } = await supabase.auth.getSession();
        if (!currentUser && session) {
          console.warn('Corrupt or desynchronized session detected. Forcing logout and clearing localStorage.');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
        }
      } catch (error) {
        console.error('Error checking current user:', error);
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        toast.error('Tu sesión expiró o es inválida. Por favor, inicia sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, session?.user?.id);
          if (session?.user) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentUser && currentSession) {
              console.warn('Corrupt or desynchronized session detected during auth state change. Forcing logout and clearing localStorage.');
              await supabase.auth.signOut();
              localStorage.clear();
              setUser(null);
              toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          toast.error('Error de sesión. Por favor vuelve a iniciar sesión.');
        } finally {
          setLoading(false);
        }
      }
    );

    // ✅ Llamada inicial
    checkUser();

    // ✅ Listener entre pestañas (sincroniza sesiones)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token') {
        console.log("🔄 Cambio detectado en supabase.auth.token desde otra pestaña");
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    loading,
    login: async (data: LoginFormData) => {
      try {
        setLoading(true);
        await signIn(data.email, data.password);
        toast.success('¡Sesión iniciada correctamente!');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Credenciales incorrectas. Por favor, intenta nuevamente.');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    logout,
    isOwner: () => user?.role === 'owner',
    isEmployee: () => user?.role === 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

  async function login(data: LoginFormData) {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
      toast.success('¡Sesión iniciada correctamente!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Credenciales incorrectas. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function isOwner() {
    return user?.role === 'owner';
  }

  function isEmployee() {
    return user?.role === 'employee';
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isOwner,
    isEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}