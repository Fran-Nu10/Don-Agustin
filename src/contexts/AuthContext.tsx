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
  const waitForSession = async (maxTries = 10) => {
    for (let i = 0; i < maxTries; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;
      await new Promise((res) => setTimeout(res, 300)); // esperar 300ms
    }
    return null;
  };

  const checkUser = async () => {
    try {
      const session = await waitForSession();

      if (!session) {
        console.warn('No hay sesión activa después de reintentos');
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.warn('Sesión válida pero sin usuario en tabla users');
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        toast.error('Tu sesión no es válida. Iniciá sesión nuevamente.');
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error en checkUser:', error);
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      toast.error('Error de sesión. Iniciá sesión de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
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
