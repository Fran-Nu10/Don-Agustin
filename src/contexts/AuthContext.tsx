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
      console.log('AuthContext: --- START initializeAuth ---');
      setLoading(true); // Asegura que loading sea true al inicio
      try {
        // Espera a que la sesión inicial sea cargada por Supabase.
        // Esto es crucial para asegurar que localStorage sea leído antes de continuar.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthContext: Error al obtener la sesión inicial:', sessionError);
          localStorage.clear(); // Limpia por si hay una sesión corrupta
          setUser(null);
          toast.error('Error al cargar la sesión inicial. Por favor, inicia sesión nuevamente.');
          return;
        }

        if (session) {
          console.log('AuthContext: Sesión inicial encontrada, obteniendo datos de usuario...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (userError) {
            console.error('AuthContext: Error al obtener usuario de la BD después de la sesión inicial:', userError);
            await supabase.auth.signOut(); // Desloguea si hay desincronización
            localStorage.clear();
            setUser(null);
            toast.error('Error de sincronización de usuario. Por favor, inicia sesión nuevamente.');
          } else {
            setUser(userData);
            console.log('AuthContext: Usuario establecido desde la sesión inicial:', userData);
          }
        } else {
          console.log('AuthContext: No se encontró sesión inicial.');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error inesperado durante la configuración inicial de autenticación:', error);
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        toast.error('Ocurrió un error inesperado al inicializar la autenticación. Por favor, inicia sesión nuevamente.');
      } finally {
        setLoading(false); // Establece loading a false una vez que la inicialización ha terminado
        console.log('AuthContext: --- END initializeAuth. Loading:', false);
      }
    };

    // Llama a initializeAuth directamente al montar el componente
    initializeAuth();

    // Configura el listener de cambio de estado de autenticación para cambios posteriores
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Cambio de estado de autenticación (listener de eventos):', event);
        // Solo actualiza el estado del usuario basándose en los eventos, no vuelvas a ejecutar la inicialización completa
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            if (userError) {
              console.error('AuthContext: Error al obtener usuario de la BD durante el cambio de estado:', userError);
              await supabase.auth.signOut();
              localStorage.clear();
              setUser(null);
              toast.error('Error de sincronización de usuario. Por favor, inicia sesión nuevamente.');
            } else {
              setUser(userData);
              console.log('AuthContext: Usuario establecido desde el cambio de estado de autenticación:', userData);
            }
          } else {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false); // Asegura que loading sea false después de cerrar sesión
          console.log('AuthContext: Usuario cerró sesión. Loading:', false);
        }
      }
    ).data.subscription; // Obtiene la suscripción para poder desuscribirse al desmontar

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
}