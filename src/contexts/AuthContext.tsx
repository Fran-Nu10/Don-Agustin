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
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function login(data: LoginFormData) {
    try {
      setLoading(true);
      setAuthError(null);
      const currentUser = await signIn(data.email, data.password);
      
      // Log the user data received from signIn
      console.log('AuthContext: Login successful, user data:', currentUser);
      
      if (!currentUser) {
        throw new Error('No se pudo obtener la información del usuario');
      }
      
      // Set the user state directly here
      setUser(currentUser);
      
      toast.success('¡Sesión iniciada correctamente!');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error instanceof Error ? error.message : 'Error desconocido');
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
      localStorage.clear();
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }

  // Simplified role check functions
  function isOwner(): boolean {
    const result = user?.role === 'owner';
    console.log(`AuthContext: isOwner() called - user role: ${user?.role}, result: ${result}`);
    return result;
  }

  function isEmployee(): boolean {
    const result = user?.role === 'employee' || user?.role === 'owner';
    console.log(`AuthContext: isEmployee() called - user role: ${user?.role}, result: ${result}`);
    return result;
  }

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        console.log('AuthContext: Initial user check complete:', currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, 'Session exists:', !!session);
          if (session?.user) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            console.log('AuthContext: User updated after auth state change:', currentUser);
          } else {
            console.log('AuthContext: No session, setting user to null');
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

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token') {
        console.log("🔄 Cambio detectado en supabase.auth.token desde otra pestaña");
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    authError,
    logout,
    isOwner,
    isEmployee,
  };

  // Debug output for the current auth state
  console.log('AuthContext render - Current state:', { 
    userExists: !!user, 
    userRole: user?.role, 
    loading, 
    authError 
  });

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
  
  // Debug the context when it's accessed
  console.log('useAuth hook called - user role:', context.user?.role);
  
  return context;
}
