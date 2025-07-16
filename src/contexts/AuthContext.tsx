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

// src/lib/supabase/getCurrentUser.ts
import { supabase } from './client';
import { User } from '../../types';

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔍 getCurrentUser: Iniciando...');

    const authResult = await supabase.auth.getUser();
    const { data: { user: authUser }, error: authError } = authResult;

    if (authError || !authUser) {
      console.warn('⚠️ No se encontró usuario autenticado o hubo error:', authError);
      return null;
    }

    console.log('✅ Usuario autenticado encontrado:', authUser.id, authAuth?.email);

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('👤 Usuario no existe en public.users, creando nuevo...');

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            user_id: authUser.id,
            email: authUser.email,
            role: 'employee',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error al crear nuevo usuario en public.users:', insertError);
          throw insertError;
        }

        console.log('✅ Nuevo usuario creado:', newUser);
        return newUser;
      }

      console.error('❌ Error inesperado al buscar usuario:', fetchError);
      throw fetchError;
    }

    console.log('✅ Usuario encontrado en public.users:', existingUser);
    return existingUser;

  } catch (error) {
    console.error('🔥 Error fatal en getCurrentUser:', error);
    return null;
  }
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