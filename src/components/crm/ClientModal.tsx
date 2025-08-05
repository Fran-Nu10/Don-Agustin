import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Client, ClientFormData } from '../../types/client';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { X, Calendar, Phone, Mail, User, MessageSquare, FileText, AlertCircle, Trash2, DollarSign, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '../../utils/currency';

interface ClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<ClientFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ClientModal({ client, isOpen, onClose, onSave, onDelete, isSubmitting }: ClientModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: client ? {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      message: client.message || '',
      status: client.status,
      priority: client.priority || 'normal',
      internal_notes: client.internal_notes || '',
      scheduled_date: client.scheduled_date ? 
        // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
        format(new Date(client.scheduled_date), "yyyy-MM-dd'T'HH:mm") : '',
      trip_value: client.trip_value || 0,
      preferred_destination: client.preferred_destination || '',
      last_booked_trip_id: client.last_booked_trip_id || '',
      last_booked_trip_title: client.last_booked_trip_title || '',
      last_booked_trip_destination: client.last_booked_trip_destination || '',
      last_booked_trip_date: client.last_booked_trip_date ? 
        format(new Date(client.last_booked_trip_date), "yyyy-MM-dd'T'HH:mm") : '',
    } : undefined,
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        message: client.message || '',
        status: client.status,
        priority: client.priority || 'normal',
        internal_notes: client.internal_notes || '',
        scheduled_date: client.scheduled_date ? 
          // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
          format(new Date(client.scheduled_date), "yyyy-MM-dd'T'HH:mm") : '',
        trip_value: client.trip_value || 0,
        preferred_destination: client.preferred_destination || '',
        last_booked_trip_id: client.last_booked_trip_id || '',
        last_booked_trip_title: client.last_booked_trip_title || '',
        last_booked_trip_destination: client.last_booked_trip_destination || '',
        last_booked_trip_date: client.last_booked_trip_date ? 
          format(new Date(client.last_booked_trip_date), "yyyy-MM-dd'T'HH:mm") : '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    try {
      // Convert scheduled_date back to ISO string if provided
      const submitData = {
        ...data,
        scheduled_date: data.scheduled_date ? 
          new Date(data.scheduled_date).toISOString() : null,
        last_booked_trip_date: data.last_booked_trip_date ? 
          new Date(data.last_booked_trip_date).toISOString() : null,
      };
      
      await onSave(client.id, submitData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    
    try {
      setIsDeleting(true);
      await onDelete(client.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800';
      case 'presupuesto_enviado':
        return 'bg-purple-100 text-purple-800';
      case 'en_seguimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'cliente_cerrado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-orange-100 text-orange-800';
      case 'cliente_perdido':
        return 'bg-red-100 text-red-800';
      case 'seguimientos_proximos':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case 'nuevo':
        return 'Nuevo';
      case 'presupuesto_enviado':
        return 'Presupuesto Enviado';
      case 'en_seguimiento':
        return 'En Seguimiento';
      case 'cliente_cerrado':
        return 'Cliente Cerrado';
      case 'en_proceso':
        return 'En Proceso';
      case 'cliente_perdido':
        return 'Cliente Perdido';
      case 'seguimientos_proximos':
        return 'Seguimientos Próximos';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente';
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  // Helper function to format scheduled date safely
  const formatScheduledDate = (scheduledDate: string | null | undefined) => {
    if (!scheduledDate) return null;
    
    try {
      const date = new Date(scheduledDate);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return format(date, 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      console.error('Error formatting scheduled date:', error);
      return 'Fecha inválida';
    }
  };

  // Format trip value with correct currency
  const getFormattedTripValue = (value?: number, currency?: string) => {
    if (!value) return 'Sin valor asignado';
    return formatPrice(value, currency as 'UYU' | 'USD' || 'UYU');
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              Detalles del Cliente
            </h2>
            <p className="text-secondary-500 text-sm">
              Creado el {format(new Date(client.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
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
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Nombre</p>
                      <p className="font-medium text-secondary-900">{client.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Email</p>
                      <p className="font-medium text-secondary-900">{client.email}</p>
                    </div>
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Teléfono</p>
                        <p className="font-medium text-secondary-900">{client.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Valor del viaje - Now in USD */}
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary-950 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-500">Valor del viaje</p>
                      <p className="font-medium text-secondary-900">
                        {getFormattedTripValue(client.trip_value, client.trip_value_currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Prioridad</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(client.priority)}`}>
                      {getPriorityLabel(client.priority)}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary-950 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-secondary-500">Fecha Agendada</p>
                      {client.scheduled_date ? (
                        <p className="font-medium text-green-600">
                          {formatScheduledDate(client.scheduled_date)}
                        </p>
                      ) : (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                          <p className="text-orange-600 italic text-sm">Sin fecha agendada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Information */}
              {client.last_booked_trip_title && (
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-primary-950 mr-2" />
                    <p className="text-sm font-medium text-secondary-500">Último Viaje Reservado</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">{client.last_booked_trip_title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p className="text-blue-700">
                        <strong>Destino:</strong> {client.last_booked_trip_destination}
                      </p>
                      {client.last_booked_trip_date && (
                        <p className="text-blue-700">
                          <strong>Fecha:</strong> {format(new Date(client.last_booked_trip_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {client.message && (
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-primary-950 mr-2" />
                    <p className="text-sm font-medium text-secondary-500">Mensaje del Cliente</p>
                  </div>
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <p className="text-secondary-700">{client.message}</p>
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-primary-950 mr-2" />
                  <p className="text-sm font-medium text-secondary-500">Notas Internas</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg min-h-[100px]">
                  {client.internal_notes ? (
                    <p className="text-secondary-700">{client.internal_notes}</p>
                  ) : (
                    <p className="text-secondary-400 italic">Sin notas internas</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Cliente
                </Button>
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    Editar Cliente
                  </Button>
                </div>
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
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Estado
                  </label>
                  <select
                    {...register('status', { required: 'El estado es obligatorio' })}
                    className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="presupuesto_enviado">Presupuesto Enviado</option>
                    <option value="en_seguimiento">En Seguimiento</option>
                    <option value="cliente_cerrado">Cliente Cerrado</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="cliente_perdido">Cliente Perdido</option>
                    <option value="seguimientos_proximos">Seguimientos Próximos</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Prioridad
                  </label>
                  <select
                    {...register('priority')}
                    className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Fecha Agendada (opcional)"
                    id="scheduled_date"
                    type="datetime-local"
                    fullWidth
                    error={errors.scheduled_date?.message}
                    {...register('scheduled_date')}
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Esta fecha es para uso interno del CRM. Los clientes que hacen reservas públicas no tienen fecha agendada automáticamente.
                  </p>
                </div>
              </div>

              {/* Destino preferido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Destino preferido"
                  id="preferred_destination"
                  type="text"
                  fullWidth
                  error={errors.preferred_destination?.message}
                  {...register('preferred_destination')}
                />

                {/* Valor del viaje - Now in USD */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-secondary-900">
                    Valor del viaje
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="block w-full pl-10 pr-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      {...register('trip_value', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'El valor no puede ser negativo' },
                      })}
                    />
                  </div>
                  {errors.trip_value && (
                    <p className="mt-1 text-sm text-red-600">{errors.trip_value.message}</p>
                  )}
                  <p className="text-xs text-secondary-500 mt-1">
                    Ingrese el valor del viaje en la moneda que corresponda.
                  </p>
                </div>
              </div>

              {/* Información del último viaje reservado */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-3">Información del último viaje reservado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Título del viaje"
                    id="last_booked_trip_title"
                    type="text"
                    fullWidth
                    {...register('last_booked_trip_title')}
                  />
                  
                  <Input
                    label="Destino del viaje"
                    id="last_booked_trip_destination"
                    type="text"
                    fullWidth
                    {...register('last_booked_trip_destination')}
                  />
                  
                  <Input
                    label="Fecha del viaje"
                    id="last_booked_trip_date"
                    type="datetime-local"
                    fullWidth
                    {...register('last_booked_trip_date')}
                  />
                  
                  <Input
                    label="ID del viaje"
                    id="last_booked_trip_id"
                    type="text"
                    fullWidth
                    {...register('last_booked_trip_id')}
                  />
                </div>
              </div>

              <Textarea
                label="Mensaje del Cliente"
                id="message"
                rows={3}
                fullWidth
                error={errors.message?.message}
                {...register('message')}
              />

              <Textarea
                label="Notas Internas"
                id="internal_notes"
                rows={4}
                fullWidth
                error={errors.internal_notes?.message}
                {...register('internal_notes')}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-secondary-900">
                  Eliminar Cliente
                </h3>
                <p className="text-secondary-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-secondary-700 mb-6">
              ¿Estás seguro de que deseas eliminar a <strong>{client.name}</strong>? 
              Se perderán todos los datos asociados a este cliente.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}