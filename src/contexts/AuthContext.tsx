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

  useEffect(() => {
    let authSubscription: any;

    const initializeAuth = async () => {
      setLoading(true);

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error al obtener la sesión inicial:", error);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (userError) {
          console.warn("Usuario no sincronizado con tabla users. Cerrando sesión...");
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
        } else {
          setUser(userData);
          console.log("✅ Usuario cargado desde sesión persistida:", userData);
        }
      } else {
        console.log("ℹ️ No hay sesión activa.");
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();

    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("📡 Evento de cambio de auth:", event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (userError) {
            console.warn("⚠️ Error al sincronizar usuario tras cambio de estado");
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(null);
          } else {
            setUser(userData);
            console.log("✅ Usuario sincronizado desde evento de sesión:", userData);
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.clear();
        setLoading(false);
      }
    });

    // Listener entre pestañas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token') {
        console.log("🔄 Cambio detectado en supabase.auth.token desde otra pestaña");
        initializeAuth(); // Rehidrata el contexto
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 👉 Agrega estas funciones + el return que faltaban
  const value = {
    user,
    loading,
    login: async (data: LoginFormData) => {
      try {
        await signIn(data.email, data.password);
        toast.success('¡Sesión iniciada correctamente!');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Credenciales incorrectas. Intenta nuevamente.');
        throw error;
      }
    },
    logout: async () => {
      try {
        setLoading(true);
        await signOut();
        setUser(null);
        localStorage.clear();
        toast.success('Sesión cerrada correctamente');
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Error al cerrar sesión');
      } finally {
        setLoading(false);
      }
    },
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