import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { BlogFormData } from '../../types/blog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { VisualBlogEditor } from './VisualBlogEditor';
import { Image as ImageIcon, Type, Eye, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { toast } from 'react-hot-toast';

interface BlogFormProps {
  initialData?: BlogFormData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

const BLOG_CATEGORIES = [
  'Consejos',
  'Cultura',
  'Destinos',
  'Experiencias',
  'Rankings',
  'Tips para viajar'
];

export function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const [editorMode, setEditorMode] = useState<'visual' | 'text'>('visual');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: initialData,
  });

  const watchContent = watch('content', '');

  const handleContentChange = (content: string) => {
    setValue('content', content);
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
    setImageFile(file);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Upload to Supabase Storage with enhanced retry logic
      const fileName = `${Date.now()}-${file.name}`;
      
      console.log('🚀 [BLOG IMAGE UPLOAD] Iniciando subida de imagen:', fileName);
      console.log('📁 [BLOG IMAGE UPLOAD] Tamaño del archivo:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Enhanced retry logic
      const uploadResult = await uploadBlogImageWithRetry(file, fileName);
      
      console.log('✅ [BLOG IMAGE UPLOAD] Subida exitosa:', uploadResult.data.path);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(uploadResult.data.path);

      console.log('🔗 [BLOG IMAGE UPLOAD] URL pública generada:', publicUrlData.publicUrl);
      console.log('✅ [BLOG IMAGE UPLOAD] PROCESO COMPLETADO EXITOSAMENTE');
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('❌ [BLOG IMAGE UPLOAD] Error en la subida:', error);
      
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
  };

  // Enhanced blog image upload function with retry logic
  const uploadBlogImageWithRetry = async (file: File, fileName: string, maxRetries: number = 3) => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [BLOG IMAGE UPLOAD] Intento ${attempt}/${maxRetries}`);
        const startTime = Date.now();
        
        // Crear timeout específico para uploads de imágenes del blog (30 segundos)
        const uploadPromise = supabase.storage
          .from('blog-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`⏰ BLOG UPLOAD TIMEOUT: La carga de imagen del blog excedió 30 segundos`));
          }, 60000); // 60 segundos para uploads en Bolt
        });
        
        const result = await Promise.race([uploadPromise, timeoutPromise]);
        
        if (result.error) {
          throw result.error;
        }
        
        const endTime = Date.now();
        console.log(`✅ [BLOG IMAGE UPLOAD] Éxito en intento ${attempt} (${endTime - startTime}ms)`);
        
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ [BLOG IMAGE UPLOAD] Error en intento ${attempt}:`, error);
        
        // Manejo específico para timeouts de upload del blog
        if (error.message?.includes('BLOG UPLOAD TIMEOUT:')) {
          console.error(`⏰ [BLOG IMAGE UPLOAD] Timeout de upload detectado en intento ${attempt}`);
          if (attempt >= maxRetries) {
            console.error(`🚫 [BLOG IMAGE UPLOAD] Máximo de reintentos para timeout de upload alcanzado`);
            break;
          }
        }
        
        // Check if this is a retryable error
        const isRetryable = isBlogImageUploadRetryable(error);
        console.log(`🔍 [BLOG IMAGE UPLOAD] ¿Error reintentable?`, isRetryable);
        
        if (!isRetryable || attempt === maxRetries) {
          console.error(`🚫 [BLOG IMAGE UPLOAD] No se reintentará. Retryable: ${isRetryable}, Intento final: ${attempt === maxRetries}`);
          break;
        }
        
        // Calculate delay with exponential backoff (max 8 seconds for images)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`⏳ [BLOG IMAGE UPLOAD] Esperando ${delay}ms antes del siguiente intento...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error(`💥 [BLOG IMAGE UPLOAD] Todos los intentos fallaron. Error final:`, lastError);
    
    // Manejo específico de errores de timeout para uploads del blog
    if (lastError.message?.includes('BLOG UPLOAD TIMEOUT:')) {
      throw new Error('La carga de la imagen del blog tardó demasiado tiempo. Por favor, verifica tu conexión a internet e intenta con una imagen más pequeña.');
    }
    
    throw lastError;
  };

  // Helper function to determine if a blog image upload error is retryable
  const isBlogImageUploadRetryable = (error: any): boolean => {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.code;
    
    // Blog upload timeout errors - retryable but with limited attempts
    if (message.includes('blog upload timeout:') || message.includes('timeout')) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Título"
        id="title"
        type="text"
        fullWidth
        error={errors.title?.message}
        {...register('title', { required: 'El título es obligatorio' })}
      />

      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary-900">
          Imagen principal
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
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors cursor-pointer"
          >
            <Upload className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-2">
              Haz clic para subir una imagen o arrastra y suelta aquí
            </p>
            <p className="text-xs text-secondary-500 mb-4">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
         key={imageInputKey}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
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

      <Textarea
        label="Resumen"
        id="excerpt"
        rows={3}
        fullWidth
        error={errors.excerpt?.message}
        {...register('excerpt', { required: 'El resumen es obligatorio' })}
      />

      {/* Content Editor with Mode Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-secondary-900">
            Contenido
          </label>
          
          <div className="flex items-center bg-secondary-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setEditorMode('visual')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'visual'
                  ? 'bg-white text-primary-950 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Visual
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('text')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'text'
                  ? 'bg-white text-primary-950 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Type className="h-4 w-4 mr-2" />
              Texto
            </button>
          </div>
        </div>

        {editorMode === 'visual' ? (
          <VisualBlogEditor
            content={watchContent}
            onChange={handleContentChange}
          />
        ) : (
          <Textarea
            id="content"
            rows={20}
            fullWidth
            error={errors.content?.message}
            {...register('content', { required: 'El contenido es obligatorio' })}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Selector */}
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-900">
            Categoría
          </label>
          <select
            {...register('category', { required: 'La categoría es obligatoria' })}
            className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar categoría</option>
            {BLOG_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Status Selector */}
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-900">
            Estado
          </label>
          <select
            {...register('status')}
            className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-secondary-50 p-6 rounded-lg">
        <h4 className="font-medium text-secondary-900 mb-3 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Consejos para escribir
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
          <div>
            <h5 className="font-medium text-secondary-800 mb-2">Editor Visual:</h5>
            <ul className="space-y-1">
              <li>• Arrastra imágenes directamente al contenido</li>
              <li>• Haz clic en una imagen para seleccionarla</li>
              <li>• Redimensiona arrastrando desde la esquina</li>
              <li>• Mueve imágenes con el ícono azul</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-secondary-800 mb-2">Formato de texto:</h5>
            <ul className="space-y-1">
              <li>• Usa "## " para títulos principales</li>
              <li>• Usa "### " para subtítulos</li>
              <li>• Separa párrafos con líneas en blanco</li>
              <li>• Mantén un tono conversacional y amigable</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" isLoading={isSubmitting} size="lg">
          {initialData ? 'Actualizar artículo' : 'Crear artículo'}
        </Button>
      </div>
    </form>
  );
}