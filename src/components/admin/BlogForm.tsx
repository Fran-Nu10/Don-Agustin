import React from 'react';
import { useForm } from 'react-hook-form';
import { BlogFormData } from '../../types/blog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface BlogFormProps {
  initialData?: BlogFormData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Título"
        id="title"
        type="text"
        fullWidth
        error={errors.title?.message}
        {...register('title', { required: 'El título es obligatorio' })}
      />

      <Input
        label="URL de la imagen"
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

      <Textarea
        label="Contenido"
        id="content"
        rows={10}
        fullWidth
        error={errors.content?.message}
        {...register('content', { required: 'El contenido es obligatorio' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Categoría"
          id="category"
          type="text"
          fullWidth
          error={errors.category?.message}
          {...register('category', { required: 'La categoría es obligatoria' })}
        />

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

      <div className="pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Actualizar artículo' : 'Crear artículo'}
        </Button>
      </div>
    </form>
  );
}