import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { BlogFormData } from '../../types/blog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { VisualBlogEditor } from './VisualBlogEditor';
import { Image as ImageIcon, Type, Eye } from 'lucide-react';

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