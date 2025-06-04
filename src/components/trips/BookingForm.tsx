import React from 'react';
import { useForm } from 'react-hook-form';
import { BookingFormData, Trip } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createBooking } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

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
      
      // Create booking
      await createBooking({
        trip_id: trip.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      
      toast.success('¡Reserva realizada con éxito!');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Ocurrió un error al procesar tu reserva. Por favor, intenta nuevamente.');
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-heading font-bold text-xl mb-4 text-secondary-900">Reserva tu lugar</h3>
      
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
      
      <div className="mt-6">
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reservar
        </Button>
      </div>
      
      <p className="text-xs text-secondary-500 mt-4">
        Al reservar, aceptas nuestros términos y condiciones. Te contactaremos para coordinar el pago y brindarte más detalles sobre el viaje.
      </p>
    </form>
  );
}