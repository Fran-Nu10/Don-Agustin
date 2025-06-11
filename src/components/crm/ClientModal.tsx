import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Client, ClientFormData } from '../../types/client';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { X, Calendar, Phone, Mail, User, MessageSquare, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<ClientFormData>) => Promise<void>;
  isSubmitting: boolean;
}

export function ClientModal({ client, isOpen, onClose, onSave, isSubmitting }: ClientModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
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
      internal_notes: client.internal_notes || '',
      scheduled_date: client.scheduled_date ? client.scheduled_date.split('T')[0] : '',
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
        internal_notes: client.internal_notes || '',
        scheduled_date: client.scheduled_date ? client.scheduled_date.split('T')[0] : '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    try {
      await onSave(client.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
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
      default:
        return status;
    }
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
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </div>
                  
                  {client.scheduled_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary-950 mr-3" />
                      <div>
                        <p className="text-sm text-secondary-500">Fecha Agendada</p>
                        <p className="font-medium text-secondary-900">
                          {format(new Date(client.scheduled_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
              <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Editar Cliente
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
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <Input
                label="Fecha Agendada"
                id="scheduled_date"
                type="datetime-local"
                fullWidth
                error={errors.scheduled_date?.message}
                {...register('scheduled_date')}
              />

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
    </div>
  );
}