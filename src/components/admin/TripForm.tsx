import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trip, TripFormData, ItineraryDay, IncludedService } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Calendar, MapPin, Users, Upload, X, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface TripFormProps {
  initialData?: Trip;
  onSubmit: (data: TripFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function TripForm({ initialData, onSubmit, isSubmitting }: TripFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

  // Convert price from UYU to USD for display
  const getUSDPrice = (uyuPrice?: number) => {
    if (!uyuPrice) return '';
    return Math.round(uyuPrice / 40).toString(); // Using an approximate conversion rate of 40 UYU = 1 USD
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
          tags: initialData.tags || [],
        }
      : {
          itinerary: [{ day: 1, title: '', description: '' }],
          included_services: [{ icon: 'Hotel', title: '', description: '' }],
          tags: [],
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

  // Update form when tags change
  useEffect(() => {
    setValue('tags', selectedTags);
  }, [selectedTags, setValue]);

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

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Get tag color based on tag name
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'terrestre':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'vuelos':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'baja temporada':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'verano':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'eventos':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'exprés':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    }
  };

  // Handle image file selection
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    // Set timeout for upload with complete cleanup
    uploadTimeoutRef.current = setTimeout(() => {
      console.warn('Image upload timeout - cleaning up all state');
      setIsUploadingImage(false);
      setImageFile(null);
      setImagePreview('');
      setValue('image_url', '');
      setImageInputKey(prev => prev + 1); // Force input re-mount
      toast.error('La carga de la imagen tardó demasiado. Por favor, inténtalo de nuevo.');
    }, 30000); // 30 seconds
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      // Upload to Supabase Storage with retry logic
      const sanitizedName = sanitizeFilename(file.name);
      const fileName = `trip-images/${Date.now()}-${sanitizedName}`;
      
      let uploadResult;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempting image upload (attempt ${retryCount + 1}/${maxRetries})`);
          uploadResult = await supabase.storage
            .from('blog-images') // Mantener 'blog-images' para compatibilidad
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadResult.error) {
            throw uploadResult.error;
          }
          
          // Success - break out of retry loop
          break;
        } catch (retryError) {
          retryCount++;
          console.error(`Upload attempt ${retryCount} failed:`, retryError);
          
          if (retryCount >= maxRetries) {
            throw retryError; // Final attempt failed
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(uploadResult.data.path);

      // Set the image URL in the form
      setValue('image_url', publicUrlData.publicUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Complete cleanup on error
      console.log('Image upload failed - cleaning up all state');
      setImageFile(null);
      setImagePreview('');
      setValue('image_url', '');
      setImageInputKey(prev => prev + 1); // Force input re-mount
      
      // Show appropriate error message
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('413') || errorMessage.includes('too large')) {
          toast.error('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          toast.error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
        } else {
          toast.error('Error al subir la imagen. Por favor intenta nuevamente.');
        }
      } else {
        toast.error('Error al subir la imagen. Por favor intenta nuevamente.');
      }
    } finally {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
        uploadTimeoutRef.current = null;
      }
      setIsUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = () => {
    console.log('Removing image - cleaning up all state');
    setImageFile(null);
    setImagePreview('');
    setValue('image_url', '');
    setImageInputKey(prev => prev + 1); // Force input re-mount
    
    // Always reset upload state and clear timeout
    setIsUploadingImage(false);
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
  };

  const iconOptions = [
    'Hotel', 'Plane', 'Car', 'Train', 'Ship', 'Bus', 'Utensils', 'Camera',
    'Map', 'Compass', 'Mountain', 'Waves', 'Sun', 'Umbrella', 'Ticket',
    'Shield', 'Heart', 'Star', 'Coffee', 'Wifi'
  ];

  // Available tags - UPDATED with new tags
  const availableTags = ['terrestre', 'vuelos', 'baja temporada', 'verano', 'eventos', 'exprés'];

  // Custom submit handler to convert USD to UYU
  const handleFormSubmit = (data: TripFormData) => {
    // The price is already in UYU in the form data, no need to convert
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h3 className="font-heading font-bold text-lg mb-4 text-secondary-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary-950" />
          Información básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título del paquete"
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
          <div>
            <label className="block mb-1 text-sm font-medium text-secondary-900">
              Precio (USD)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              defaultValue={getUSDPrice(initialData?.price)}
              {...register('price', { 
                required: 'El precio es obligatorio',
                valueAsNumber: true,
                min: { value: 0, message: 'El precio debe ser mayor a 0' },
                // Convert USD to UYU on submit
                setValueAs: (v) => v ? parseFloat(v) * 40 : 0 // Multiply by 40 to convert to UYU
              })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
            <p className="text-xs text-secondary-500 mt-1">
              Ingrese el precio en dólares americanos (USD). Se guardará en pesos uruguayos.
            </p>
          </div>
          
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

        {/* Tags Section - UPDATED with new tags */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-secondary-900 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-primary-600" />
            Etiquetas (opcional)
          </label>
          
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? getTagColor(tag)
                    : 'bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200'
                }`}
              >
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {tag}
              </button>
            ))}
          </div>
          
          <p className="mt-2 text-xs text-secondary-500">
            Selecciona las etiquetas que mejor describan este viaje. Estas etiquetas se mostrarán en la página del viaje.
          </p>
          
          {/* Hidden input for tags */}
          <input type="hidden" {...register('tags')} />
        </div>
        
        {/* Image Upload Section */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-secondary-900">
            Imagen del paquete
          </label>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-secondary-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors">
              <Upload className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-2">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-secondary-500 mb-4">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
          )}
          
          <input
            id="image-upload"
            key={imageInputKey}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          <div className="mt-3 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Resetear el estado de carga antes de abrir el selector
                setIsUploadingImage(false);
                if (uploadTimeoutRef.current) {
                  clearTimeout(uploadTimeoutRef.current);
                  uploadTimeoutRef.current = null;
                }
                document.getElementById('image-upload')?.click();
              }}
              disabled={isUploadingImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingImage ? 'Subiendo...' : 'Seleccionar imagen'}
            </Button>
            
            {imagePreview && (
              <Button
                type="button"
                variant="ghost"
                onClick={removeImage}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar imagen
              </Button>
            )}
          </div>
          
          {errors.image_url && (
            <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
          )}
          
          {/* Hidden input for the actual URL */}
          <input
            type="hidden"
            {...register('image_url', { required: 'La imagen es obligatoria' })}
          />
        </div>
      </div>

      {/* Itinerario */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-secondary-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-950" />
            Itinerario del paquete
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
          {initialData ? 'Actualizar paquete' : 'Crear paquete'}
        </Button>
      </div>
    </form>
  );
}