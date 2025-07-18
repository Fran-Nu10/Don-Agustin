import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trip, TripFormData, ItineraryDay, IncludedService } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Calendar, MapPin, Users, Upload, X, FileText, Download, Eye, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadPDF, deletePDF, sanitizeFilename } from '../../lib/supabase/storage';
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
  
  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

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
          info_pdf_url: initialData.info_pdf_url,
          info_pdf_name: initialData.info_pdf_name,
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

  const watchPdfUrl = watch('info_pdf_url');
  const watchPdfName = watch('info_pdf_name');

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
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      // Upload to Supabase Storage
      const sanitizedName = sanitizeFilename(file.name);
      const fileName = `trip-images/${Date.now()}-${sanitizedName}`;
      const { data, error } = await supabase.storage
        .from('blog-images') // Mantener 'blog-images' para compatibilidad
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      // Set the image URL in the form
      setValue('image_url', publicUrlData.publicUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen. Por favor intenta nuevamente.');
      
      // No establecer una imagen de fallback automáticamente
      // Permitir al usuario intentar de nuevo o elegir otra imagen
      setIsUploadingImage(false);
      return; // Salir de la función sin establecer la URL de la imagen
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle PDF file selection - UPDATED TO USE SUPABASE STORAGE
  const handlePdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Por favor selecciona un archivo PDF válido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo PDF es demasiado grande. Por favor selecciona un archivo menor a 10MB');
      return;
    }

    setIsUploadingPdf(true);
    setPdfFile(file);
    
    try {
      // Generate a temporary ID if we don't have a trip ID yet
      const tempId = initialData?.id || `temp-${Date.now()}`;
      
      // Upload to Supabase Storage
      const result = await uploadPDF(file, tempId);
      
      if (result) {
        setValue('info_pdf_url', result.url);
        setValue('info_pdf_name', result.name);
        toast.success('PDF subido correctamente');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Error al procesar el PDF. Por favor intenta nuevamente.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setValue('image_url', '');
    
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Remove PDF - UPDATED TO DELETE FROM SUPABASE STORAGE
  const removePdf = async () => {
    const currentPdfUrl = watchPdfUrl;
    
    if (currentPdfUrl) {
      // If it's a Supabase Storage URL, delete it
      if (currentPdfUrl.includes('storage.googleapis.com') || currentPdfUrl.includes('supabase.co')) {
        try {
          const deleted = await deletePDF(currentPdfUrl);
          if (deleted) {
            toast.success('PDF eliminado correctamente');
          }
        } catch (error) {
          console.error('Error deleting PDF from storage:', error);
        }
      }
    }
    
    setPdfFile(null);
    setValue('info_pdf_url', '');
    setValue('info_pdf_name', '');
    
    // Clear the file input
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // View PDF - UPDATED FOR BETTER BROWSER COMPATIBILITY
  const handleViewPdf = (pdfUrl: string, pdfName: string) => {
    if (!pdfUrl) {
      toast.error('No hay URL de PDF disponible');
      return;
    }

    try {
      // Open in a new tab with proper handling
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow) {
        toast.error('El navegador ha bloqueado la apertura del PDF. Por favor, permite las ventanas emergentes para este sitio.');
        
        // Fallback: create a temporary link and click it
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.success('PDF abierto en nueva pestaña');
      }
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      toast.error('No se pudo abrir el PDF. Verifica que la URL sea válida.');
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
               setIsUploadingImage(false); // Resetear el estado de carga si hubo un error previo
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

        {/* PDF Upload Section - UPDATED FOR SUPABASE STORAGE */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-secondary-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            PDF Informativo (Opcional)
          </label>
          
          {watchPdfUrl && watchPdfName ? (
            <div className="bg-white border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{watchPdfName}</p>
                  <p className="text-sm text-green-600">PDF cargado correctamente</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPdf(watchPdfUrl, watchPdfName)}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePdf}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => document.getElementById('pdf-upload')?.click()}
              className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors cursor-pointer"
            >
              <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-2">
                Haz clic para subir un PDF informativo
              </p>
              {isUploadingPdf && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-xs text-primary-600">Subiendo...</span>
                </div>
              )}
            </div>
          )}
          
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfChange}
            className="hidden"
          />
          
          <div className="mt-3 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              disabled={isUploadingPdf}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isUploadingPdf ? 'Procesando PDF...' : 'Seleccionar PDF'}
            </Button>
            
            {watchPdfUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={removePdf}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar PDF
              </Button>
            )}
          </div>
          
          {/* Hidden inputs for PDF data */}
          <input type="hidden" {...register('info_pdf_url')} />
          <input type="hidden" {...register('info_pdf_name')} />
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