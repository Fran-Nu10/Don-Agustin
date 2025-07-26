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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      setValue('image_url', publicUrlData.publicUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen. Por favor intenta nuevamente.');
      
      // Limpiar la previsualización y el archivo si la carga falla
      setImageFile(null);
      setImagePreview('');
      setValue('image_url', '');
      
      // Limpiar el input de archivo para permitir reselección
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setValue('image_url', '');
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Siempre reiniciar el estado de carga y limpiar el timeout
    setIsUploadingImage(false);
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
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
              onClick={() => {
                // Resetear el estado de carga antes de abrir el selector
                setIsUploadingImage(false);
                if (uploadTimeoutRef.current) {
                  clearTimeout(uploadTimeoutRef.current);
                  uploadTimeoutRef.current = null;
                }
                fileInputRef.current?.click();
              }}
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