import React from 'react';
import { useForm } from 'react-hook-form';
import { Trip } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createClient } from '../../lib/supabase/clients';
import { createQuotation } from '../../lib/supabase/quotations';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../utils/currency';

interface QuotationFormData {
  name: string;
  email: string;
  phone: string;
  observations?: string;
  adults: number;
  children: number;
}

interface QuotationRequestFormProps {
  trip: Trip;
  onSuccess: () => void;
}

export function QuotationRequestForm({ trip, onSuccess }: QuotationRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormData>({
    defaultValues: {
      adults: 2,
      children: 0
    }
  });


  const onSubmit = async (data: QuotationFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert price to USD for display in message
      const priceUSD = trip.currency_type === 'USD' ? trip.price : Math.round(trip.price / 40);
      
      // 1. Create client in CRM with trip information
      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        message: `Interesado en el paquete: ${trip.title} - ${trip.destination}. Fecha de salida: ${new Date(trip.departure_date).toLocaleDateString('es-UY')}. Precio: ${formatPrice(trip.price, trip.currency_type)}. Viajeros: ${data.adults} adultos, ${data.children} niños.${data.observations ? ` Mensaje adicional: ${data.observations}` : ''}`,
        status: 'nuevo' as const,
        // Add trip-related fields
        last_booked_trip_id: trip.id,
        last_booked_trip_title: trip.title,
        last_booked_trip_destination: trip.destination,
        last_booked_trip_date: trip.departure_date,
        preferred_destination: trip.destination,
        trip_value: trip.price,
        trip_value_currency: trip.currency_type,
      };

      console.log('Creating client with data:', clientData);
      
      // Create client record
      const client = await createClient(clientData);
      
      // 2. Create quotation record
      const quotationData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        destination: trip.destination,
        departure_date: trip.departure_date.split('T')[0],
        return_date: trip.return_date.split('T')[0],
        flexible_dates: false,
        adults: data.adults,
        children: data.children,
        observations: data.observations || '',
        status: 'pending' as const,
        trip_id: trip.id,
        trip_title: trip.title,
        trip_destination: trip.destination,
        trip_price: trip.price,
        trip_price_currency: trip.currency_type
      };
      
      console.log('Creating quotation with data:', quotationData);
      await createQuotation(quotationData);
      
      toast.success('¡Solicitud de cotización enviada con éxito! Nos pondremos en contacto contigo pronto.');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating quotation:', error);
      
      // More detailed error handling
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          toast.error('Error de autorización. Por favor, intenta nuevamente en unos momentos.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          toast.error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
        } else {
          toast.error(`Error al procesar tu solicitud: ${errorMessage}`);
        }
      } else {
        toast.error('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trip.available_spots <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-700 font-medium">Lo sentimos, no hay cupos disponibles para este paquete.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-heading font-bold text-xl mb-4 text-secondary-900">Solicitar cotización</h3>
      
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

        <Input
          label="Observaciones o consultas (opcional)"
          id="observations"
          type="text"
          placeholder="Alguna consulta específica sobre el paquete..."
          fullWidth
          error={errors.observations?.message}
          {...register('observations')}
        />
        
        <div className="mt-6">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Solicitar cotización
          </Button>
        </div>
        
        <p className="text-xs text-secondary-500 mt-4">
          Al solicitar una cotización, aceptas nuestros términos y condiciones. Te contactaremos para brindarte más detalles sobre el paquete y responder tus consultas.
        </p>
      </form>
    </div>
  );
}