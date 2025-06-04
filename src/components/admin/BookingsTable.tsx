import React, { useState } from 'react';
import { Booking } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';

interface BookingsTableProps {
  bookings: Booking[];
}

type SortField = 'name' | 'trip' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function BookingsTable({ bookings }: BookingsTableProps) {
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

  const sortedBookings = [...bookings].sort((a, b) => {
    let compareA, compareB;

    switch (sortField) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'trip':
        compareA = a.trip?.title.toLowerCase() || '';
        compareB = b.trip?.title.toLowerCase() || '';
        break;
      case 'created_at':
        compareA = new Date(a.created_at).getTime();
        compareB = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <SortableHeader
                label="Nombre"
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Viaje"
                field="trip"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Contacto
              </th>
              <SortableHeader
                label="Fecha de reserva"
                field="created_at"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {sortedBookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-secondary-500">
                  No hay reservas para mostrar
                </td>
              </tr>
            ) : (
              sortedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {booking.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {booking.trip?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <div>{booking.email}</div>
                    <div>{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm', {
                      locale: es,
                    })}
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