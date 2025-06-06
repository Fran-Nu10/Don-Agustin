import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TripFormData, Trip, ItineraryDay, IncludedService } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Calendar, MapPin, Users } from 'lucide-react';

interface TripFormProps {
  initialData?: Trip;
  onSubmit: (data: TripFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function TripForm({ initialData, onSubmit, isSubmitting }: TripFormProps) {
  const {
    register,
    handleSubmit,
    control,
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
          category: initialData.category,
          itinerary: initialData.itinerary || [],
          included_services: initialData.included_services || [],
        }
      : {
          itinerary: [{ day: 1, title: '', description: '' }],
          included_services: [{ icon: 'Hotel', title: '', description: '' }],
        },
  });

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({
    control,
    name: 'itinerary',
  });

  const {
    fields: servicesFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: 'included_services',
  });

  const addItineraryDay = () => {
    appendItinerary({
      day: itineraryFields.length + 1,
      title: '',
      description: '',
    });
  };

  const addService = () => {
    appendService({
      icon: 'Hotel',
      title: '',
      description: '',
    });
  };

  const iconOptions = [
    'Hotel', 'Plane', 'Car', 'Train', 'Ship', 'Bus', 'Utensils', 'Camera',
    'Map', 'Compass', 'Mountain', 'Waves', 'Sun', 'Umbrella', 'Ticket',
    'Shield', 'Heart', 'Star', 'Coffee', 'Wifi'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h3 className="font-heading font-bold text-lg mb-4 text-secondary-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary-950" />
          Información básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título del viaje"
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
          rows={4}
          fullWidth
          error={errors.description?.message}
          {...register('description', { required: 'La descripción es obligatoria' })}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio (UYU)"
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

          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-900">
              Categoría
            </label>
            <select
              {...register('category', { required: 'La categoría es obligatoria' })}
              className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleccionar categoría</option>
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
              <option value="grupal">Grupal</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
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
      </div>

      {/* Itinerario */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-secondary-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-950" />
            Itinerario del viaje
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addItineraryDay}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar día
          </Button>
        </div>

        <div className="space-y-4">
          {itineraryFields.map((field, index) => (
            <div key={field.id} className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900">Día {index + 1}</h4>
                {itineraryFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItinerary(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Título del día"
                  fullWidth
                  {...register(`itinerary.${index}.title`, {
                    required: 'El título es obligatorio',
                  })}
                />
                
                <input
                  type="hidden"
                  {...register(`itinerary.${index}.day`)}
                  value={index + 1}
                />
              </div>
              
              <Textarea
                label="Descripción de actividades"
                rows={3}
                fullWidth
                {...register(`itinerary.${index}.description`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Servicios incluidos */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-secondary-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-950" />
            Servicios incluidos
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addService}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar servicio
          </Button>
        </div>

        <div className="space-y-4">
          {servicesFields.map((field, index) => (
            <div key={field.id} className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900">Servicio {index + 1}</h4>
                {servicesFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Icono
                  </label>
                  <select
                    {...register(`included_services.${index}.icon`)}
                    className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Título del servicio"
                  fullWidth
                  {...register(`included_services.${index}.title`, {
                    required: 'El título es obligatorio',
                  })}
                />
                
                <Input
                  label="Descripción"
                  fullWidth
                  {...register(`included_services.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4">
        <Button type="submit" isLoading={isSubmitting} size="lg">
          {initialData ? 'Actualizar viaje' : 'Crear viaje'}
        </Button>
      </div>
    </form>
  );
}