import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trip, TripFormData, ItineraryDay, IncludedService } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Calendar, MapPin, Users, Upload, X, Tag, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';
import { sanitizeFilename } from '../../lib/supabase/storage';
import { uploadPDF, deletePDF } from '../../lib/supabase/storage';

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

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{url: string, name: string} | null>(
    initialData?.info_pdf_url && initialData?.info_pdf_name 
      ? { url: initialData.info_pdf_url, name: initialData.info_pdf_name }
      : null
  );
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfInputKey, setPdfInputKey] = useState(0);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

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
          currency_type: initialData.currency_type,
          departure_date: initialData.departure_date.split('T')[0],
          return_date: initialData.return_date.split('T')[0],
          available_spots: initialData.available_spots,
          image_url: initialData.image_url,
          category: initialData.category,
          itinerary: initialData.itinerary || [],
          included_services: initialData.included_services || [],
          tags: initialData.tags || [],
          days: initialData.days || 1,
          nights: initialData.nights || 0,
          info_pdf_url: initialData.info_pdf_url || '',
          info_pdf_name: initialData.info_pdf_name || '',
        }
      : {
          itinerary: [],
          included_services: [{ icon: 'Hotel', title: '', description: '' }],
          currency_type: 'UYU' as const,
          tags: [],
          days: 1,
          nights: 0,
          info_pdf_url: '',
          info_pdf_name: '',
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

  // Update form when PDF info changes
  useEffect(() => {
    if (pdfInfo) {
      setValue('info_pdf_url', pdfInfo.url);
      setValue('info_pdf_name', pdfInfo.name);
    } else {
      setValue('info_pdf_url', '');
      setValue('info_pdf_name', '');
    }
  }, [pdfInfo, setValue]);
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

  // Handle PDF file selection
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
      toast.error('El archivo es demasiado grande. Por favor selecciona un PDF menor a 10MB');
      return;
    }

    setIsUploadingPdf(true);
    setPdfFile(file);
    
    try {
      console.log('🚀 [PDF UPLOAD] Iniciando subida de PDF:', file.name);
      console.log('📁 [PDF UPLOAD] Tamaño del archivo:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Upload to Supabase Storage
      const uploadResult = await uploadPDF(file, initialData?.id || 'new-trip');
      
      if (uploadResult) {
        console.log('✅ [PDF UPLOAD] Subida exitosa:', uploadResult);
        setPdfInfo(uploadResult);
        toast.success('PDF subido correctamente');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ [PDF UPLOAD] Error en la subida:', error);
      
      // Complete cleanup on error
      setPdfFile(null);
      setPdfInfo(null);
      setPdfInputKey(prev => prev + 1);
      
      toast.error('Error al subir el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Remove PDF
  const removePdf = async () => {
    if (pdfInfo?.url) {
      try {
        // Only try to delete from storage if it's not the initial data
        // (to avoid deleting files when just removing from form)
        if (pdfFile) {
          await deletePDF(pdfInfo.url);
        }
      } catch (error) {
        console.warn('Could not delete PDF from storage:', error);
      }
    }
    
    setPdfFile(null);
    setPdfInfo(null);
    setPdfInputKey(prev => prev + 1);
  };

  // View PDF
  const handleViewPdf = () => {
    if (!pdfInfo?.url) return;
    
    try {
      window.open(pdfInfo.url, '_blank');
      toast.success('PDF abierto en nueva pestaña');
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      toast.error('No se pudo abrir el PDF');
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!pdfInfo?.url || !pdfInfo?.name) return;
    
    try {
      const link = document.createElement('a');
      link.href = pdfInfo.url;
      link.download = pdfInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      toast.error('No se pudo descargar el PDF');
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

      // Upload to Supabase Storage with enhanced retry logic
      const sanitizedName = sanitizeFilename(file.name);
      const fileName = `trip-images/${Date.now()}-${sanitizedName}`;
      
      console.log('🚀 [IMAGE UPLOAD] Iniciando subida de imagen:', fileName);
      console.log('📁 [IMAGE UPLOAD] Tamaño del archivo:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Enhanced retry logic with better error handling
      const uploadResult = await uploadImageWithRetry(file, fileName);
      
      console.log('✅ [IMAGE UPLOAD] Subida exitosa:', uploadResult.data.path);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(uploadResult.data.path);

      console.log('🔗 [IMAGE UPLOAD] URL pública generada:', publicUrlData.publicUrl);

      // Set the image URL in the form
      setValue('image_url', publicUrlData.publicUrl);
      
      console.log('✅ [IMAGE UPLOAD] PROCESO COMPLETADO EXITOSAMENTE');
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('❌ [IMAGE UPLOAD] Error en la subida:', error);
      
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
          toast.error('Error al subir la imagen. Por favor, inténtalo de nuevo.');
        }
      } else {
        toast.error('Error al subir la imagen. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Enhanced image upload function with retry logic
  const uploadImageWithRetry = async (file: File, fileName: string, maxRetries: number = 3) => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [IMAGE UPLOAD] Intento ${attempt}/${maxRetries}`);
        const startTime = Date.now();
        
        // Crear timeout específico para uploads de imágenes (30 segundos)
        const uploadPromise = supabase.storage
          .from('blog-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`⏰ UPLOAD TIMEOUT: La carga de imagen excedió 30 segundos`));
          }, 60000); // 60 segundos para uploads en Bolt
        });
        
        const result = await Promise.race([uploadPromise, timeoutPromise]);
        
        if (result.error) {
          throw result.error;
        }
        
        const endTime = Date.now();
        console.log(`✅ [IMAGE UPLOAD] Éxito en intento ${attempt} (${endTime - startTime}ms)`);
        
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ [IMAGE UPLOAD] Error en intento ${attempt}:`, error);
        
        // Manejo específico para timeouts de upload
        if (error.message?.includes('UPLOAD TIMEOUT:')) {
          console.error(`⏰ [IMAGE UPLOAD] Timeout de upload detectado en intento ${attempt}`);
          if (attempt >= maxRetries) {
            console.error(`🚫 [IMAGE UPLOAD] Máximo de reintentos para timeout de upload alcanzado`);
            break;
          }
        }
        
        // Check if this is a retryable error
        const isRetryable = isImageUploadRetryable(error);
        console.log(`🔍 [IMAGE UPLOAD] ¿Error reintentable?`, isRetryable);
        
        if (!isRetryable || attempt === maxRetries) {
          console.error(`🚫 [IMAGE UPLOAD] No se reintentará. Retryable: ${isRetryable}, Intento final: ${attempt === maxRetries}`);
          break;
        }
        
        // Calculate delay with exponential backoff (max 8 seconds for images)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`⏳ [IMAGE UPLOAD] Esperando ${delay}ms antes del siguiente intento...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error(`💥 [IMAGE UPLOAD] Todos los intentos fallaron. Error final:`, lastError);
    
    // Manejo específico de errores de timeout para uploads
    if (lastError.message?.includes('UPLOAD TIMEOUT:')) {
      throw new Error('La carga de la imagen tardó demasiado tiempo. Por favor, verifica tu conexión a internet e intenta con una imagen más pequeña.');
    }
    
    throw lastError;
  };

  // Helper function to determine if an image upload error is retryable
  const isImageUploadRetryable = (error: any): boolean => {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.code;
    
    // Upload timeout errors - retryable but with limited attempts
    if (message.includes('upload timeout:') || message.includes('timeout')) {
      return true;
    }
    
    // Network errors - always retryable
    if (message.includes('failed to fetch') || 
        message.includes('network error') || 
        message.includes('connection') ||
        message.includes('fetch')) {
      return true;
    }
    
    // Retryable status codes for file uploads
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524];
    if (retryableStatusCodes.includes(status)) {
      return true;
    }
    
    // Non-retryable errors
    const nonRetryableStatusCodes = [400, 401, 403, 404, 409, 413, 422];
    if (nonRetryableStatusCodes.includes(status)) {
      return false;
    }
    
    // File size errors - not retryable
    if (message.includes('too large') || message.includes('413') || message.includes('payload')) {
      return false;
    }
    
    // Auth errors - not retryable
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return false;
    }
    
    // Default to retryable for unknown errors
    return true;
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
    console.log('🚀 [TRIP FORM] handleFormSubmit ejecutado');
    console.log('📋 [TRIP FORM] Datos del formulario:', data);
    console.log('🔍 [TRIP FORM] Validando que onSubmit existe:', typeof onSubmit);
    
    try {
      console.log('✅ [TRIP FORM] Llamando a onSubmit...');
      // The price is saved exactly as entered, no conversion needed
      onSubmit(data);
      console.log('✅ [TRIP FORM] onSubmit llamado exitosamente');
    } catch (error) {
      console.error('❌ [TRIP FORM] Error en handleFormSubmit:', error);
    }
  };

  return (
    <div>
      {console.log('🎨 [TRIP FORM] Componente TripForm renderizado')}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {console.log('📝 [TRIP FORM] Formulario renderizado con handleSubmit')}
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
                Precio
              </label>
              <div className="flex">
                <input
                  type="number"
                  min="0"
                 
                  className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-l-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...register('price', { 
                    required: 'El precio es obligatorio',
                    valueAsNumber: true,
                    min: { value: 0, message: 'El precio debe ser mayor a 0' },
                  })}
                />
                <select
                  {...register('currency_type', { required: 'La moneda es obligatoria' })}
                  className="px-3 py-2 bg-white border border-l-0 border-secondary-300 rounded-r-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="UYU">$U (UYU)</option>
                  <option value="USD">$ (USD)</option>
                </select>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
              {errors.currency_type && (
                <p className="mt-1 text-sm text-red-600">{errors.currency_type.message}</p>
              )}
              <p className="text-xs text-secondary-500 mt-1">
                El precio se guardará exactamente como lo ingreses, sin conversiones.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          {/* Duración del paquete - Campos manuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-secondary-900">
                Días del paquete
              </label>
              <input
                type="number"
                min="1"
                max="365"
                className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('days', { 
                  required: 'Los días son obligatorios',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Mínimo 1 día' },
                  max: { value: 365, message: 'Máximo 365 días' },
                })}
              />
              {errors.days && (
                <p className="mt-1 text-sm text-red-600">{errors.days.message}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-secondary-900">
                Noches del paquete
              </label>
              <input
                type="number"
                min="0"
                max="364"
                className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('nights', { 
                  required: 'Las noches son obligatorias',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Mínimo 0 noches' },
                  max: { value: 364, message: 'Máximo 364 noches' },
                })}
              />
              {errors.nights && (
                <p className="mt-1 text-sm text-red-600">{errors.nights.message}</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Ingresa manualmente los días y noches del paquete. 
              Esto te permite tener control total sobre cómo se presenta la duración a los clientes.
            </p>
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
          {/* PDF Upload Section */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-secondary-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Información adicional (PDF opcional)
            </label>
            
            {pdfInfo ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{pdfInfo.name}</p>
                      <p className="text-sm text-green-600">PDF subido correctamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleViewPdf}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removePdf}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => pdfFileInputRef.current?.click()}
                className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors cursor-pointer"
              >
                <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600 mb-2">
                  Haz clic para subir un PDF con información adicional
                </p>
                <p className="text-xs text-secondary-500 mb-4">
                  PDF hasta 10MB (opcional)
                </p>
              </div>
            )}
            
            <input
              ref={pdfFileInputRef}
              key={pdfInputKey}
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
            
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => pdfFileInputRef.current?.click()}
                disabled={isUploadingPdf}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingPdf ? 'Subiendo PDF...' : 'Seleccionar PDF'}
              </Button>
              
              {pdfInfo && (
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
            
            <p className="mt-2 text-xs text-secondary-500">
              El PDF puede contener itinerarios detallados, condiciones, mapas o cualquier información adicional sobre el paquete.
            </p>
            
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
                    {...register(`itinerary.${index}.title`)}
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
    </div>
  );
}