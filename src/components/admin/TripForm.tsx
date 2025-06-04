import React from 'react';
import { useForm } from 'react-hook-form';
import { TripFormData, Trip } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface TripFormProps {
  initialData?: Trip;
  onSubmit: (data: TripFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function TripForm({ initialData, onSubmit, isSubmitting }: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormData>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          destination: initialData.destination,
          description: initialData.description,
          price: initialData.price,
          departure_date: initialData.departure_date.split('T')[0],
          return_date: initialData.return_date.split('T')[0],
          available_spots: initialData.available_spots,
          image_url: initialData.image_url,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Título"
          id="title"
          type="text"
          fullWidth
          error={errors.title?.message}
          {...register('title', { required: 'El título es obligatorio' })}
        />
        
        <Input
          label="Destino"
          id="destination"
          type="text"
          fullWidth
          error={errors.destination?.message}
          {...register('destination', { required: 'El destino es obligatorio' })}
        />
      </div>
      
      <Textarea
        label="Descripción"
        id="description"
        rows={5}
        fullWidth
        error={errors.description?.message}
        {...register('description', { required: 'La descripción es obligatoria' })}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Precio (en pesos uruguayos)"
          id="price"
          type="number"
          fullWidth
          error={errors.price?.message}
          {...register('price', { 
            required: 'El precio es obligatorio',
            valueAsNumber: true,
            min: { value: 0, message: 'El precio debe ser mayor a 0' },
          })}
        />
        
        <Input
          label="Cupos disponibles"
          id="available_spots"
          type="number"
          fullWidth
          error={errors.available_spots?.message}
          {...register('available_spots', { 
            required: 'Los cupos son obligatorios',
            valueAsNumber: true,
            min: { value: 0, message: 'Los cupos deben ser mayor o igual a 0' },
          })}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de salida"
          id="departure_date"
          type="date"
          fullWidth
          error={errors.departure_date?.message}
          {...register('departure_date', { required: 'La fecha de salida es obligatoria' })}
        />
        
        <Input
          label="Fecha de regreso"
          id="return_date"
          type="date"
          fullWidth
          error={errors.return_date?.message}
          {...register('return_date', { required: 'La fecha de regreso es obligatoria' })}
        />
      </div>
      
      <Input
        label="URL de la imagen"
        id="image_url"
        type="text"
        fullWidth
        error={errors.image_url?.message}
        {...register('image_url', { required: 'La URL de la imagen es obligatoria' })}
      />
      
      <div className="pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Actualizar viaje' : 'Crear viaje'}
        </Button>
      </div>
    </form>
  );
}