import React, { useState } from 'react';
import { Client } from '../../types/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Eye, Calendar, Phone, Mail, MapPin, Download, Tag, AlertTriangle, Clock, Star, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateClientPDF } from '../../utils/pdfGenerator';
import { formatPrice, getTripValueUSD } from '../../utils/currency';

interface ClientsTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  isMultiSelectMode?: boolean;
  selectedClients?: string[];
  onToggleSelection?: (clientId: string) => void;
}

type SortField = 'name' | 'email' | 'scheduled_date' | 'created_at' | 'status' | 'priority' | 'last_contact_date' | 'trip_value';
type SortDirection = 'asc' | 'desc';

export function ClientsTable({ 
  clients, 
  onViewClient, 
  isMultiSelectMode = false, 
  selectedClients = [], 
  onToggleSelection 
}: ClientsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownloadPDF = (client: Client, event: React.MouseEvent) => {
    event.stopPropagation();
    generateClientPDF(client);
  };

  const sortedClients = [...clients].sort((a, b) => {
    let compareA, compareB;

    switch (sortField) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'email':
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
        break;
      case 'scheduled_date':
        compareA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
        compareB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
        break;
      case 'created_at':
        compareA = new Date(a.created_at).getTime();
        compareB = new Date(b.created_at).getTime();
        break;
      case 'status':
        compareA = a.status;
        compareB = b.status;
        break;
      case 'priority':
        const priorityOrder = { 'urgente': 4, 'alta': 3, 'media': 2, 'baja': 1, 'normal': 0 };
        compareA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        compareB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'last_contact_date':
        compareA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
        compareB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
        break;
      case 'trip_value':
        compareA = a.trip_value || 0;
        compareB = b.trip_value || 0;
        break;
      default:
        return 0;
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgente':
        return <AlertTriangle className="h-4 w-4" />;
      case 'alta':
        return <Star className="h-4 w-4" />;
      case 'media':
        return <Clock className="h-4 w-4" />;
      case 'baja':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatScheduledDate = (scheduledDate: string | null | undefined) => {
    if (!scheduledDate) return null;
    
    try {
      const date = new Date(scheduledDate);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return format(date, 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      console.error('Error formatting scheduled date:', error);
      return 'Fecha inválida';
    }
  };

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              {isMultiSelectMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  <span className="sr-only">Seleccionar</span>
                </th>
              )}
              <SortableHeader
                label="Cliente"
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Email"
                field="email"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Teléfono
              </th>
              <SortableHeader
                label="Estado"
                field="status"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Prioridad"
                field="priority"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Destino Preferido
              </th>
              <SortableHeader
                label="Valor del Viaje"
                field="trip_value"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Fecha Agendada"
                field="scheduled_date"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Creado"
                field="created_at"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={isMultiSelectMode ? 11 : 10} className="px-6 py-4 text-center text-secondary-500">
                  No hay clientes para mostrar
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => {
                const formattedScheduledDate = formatScheduledDate(client.scheduled_date);
                const isFollowUpOverdue = isOverdue(client.next_follow_up);
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <tr 
                    key={client.id} 
                    className={`hover:bg-secondary-50 ${isFollowUpOverdue ? 'bg-red-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => onViewClient(client)}
                  >
                    {isMultiSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelection?.(client.id);
                          }}
                          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-950 font-medium text-sm">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {client.name}
                            {client.tags && client.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {client.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {client.tags.length > 2 && (
                                  <span className="text-xs text-secondary-500">+{client.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {client.source && (
                            <div className="text-xs text-secondary-500">
                              Fuente: {client.source}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-secondary-900">
                        <Mail className="h-4 w-4 mr-2 text-secondary-400" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {client.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-secondary-400" />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
                        {getPriorityIcon(client.priority)}
                        <span className="ml-1">{getPriorityLabel(client.priority)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {client.preferred_destination ? (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-secondary-400" />
                          {client.preferred_destination}
                        </div>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {client.trip_value ? (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                          <span className="text-primary-600 font-medium">
                            {formatPrice(client.trip_value, client.trip_value_currency as 'UYU' | 'USD' || 'UYU')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-secondary-300" />
                          <span className="text-secondary-400 italic">Sin valor</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formattedScheduledDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {formattedScheduledDate}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-secondary-300" />
                          <span className="text-secondary-400 italic">Sin agendar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {format(new Date(client.created_at), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewClient(client);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDownloadPDF(client, e)}
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = field === currentField;

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown
          className={`h-4 w-4 transition-colors ${
            isActive
              ? 'text-primary-950'
              : 'text-secondary-400 group-hover:text-secondary-500'
          }`}
        />
      </div>
    </th>
  );
}