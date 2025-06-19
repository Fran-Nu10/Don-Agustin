import React from 'react';
import { ClientFilters } from '../../types/client';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, Filter, X, Calendar, MapPin, Tag, DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: ClientFilters;
  onFilterChange: (field: keyof ClientFilters, value: any) => void;
  onClearFilters: () => void;
  destinations: string[];
  availableTags: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  destinations,
  availableTags 
}: AdvancedFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return value !== '';
    if (typeof value === 'object' && value !== null) {
      if ('start' in value && 'end' in value) {
        return value.start !== '' || value.end !== '';
      }
      if (Array.isArray(value)) return value.length > 0;
    }
    return false;
  });

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFilterChange('tags', newTags);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-secondary-400" />
          <h3 className="text-lg font-semibold text-secondary-900">Filtros Avanzados</h3>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search by name/email */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={filters.name}
            onChange={(e) => onFilterChange('name', e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="block w-full pl-10 pr-8 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            <option value="">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="presupuesto_enviado">Presupuesto Enviado</option>
            <option value="en_seguimiento">En Seguimiento</option>
            <option value="cliente_cerrado">Cliente Cerrado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="cliente_perdido">Cliente Perdido</option>
            <option value="seguimientos_proximos">Seguimientos Próximos</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="relative">
          <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="block w-full pl-10 pr-8 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        {/* Destination filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
          <select
            value={filters.destination}
            onChange={(e) => onFilterChange('destination', e.target.value)}
            className="block w-full pl-10 pr-8 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            <option value="">Todos los destinos</option>
            {destinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date range filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Fecha de creación (desde)
          </label>
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Fecha de creación (hasta)
          </label>
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            fullWidth
          />
        </div>
      </div>

      {/* Tags filter */}
      {availableTags.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Etiquetas
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.tags?.includes(tag)
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200'
                }`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}