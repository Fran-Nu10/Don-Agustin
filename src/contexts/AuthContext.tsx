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
    console.log('AuthContext: --- START checkUser ---');

    try {
      // 🔁 Intentar obtener sesión hasta 5 veces por si tarda en hidratarse desde localStorage
      let session = null;
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        console.log(`AuthContext: Esperando sesión... intento ${i + 1}`);
        await new Promise((r) => setTimeout(r, 250)); // esperar 250ms
      }

      if (!session) {
        console.warn('AuthContext: No se pudo obtener sesión de Supabase.');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('AuthContext: Sesión detectada:', session.user.id);

      // 👤 Intentar obtener el usuario de la tabla `users`
      const currentUser = await getCurrentUser();
      console.log('AuthContext: Usuario desde DB:', currentUser);

      // Si hay sesión pero no usuario en la tabla `users`, la sesión está corrupta o incompleta
      if (!currentUser) {
        console.warn('AuthContext: Sesión válida pero sin usuario en tabla "users". Cerrando sesión...');
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        toast.error('Tu sesión es inválida. Por favor, inicia sesión nuevamente.');
      } else {
        setUser(currentUser);
      }

    } catch (error) {
      console.error('AuthContext: Error inesperado al verificar usuario:', error);
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      toast.error('Tu sesión expiró. Por favor, inicia sesión de nuevo.');
    } finally {
      setLoading(false);
      console.log('AuthContext: --- END checkUser ---');
    }
  };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      try {
        console.log('AuthContext: Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);

          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentUser && currentSession) {
            console.warn('AuthContext: Sesión corrupta detectada en cambio de estado. Cerrando...');
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(null);
            toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error en cambio de estado:', error);
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
