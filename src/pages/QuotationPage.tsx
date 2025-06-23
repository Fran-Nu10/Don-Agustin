import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Calendar, MapPin, Users, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QuotationFormData } from '../types/quotation';
import { createQuotation } from '../lib/supabase/quotations';

const DEPARTMENTS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores',
  'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro',
  'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];

export function QuotationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormData>({
    defaultValues: {
      adults: 2,
      children: 0,
      flexible_dates: false,
    }
  });

  const flexibleDates = watch('flexible_dates');

  const onSubmit = async (data: QuotationFormData) => {
    try {
      setIsSubmitting(true);
      await createQuotation(data);
      setIsSuccess(true);
      reset();
      toast.success('¡Solicitud de cotización enviada con éxito! Te contactaremos pronto.');
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error('Error al enviar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow relative py-12 main-content">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/1835718/pexels-photo-1835718.jpeg"
              alt="Success Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/70 to-green-900/80"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                <h1 className="font-heading font-bold text-3xl text-secondary-900 mb-4">
                  ¡Solicitud Enviada!
                </h1>
                
                <p className="text-lg text-secondary-600 mb-8">
                  Hemos recibido tu solicitud de cotización. Nuestro equipo la revisará y te contactará 
                  en las próximas 24 horas con una propuesta personalizada.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setIsSuccess(false)}>
                    Solicitar otra cotización
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Volver al inicio
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow relative py-12 main-content">
        {/* Nuevo banner con imagen de fondo más profesional */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg"
            alt="Quotation Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-primary-900/75 to-secondary-900/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Section - Más separado del techo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 pt-8"
          >
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">
              Solicitar Cotización
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Cuéntanos sobre tu viaje soñado y te enviaremos una propuesta personalizada 
              con los mejores precios y servicios.
            </p>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
                <h2 className="font-heading font-bold text-2xl mb-2">
                  Información del Viaje
                </h2>
                <p className="text-primary-100">
                  Completa los datos para recibir tu cotización personalizada
                </p>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-heading font-bold text-xl text-secondary-900 mb-6 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary-600" />
                      Información Personal
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nombre y apellido"
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        fullWidth
                        error={errors.name?.message}
                        {...register('name', { required: 'El nombre es obligatorio' })}
                      />
                      
                      <Input
                        label="Email"
                        id="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        fullWidth
                        error={errors.email?.message}
                        {...register('email', { 
                          required: 'El email es obligatorio',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido',
                          },
                        })}
                      />
                      
                      <Input
                        label="Teléfono"
                        id="phone"
                        type="tel"
                        placeholder="099 123 456"
                        fullWidth
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-secondary-900">
                          Departamento
                        </label>
                        <select
                          {...register('department')}
                          className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Seleccionar departamento</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Trip Information */}
                  <div>
                    <h3 className="font-heading font-bold text-xl text-secondary-900 mb-6 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                      Información del Viaje
                    </h3>
                    
                    <div className="space-y-6">
                      <Input
                        label="Destino/s"
                        id="destination"
                        type="text"
                        placeholder="París, Roma, Barcelona..."
                        fullWidth
                        error={errors.destination?.message}
                        {...register('destination')}
                      />
                      
                      {/* Flexible Dates Toggle */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="flexible_dates"
                          {...register('flexible_dates')}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="flexible_dates" className="text-sm font-medium text-secondary-700">
                          Fechas flexibles
                        </label>
                      </div>
                      
                      {!flexibleDates && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Fecha de salida"
                            id="departure_date"
                            type="date"
                            fullWidth
                            error={errors.departure_date?.message}
                            {...register('departure_date')}
                          />
                          
                          <Input
                            label="Fecha de regreso"
                            id="return_date"
                            type="date"
                            fullWidth
                            error={errors.return_date?.message}
                            {...register('return_date')}
                          />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-secondary-900">
                            Adultos
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            {...register('adults', { 
                              required: 'Número de adultos es obligatorio',
                              min: { value: 1, message: 'Mínimo 1 adulto' },
                              valueAsNumber: true,
                            })}
                            className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.adults && (
                            <p className="mt-1 text-sm text-red-600">{errors.adults.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-secondary-900">
                            Menores
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            {...register('children', { 
                              min: { value: 0, message: 'No puede ser negativo' },
                              valueAsNumber: true,
                            })}
                            className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.children && (
                            <p className="mt-1 text-sm text-red-600">{errors.children.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="font-heading font-bold text-xl text-secondary-900 mb-6 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                      Información Adicional
                    </h3>
                    
                    <Textarea
                      label="Observaciones"
                      id="observations"
                      placeholder="Cuéntanos sobre tus preferencias, presupuesto aproximado, tipo de alojamiento, actividades de interés, etc."
                      rows={5}
                      fullWidth
                      error={errors.observations?.message}
                      {...register('observations')}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-secondary-200">
                    <Button 
                      type="submit" 
                      isLoading={isSubmitting}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      Enviar Cotización
                    </Button>
                    
                    <p className="text-sm text-secondary-500 mt-4">
                      Al enviar esta solicitud, aceptas que nos pongamos en contacto contigo 
                      para brindarte información sobre tu viaje.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitCard
                icon={<Phone className="h-8 w-8 text-primary-600" />}
                title="Respuesta Rápida"
                description="Te contactamos en menos de 24 horas con tu cotización personalizada"
              />
              <BenefitCard
                icon={<Mail className="h-8 w-8 text-primary-600" />}
                title="Sin Compromiso"
                description="Recibe tu cotización sin ningún tipo de compromiso de compra"
              />
              <BenefitCard
                icon={<CheckCircle className="h-8 w-8 text-primary-600" />}
                title="Asesoramiento Experto"
                description="Más de 25 años de experiencia creando viajes inolvidables"
              />
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="bg-gradient-to-br from-white via-secondary-50/50 to-white backdrop-blur-sm rounded-lg p-6 shadow-card text-center hover:shadow-lg transition-all duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="font-heading font-bold text-lg text-secondary-900 mb-2">
        {title}
      </h4>
      <p className="text-secondary-600">
        {description}
      </p>
    </div>
  );
}