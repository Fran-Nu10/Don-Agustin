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
  const init = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔁 Sesión al iniciar:", session);

      if (session?.user) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          console.warn("⚠️ Usuario no encontrado en tabla 'users'. Forzando logout.");
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          toast.error("Tu sesión está desincronizada. Iniciá sesión de nuevo.");
        }
      } else {
        console.log("📭 No hay sesión activa.");
        setUser(null);
      }
    } catch (err) {
      console.error("Error en init AuthContext:", err);
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  init();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("🌀 Cambio de estado auth:", event);
    if (session?.user) {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(null);
    }
  });

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