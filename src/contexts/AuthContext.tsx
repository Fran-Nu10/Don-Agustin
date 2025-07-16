// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut } from '../lib/supabase';
import { User, LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function logout() {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setSession(null);
      localStorage.clear();
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
        console.log('AuthContext: Checking current user...');
        const currentUser = await getCurrentUser();
        console.log('AuthContext: Current user:', currentUser);
        setUser(currentUser);

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        console.log('AuthContext: Supabase session:', session);

        if (!currentUser && session) {
          console.warn('AuthContext: Session desincronizada. Cerrando sesión.');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          setSession(null);
          toast.error('Tu sesión es inválida o está desincronizada. Iniciá sesión nuevamente.');
        }
      } catch (error) {
        console.error('Error checking current user:', error);
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        setSession(null);
        toast.error('Tu sesión expiró o es inválida. Iniciá sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('AuthContext: Auth state changed:', event, session?.user?.id);
          setSession(session);

          if (session?.user) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentUser && currentSession) {
              console.warn('AuthContext: Sesión corrupta detectada. Cerrando sesión.');
              await supabase.auth.signOut();
              localStorage.clear();
              setUser(null);
              setSession(null);
              toast.error('Tu sesión es inválida o está desincronizada. Iniciá sesión nuevamente.');
            }
          } else {
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('AuthContext: Error durante el cambio de estado de sesión:', error);
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          setSession(null);
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
    session,
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
