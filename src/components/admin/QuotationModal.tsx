import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Quotation, QuotationFormData } from '../../types/quotation';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { X, Calendar, Phone, Mail, User, MapPin, Users, MessageSquare, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '../../utils/currency';

interface QuotationModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<QuotationFormData>) => Promise<void>;
  isSubmitting: boolean;
}

export function QuotationModal({ quotation, isOpen, onClose, onSave, isSubmitting }: QuotationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormData>({
    defaultValues: quotation ? {
      name: quotation.name,
      email: quotation.email,
      phone: quotation.phone || '',
      destination: quotation.destination || '',
      departure_date: quotation.departure_date || '',
      return_date: quotation.return_date || '',
      department: quotation.department || '',
      flexible_dates: quotation.flexible_dates,
      adults: quotation.adults,
      children: quotation.children,
      observations: quotation.observations || '',
      status: quotation.status,
    } : undefined,
  });

  useEffect(() => {
    if (quotation) {
      reset({
        name: quotation.name,
        email: quotation.email,
        phone: quotation.phone || '',
        destination: quotation.destination || '',
        departure_date: quotation.departure_date || '',
        return_date: quotation.return_date || '',
        department: quotation.department || '',
        flexible_dates: quotation.flexible_dates,
        adults: quotation.adults,
        children: quotation.children,
        observations: quotation.observations || '',
        status: quotation.status,
      });
    }
  }, [quotation, reset]);

  const onSubmit = async (data: QuotationFormData) => {
    if (!quotation) return;
    
    try {
      await onSave(quotation.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating quotation:', error);
    }
  };

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Quotation['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'quoted':
        return 'Cotizado';
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  };

  // Format price with correct currency
  const getFormattedPrice = (price?: number, currency?: string) => {
    if (!price) return 'No especificado';
    return formatPrice(price, currency as 'UYU' | 'USD' || 'UYU');
  };

  if (!isOpen || !quotation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              Cotización #{quotation.id.slice(0, 8)}
            </h2>
            <p className="text-secondary-500 text-sm">
              Creada el {format(new Date(quotation.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-8">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                    {getStatusLabel(quotation.status)}
                  </span>
                </div>
              </div>

              {/* Trip Info (if available) */}
              {quotation.trip_id && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-heading font-bold text-lg text-secondary-900 mb-2 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-blue-600" />
                    Información del Viaje Cotizado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">Viaje</p>
                      <p className="font-medium text-secondary-900">{quotation.trip_title || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Destino</p>
                      <p className="font-medium text-secondary-900">{quotation.trip_destination || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Precio</p>
                      <p className="font-medium text-secondary-900">
                        {getFormattedPrice(quotation.trip_price, quotation.trip_price_currency)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Info */}
              <div>
                <h3 className="font-heading font-bold text-lg text-secondary-900 mb-4">
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Nombre</p>
                      <p className="font-medium text-secondary-900">{quotation.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Email</p>
                      <p className="font-medium text-secondary-900">{quotation.email}</p>
                    </div>
                  </div>
                  
                  {quotation.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Teléfono</p>
                        <p className="font-medium text-secondary-900">{quotation.phone}</p>
                      </div>
                    </div>
                  )}

                  {quotation.department && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Departamento</p>
                        <p className="font-medium text-secondary-900">{quotation.department}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Info */}
              <div>
                <h3 className="font-heading font-bold text-lg text-secondary-900 mb-4">
                  Información del Viaje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quotation.destination && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Destino</p>
                        <p className="font-medium text-secondary-900">{quotation.destination}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Viajeros</p>
                      <p className="font-medium text-secondary-900">
                        {quotation.adults} adultos{quotation.children > 0 && `, ${quotation.children} niños`}
                      </p>
                    </div>
                  </div>

                  {quotation.departure_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Fecha de salida</p>
                        <p className="font-medium text-secondary-900">
                          {format(new Date(quotation.departure_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}

                  {quotation.return_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Fecha de regreso</p>
                        <p className="font-medium text-secondary-900">
                          {format(new Date(quotation.return_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}

                  {quotation.flexible_dates && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-secondary-500">Fechas flexibles</p>
                      <p className="font-medium text-green-600">Sí</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observations */}
              {quotation.observations && (
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-primary-950 mr-2" />
                    <p className="text-sm font-medium text-secondary-500">Observaciones</p>
                  </div>
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <p className="text-secondary-700">{quotation.observations}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Editar Cotización
                </Button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  id="name"
                  type="text"
                  fullWidth
                  error={errors.name?.message}
                  {...register('name', { required: 'El nombre es obligatorio' })}
                />
                
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  fullWidth
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  id="phone"
                  type="tel"
                  fullWidth
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                
                <Input
                  label="Destino"
                  id="destination"
                  type="text"
                  fullWidth
                  error={errors.destination?.message}
                  {...register('destination')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fecha de salida"
                  id="departure_date"
                  type="date"
                  fullWidth
                  error={errors.departure_date?.message}
                  {...register('departure_date')}
                />
                
                <Input
                  label="Fecha de regreso"
                  id="return_date"
                  type="date"
                  fullWidth
                  error={errors.return_date?.message}
                  {...register('return_date')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Adultos
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('adults', { 
                      required: 'Número de adultos es obligatorio',
                      valueAsNumber: true,
                    })}
                    className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.adults && (
                    <p className="mt-1 text-sm text-red-600">{errors.adults.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Niños
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('children', { valueAsNumber: true })}
                    className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.children && (
                    <p className="mt-1 text-sm text-red-600">{errors.children.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-secondary-900">
                  Estado
                </label>
                <select
                  {...register('status')}
                  className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="quoted">Cotizado</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>

              <Textarea
                label="Observaciones"
                id="observations"
                rows={4}
                fullWidth
                error={errors.observations?.message}
                {...register('observations')}
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}