import React, { useState } from 'react';
import { Quotation } from '../../types/quotation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Eye, Calendar, Phone, Mail, MapPin, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateQuotationPDF } from '../../utils/pdfGenerator';
import { formatPrice } from '../../utils/currency';

interface QuotationsTableProps {
  quotations: Quotation[];
  onViewQuotation: (quotation: Quotation) => void;
}

type SortField = 'name' | 'email' | 'destination' | 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

export function QuotationsTable({ quotations, onViewQuotation }: QuotationsTableProps) {
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

  const handleDownloadPDF = (quotation: Quotation, event: React.MouseEvent) => {
    event.stopPropagation();
    generateQuotationPDF(quotation);
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
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
      case 'destination':
        compareA = (a.destination || '').toLowerCase();
        compareB = (b.destination || '').toLowerCase();
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
              <SortableHeader
                label="Destino"
                field="destination"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Viajeros
              </th>
              <SortableHeader
                label="Estado"
                field="status"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Fecha"
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
            {sortedQuotations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-secondary-500">
                  No hay cotizaciones para mostrar
                </td>
              </tr>
            ) : (
              sortedQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-950 font-medium text-sm">
                            {quotation.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-secondary-900">
                          {quotation.name}
                        </div>
                        {quotation.phone && (
                          <div className="text-sm text-secondary-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {quotation.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-secondary-900">
                      <Mail className="h-4 w-4 mr-2 text-secondary-400" />
                      {quotation.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {quotation.destination ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-secondary-400" />
                        {quotation.destination}
                      </div>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <div className="flex items-center space-x-1">
                      <span>{quotation.adults} adultos</span>
                      {quotation.children > 0 && (
                        <span>, {quotation.children} niños</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                      {getStatusLabel(quotation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-secondary-400" />
                      {format(new Date(quotation.created_at), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewQuotation(quotation)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDownloadPDF(quotation, e)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
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