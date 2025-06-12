import React from 'react';
import { useForm } from 'react-hook-form';
import { Trip } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createClient } from '../../lib/supabase/clients';
import { toast } from 'react-hot-toast';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  message?: string;
}

interface BookingFormProps {
  trip: Trip;
  onSuccess: () => void;
}

export function BookingForm({ trip, onSuccess }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>();

  const onSubmit = async (data: BookingFormData) => {
    if (trip.available_spots <= 0) {
      toast.error('Lo sentimos, no hay cupos disponibles para este viaje.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create client in CRM with trip information
      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        message: `Interesado en el viaje: ${trip.title} - ${trip.destination}. Fecha de salida: ${new Date(trip.departure_date).toLocaleDateString('es-UY')}. Precio: $${trip.price.toLocaleString('es-UY')}.${data.message ? ` Mensaje adicional: ${data.message}` : ''}`,
        status: 'nuevo' as const
      };

      console.log('Attempting to create client with data:', clientData);
      
      await createClient(clientData);
      
      toast.success('¡Reserva realizada con éxito! Nos pondremos en contacto contigo pronto.');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // More detailed error handling
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          toast.error('Error de autorización. Por favor, intenta nuevamente en unos momentos.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          toast.error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
        } else {
          toast.error(`Error al procesar tu reserva: ${errorMessage}`);
        }
      } else {
        toast.error('Ocurrió un error al procesar tu reserva. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trip.available_spots <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-700 font-medium">Lo sentimos, no hay cupos disponibles para este viaje.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-heading font-bold text-xl mb-4 text-secondary-900">Reserva tu lugar</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nombre completo"
          id="name"
          type="text"
          placeholder="Juan Pérez"
          fullWidth
          error={errors.name?.message}
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        
        <Input
          label="Correo electrónico"
          id="email"
          type="email"
          placeholder="juan@ejemplo.com"
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
          label="Teléfono"
          id="phone"
          type="tel"
          placeholder="099 123 456"
          fullWidth
          error={errors.phone?.message}
          {...register('phone', { required: 'El teléfono es obligatorio' })}
        />

        <Input
          label="Mensaje adicional (opcional)"
          id="message"
          type="text"
          placeholder="Alguna consulta específica sobre el viaje..."
          fullWidth
          error={errors.message?.message}
          {...register('message')}
        />
        
        <div className="mt-6">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Reservar
          </Button>
        </div>
        
        <p className="text-xs text-secondary-500 mt-4">
          Al reservar, aceptas nuestros términos y condiciones. Te contactaremos para coordinar el pago y brindarte más detalles sobre el viaje.
        </p>
      </form>
    </div>
  );
}