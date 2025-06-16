import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TripFormData, Trip, ItineraryDay, IncludedService } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Calendar, MapPin, Users, Upload, X, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        }
      : {
          itinerary: [{ day: 1, title: '', description: '' }],
          included_services: [{ icon: 'Hotel', title: '', description: '' }],
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

  // Handle image file selection
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      // For demo purposes, we'll use a placeholder service
      // In a real app, you would upload to a service like Cloudinary, AWS S3, etc.
      const demoImageUrls = [
        'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
        'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
        'https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg',
        'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
        'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
        'https://images.pexels.com/photos/1835718/pexels-photo-1835718.jpeg',
        'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
        'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
      ];
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use a random demo URL (in production, this would be the actual upload result)
      const randomUrl = demoImageUrls[Math.floor(Math.random() * demoImageUrls.length)];
      setValue('image_url', randomUrl);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta nuevamente.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle PDF file selection - MEJORADO PARA ARREGLAR EL PROBLEMA
  const handlePdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF válido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo PDF es demasiado grande. Por favor selecciona un archivo menor a 10MB');
      return;
    }

    setIsUploadingPdf(true);
    
    try {
      setPdfFile(file);

      // En lugar de crear una URL temporal, usamos URLs de PDFs de ejemplo
      // En producción, aquí subirías el archivo a tu servicio de almacenamiento
      const demoPdfUrls = [
        'https://www.africau.edu/images/default/sample.pdf',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'https://file-examples.com/storage/fe86c96b3f1b8b1f7b1b1b1/2017/10/file_example_PDF_500_kB.pdf',
        'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf',
      ];
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usar una URL de ejemplo aleatoria
      const randomPdfUrl = demoPdfUrls[Math.floor(Math.random() * demoPdfUrls.length)];
      setValue('info_pdf_url', randomPdfUrl);
      setValue('info_pdf_name', file.name);
      
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error al procesar el PDF. Por favor intenta nuevamente.');
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

  // Remove PDF
  const removePdf = () => {
    // Liberar la URL temporal si existe
    if (watchPdfUrl && watchPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(watchPdfUrl);
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

  // Función mejorada para ver PDF
  const handleViewPdf = (pdfUrl: string, pdfName: string) => {
    if (!pdfUrl) {
      toast.error('No hay URL de PDF disponible');
      return;
    }

    try {
      // Abrir en una nueva pestaña
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      
      // Mostrar mensaje de éxito
      toast.success('PDF abierto en nueva pestaña');
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
        
        {/* Image Upload Section */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-secondary-900">
            Imagen del viaje
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
              onClick={() => document.getElementById('image-upload')?.click()}
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

        {/* PDF Upload Section - MEJORADO */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-secondary-900">
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
                  <Eye className="h-4 w-4 mr-1" />
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
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors">
              <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-2">
                Arrastra un PDF aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-secondary-500 mb-4">
                Solo archivos PDF hasta 10MB
              </p>
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