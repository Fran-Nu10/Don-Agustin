import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { LoginFormData } from '../types';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export function LoginPage() {
  const { user, login, loading, isRecoveringSession } = useAuth();

  // Log user and loading state for debugging
  useEffect(() => {
    console.log('LoginPage: user state:', user);
    console.log('LoginPage: loading state:', loading);
    console.log('LoginPage: isRecoveringSession state:', isRecoveringSession);
  }, [user, loading]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirige si ya ha iniciado sesión Y no está cargando Y no está recuperando sesión
  // Esto asegura que el estado del usuario sea estable antes de intentar la redirección
  if (!loading && !isRecoveringSession && user) {
    console.log('LoginPage: Redirecting to /admin/dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Attempting login with:', data.email);
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-secondary-50 via-white to-secondary-50 py-12 main-content">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
          {/* Show session recovery message */}
          {isRecoveringSession && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-lg z-50">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Recuperando sesión...
              </div>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <div className="bg-gradient-to-br from-white via-white to-secondary-50 rounded-lg shadow-xl p-8 border border-secondary-100">
              <div className="text-center mb-6">
                <h1 className="font-heading font-bold text-2xl mb-2 text-secondary-900">
                  Iniciar Sesión
                </h1>
                <p className="text-secondary-600">
                  Accede al panel administrativo de Don Agustín Viajes
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Correo electrónico"
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  fullWidth
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido',
                    },
                  })}
                />
                
                <Input
                  label="Contraseña"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  fullWidth
                  error={errors.password?.message}
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                />
                
                <div className="mt-6">
                  <Button type="submit" fullWidth isLoading={loading}>
                    Ingresar
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center text-sm text-secondary-500">
                <p>¿Olvidaste tu contraseña? Contacta al administrador del sistema.</p>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/" className="text-primary-950 hover:underline">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}