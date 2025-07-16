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
    // This function will be called once on mount and by the auth state change listener
    const fetchAndSetUser = async () => {
      setLoading(true); // Set loading to true when fetching user
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('AuthContext: Error fetching user:', error);
        setUser(null); // Ensure user is null on error
        toast.error('Error al cargar la información del usuario.');
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };

    // Initial fetch
    fetchAndSetUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event);
        // For SIGNED_IN and INITIAL_SESSION, refetch user data
        // For SIGNED_OUT, user will be null, so set it directly
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchAndSetUser(); // Re-fetch user on sign-in or initial session
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false); // Ensure loading is false after sign out
        }
        // For other events (e.g., USER_UPDATED, PASSWORD_RECOVERY), fetchAndSetUser can be called if needed
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  async function logout() {
    try {
      setLoading(true); // Establece loading a true durante el proceso de logout
      await signOut();
      setUser(null);
      localStorage.clear();
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false); // Establece loading a false después del proceso de logout
    }
  }

  async function login(data: LoginFormData) {
    try {
      // No es necesario establecer 'loading' aquí, ya que la prop 'isLoading' del formulario lo maneja
      await signIn(data.email, data.password);
      toast.success('¡Sesión iniciada correctamente!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Credenciales incorrectas. Por favor, intenta nuevamente.');
      throw error;
    }
    // No hay bloque finally aquí, ya que 'loading' es gestionado por la prop 'isLoading' del formulario
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