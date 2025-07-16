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
        // Si getCurrentUser devuelve null (indicando que no hay un usuario válido en nuestra tabla 'users')
        // pero Supabase Auth todavía tiene una sesión activa (lo que podría indicar una sesión corrupta o desincronizada)
        // entonces forzamos un logout completo.
        const { data: { session } } = await supabase.auth.getSession();
        if (!currentUser && session) {
          console.warn('Corrupt or desynchronized session detected. Forcing logout and clearing localStorage.');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
        }
        // --- FIN NUEVA LÓGICA ---

      } catch (error) {
        console.error('Error checking current user:', error);
        // The handleSupabaseError in src/lib/supabase.ts should already handle clearing localStorage
        // for auth-related errors. This catch block is for other unexpected errors.
        await supabase.auth.signOut(); // Ensure logout on any error during checkUser
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
            // También aplicar la validación de sesión aquí para cambios de estado
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

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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