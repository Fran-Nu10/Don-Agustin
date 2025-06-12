import React, { useState } from 'react';
import { Client } from '../../types/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Eye, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

interface ClientsTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
}

type SortField = 'name' | 'email' | 'scheduled_date' | 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

export function ClientsTable({ clients, onViewClient }: ClientsTableProps) {
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
        // Handle null scheduled_date properly
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

  // Helper function to format scheduled date safely
  const formatScheduledDate = (scheduledDate: string | null | undefined) => {
    if (!scheduledDate) return null;
    
    try {
      const date = new Date(scheduledDate);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', scheduledDate);
        return 'Fecha inválida';
      }
      return format(date, 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      console.error('Error formatting scheduled date:', error, 'Date value:', scheduledDate);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
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
                <td colSpan={7} className="px-6 py-4 text-center text-secondary-500">
                  No hay clientes para mostrar
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => {
                const formattedScheduledDate = formatScheduledDate(client.scheduled_date);
                console.log('Client:', client.name, 'Scheduled date raw:', client.scheduled_date, 'Formatted:', formattedScheduledDate);
                
                return (
                  <tr key={client.id} className="hover:bg-secondary-50">
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
                          </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewClient(client)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
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