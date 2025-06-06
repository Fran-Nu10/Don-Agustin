import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { BlogFormData } from '../../types/blog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

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
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Process uploaded files
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, imageUrl]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Insert image into content
  const insertImageIntoContent = (imageUrl: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = watchContent;
    
    const imageMarkdown = `\n![Imagen](${imageUrl})\n`;
    const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);
    
    setValue('content', newContent);
    
    // Set cursor position after the inserted image
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
    }, 0);
  };

  // Remove uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
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

      <Input
        label="URL de la imagen principal"
        id="image_url"
        type="text"
        fullWidth
        error={errors.image_url?.message}
        {...register('image_url', { required: 'La URL de la imagen es obligatoria' })}
      />

      <Textarea
        label="Resumen"
        id="excerpt"
        rows={3}
        fullWidth
        error={errors.excerpt?.message}
        {...register('excerpt', { required: 'El resumen es obligatorio' })}
      />

      {/* Content with Image Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-secondary-900">
          Contenido
        </label>
        
        {/* Image Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-secondary-300 hover:border-secondary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-secondary-400 mb-2" />
            <p className="text-secondary-600 mb-2">
              Arrastra imágenes aquí o{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-primary-950 hover:underline"
              >
                selecciona archivos
              </button>
            </p>
            <p className="text-xs text-secondary-500">
              Las imágenes se insertarán en el contenido donde esté el cursor
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-secondary-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      type="button"
                      onClick={() => insertImageIntoContent(imageUrl)}
                      className="bg-primary-950 text-white p-2 rounded-full hover:bg-primary-800 transition-colors"
                      title="Insertar en contenido"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Textarea
          ref={contentTextareaRef}
          id="content"
          rows={20}
          fullWidth
          error={errors.content?.message}
          {...register('content', { required: 'El contenido es obligatorio' })}
        />
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
          <ImageIcon className="h-5 w-5 mr-2" />
          Consejos para escribir
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
          <div>
            <h5 className="font-medium text-secondary-800 mb-2">Formato de texto:</h5>
            <ul className="space-y-1">
              <li>• Usa "## " para títulos principales</li>
              <li>• Usa "### " para subtítulos</li>
              <li>• Separa párrafos con líneas en blanco</li>
              <li>• Mantén un tono conversacional y amigable</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-secondary-800 mb-2">Imágenes:</h5>
            <ul className="space-y-1">
              <li>• Arrastra imágenes al área de carga</li>
              <li>• Haz clic en "+" para insertar en el contenido</li>
              <li>• Las imágenes se insertan donde esté el cursor</li>
              <li>• Incluye consejos prácticos y experiencias</li>
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