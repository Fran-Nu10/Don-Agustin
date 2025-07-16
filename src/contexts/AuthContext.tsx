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
    const initializeAuth = async () => {
      console.log('AuthContext: --- START initializeAuth ---');
      setLoading(true); // Asegura que loading sea true al inicio del efecto
      try {
        console.log('AuthContext: Checking initial user...');
        const currentUser = await getCurrentUser();
        console.log('AuthContext: Initial user:', currentUser);
        setUser(currentUser);

        // Verificación adicional para sesión desincronizada en la carga inicial
        const { data: { session } } = await supabase.auth.getSession();
        if (!currentUser && session) {
          console.warn('AuthContext: Corrupt or desynchronized session detected on initial load. Forcing logout and clearing localStorage.');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
        }
      } catch (error) {
        console.error('AuthContext: Error during initial auth check:', error);
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        toast.error('Error al cargar la sesión. Por favor, inicia sesión nuevamente.');
      } finally {
        setLoading(false); // Establece loading a false después de la verificación inicial
        console.log('AuthContext: --- END initializeAuth ---');
      }
    };

    // Ejecuta la verificación inicial
    initializeAuth();

    // Configura el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.id);
        // Solo actualiza el estado del usuario, no manipules 'loading' aquí a menos que sea una reinicialización completa
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          // Vuelve a verificar la desincronización después de iniciar sesión/sesión inicial
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentUser && currentSession) {
            console.warn('AuthContext: Corrupt or desynchronized session detected during auth state change. Forcing logout and clearing localStorage.');
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(null);
            toast.error('Tu sesión es inválida o está desincronizada. Por favor, inicia sesión nuevamente.');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          // No es necesario establecer 'loading' aquí, ya que la función logout lo maneja
        }
        // Para otros eventos como 'USER_UPDATED', 'PASSWORD_RECOVERY', etc., se podría llamar a getCurrentUser si es necesario
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // El array de dependencias vacío significa que esto se ejecuta una vez al montar

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
}