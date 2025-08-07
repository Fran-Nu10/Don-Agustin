import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TripCard } from '../components/trips/TripCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, MapPin, AlertCircle, Filter, Calendar, Tag, DollarSign, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';

export function TripsPage() {
  const { trips, loading, error } = useTrips(); // Obtener el estado de error
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 10000});
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [sortBy, setSortBy] = useState<string>('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get search parameters from URL
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const destination = searchParams.get('destination') || '';
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const priceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : 0;
    const priceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : 10000;
    const dateStart = searchParams.get('dateStart') || '';
    const dateEnd = searchParams.get('dateEnd') || '';
    const sort = searchParams.get('sort') || '';
    
    setSearchTerm(keyword);
    setSelectedDestination(destination);
    setSelectedCategory(category);
    setSelectedTags(tags);
    setPriceRange({min: priceMin, max: priceMax});
    setDateRange({start: dateStart, end: dateEnd});
    setSortBy(sort);
    
    // Show filters if any advanced filter is set
    if (category || tags.length > 0 || priceMin > 0 || priceMax < 10000 || dateStart || dateEnd || sort) {
      setShowFilters(true);
    }
  }, [searchParams]);

  // Get unique destinations
  const destinations = [...new Set(trips.map((trip) => trip.destination))].sort();
  
  // Get unique categories
  const categories = [...new Set(trips.map((trip) => trip.category))].sort();
  
  // Get unique tags
  const allTags = [...new Set(trips.flatMap((trip) => trip.tags || []))].sort();
  
  // Get min and max prices (in USD)
  const allPrices = trips.map(trip => Math.floor(trip.price / 40));
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 10000;

  // Update URL with filters
  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('keyword', searchTerm);
    if (selectedDestination) params.set('destination', selectedDestination);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (priceRange.min > 0) params.set('priceMin', priceRange.min.toString());
    if (priceRange.max < 10000) params.set('priceMax', priceRange.max.toString());
    if (dateRange.start) params.set('dateStart', dateRange.start);
    if (dateRange.end) params.set('dateEnd', dateRange.end);
    if (sortBy) params.set('sort', sortBy);
    
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDestination('');
    setSelectedCategory('');
    setSelectedTags([]);
    setPriceRange({min: 0, max: 10000});
    setDateRange({start: '', end: ''});
    setSortBy('');
    setSearchParams(new URLSearchParams());
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Enhanced search function
  const searchTrips = (trips: Trip[]): Trip[] => {
    let filtered = [...trips];

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter((trip) => {
        // Search in multiple fields
        const searchableText = [
          trip.title,
          trip.description,
          trip.destination,
          trip.category
        ].join(' ').toLowerCase();
        
        // Split search term into words for better matching
        const searchWords = searchLower.split(' ').filter(word => word.length > 0);
        
        // Check if all search words are found
        return searchWords.every(word => searchableText.includes(word));
      });
    }
    
    // Filter by destination
    if (selectedDestination) {
      filtered = filtered.filter((trip) => trip.destination === selectedDestination);
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((trip) => trip.category === selectedCategory);
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((trip) => 
        trip.tags && selectedTags.some(tag => trip.tags?.includes(tag))
      );
    }
    
    // Filter by price range (convert from UYU to USD)
    filtered = filtered.filter((trip) => {
      const priceUSD = trip.currency_type === 'USD' ? trip.price : Math.floor(trip.price / 40);
      return priceUSD >= priceRange.min && priceUSD <= priceRange.max;
    });
    
    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter((trip) => 
        new Date(trip.departure_date) >= new Date(dateRange.start)
      );
    }
    
    if (dateRange.end) {
      filtered = filtered.filter((trip) => 
        new Date(trip.departure_date) <= new Date(dateRange.end)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());
          break;
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.departure_date).getTime() - new Date(a.departure_date).getTime());
          break;
        case 'duration-asc':
          filtered.sort((a, b) => {
            const durationA = a.days || ((new Date(a.return_date).getTime() - new Date(a.departure_date).getTime()) / (1000 * 60 * 60 * 24));
            const durationB = b.days || ((new Date(b.return_date).getTime() - new Date(b.departure_date).getTime()) / (1000 * 60 * 60 * 24));
            return durationA - durationB;
          });
          break;
        case 'duration-desc':
          filtered.sort((a, b) => {
            const durationA = a.days || ((new Date(a.return_date).getTime() - new Date(a.departure_date).getTime()) / (1000 * 60 * 60 * 24));
            const durationB = b.days || ((new Date(b.return_date).getTime() - new Date(b.departure_date).getTime()) / (1000 * 60 * 60 * 24));
            return durationB - durationA;
          });
          break;
        case 'spots-asc':
          filtered.sort((a, b) => a.available_spots - b.available_spots);
          break;
        case 'spots-desc':
          filtered.sort((a, b) => b.available_spots - a.available_spots);
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const filteredTrips = searchTrips(trips);

  // Check if we have search criteria
  const hasSearchCriteria = searchTerm.trim() || selectedDestination || selectedCategory || 
    selectedTags.length > 0 || priceRange.min > 0 || priceRange.max < 10000 || 
    dateRange.start || dateRange.end || sortBy;
    
  const hasResults = filteredTrips.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-secondary-50 via-white to-secondary-50 py-12 main-content">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 text-center pt-8">
            <h1 className="font-heading font-bold text-4xl mb-4 text-secondary-900">
              Nuestros Paquetes
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Explora nuestros destinos y encuentra el paquete perfecto para tus próximas vacaciones.
            </p>
          </div>
          
          {/* Basic Filters */}
          <div className="bg-gradient-to-r from-white via-secondary-50/50 to-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-secondary-400" />
                <span className="text-lg font-medium text-secondary-700">Buscar:</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="ml-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400 z-10" />
                <Input
                  placeholder="Buscar por título, destino o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              {/* Destination Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-secondary-400 z-10 pointer-events-none" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none"
                >
                  <option value="">Todos los destinos</option>
                  {destinations.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-lg text-secondary-900">Filtros Avanzados</h3>
                  
                  {hasSearchCriteria && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-secondary-700">
                      Categoría
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none"
                      >
                        <option value="">Todas las categorías</option>
                        <option value="nacional">Nacional</option>
                        <option value="internacional">Internacional</option>
                        <option value="grupal">Grupal</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-secondary-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Rango de Precio (USD)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min || ''}
                        onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                        className="w-full"
                      />
                      <span className="text-secondary-500">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max || ''}
                        onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-secondary-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Fechas de Salida
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        placeholder="Desde"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full"
                      />
                      <span className="text-secondary-500">-</span>
                      <Input
                        type="date"
                        placeholder="Hasta"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Sort By */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-secondary-700">
                      Ordenar por
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none"
                      >
                        <option value="">Relevancia</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                        <option value="date-asc">Fecha: más cercana</option>
                        <option value="date-desc">Fecha: más lejana</option>
                        <option value="duration-asc">Duración: más corta</option>
                        <option value="duration-desc">Duración: más larga</option>
                        <option value="spots-desc">Más cupos disponibles</option>
                        <option value="spots-asc">Menos cupos disponibles</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags Filter */}
                  <div className="md:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-secondary-700 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Etiquetas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-primary-100 text-primary-800 border border-primary-300'
                              : 'bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200'
                          }`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                      {allTags.length === 0 && (
                        <span className="text-secondary-500 text-sm">No hay etiquetas disponibles</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={updateFilters}>
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Results Info */}
          {hasSearchCriteria && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 via-blue-100/30 to-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      {hasResults ? (
                        <>Encontramos {filteredTrips.length} {filteredTrips.length === 1 ? 'paquete' : 'paquetes'}</>
                      ) : (
                        <>No encontramos paquetes</>
                      )}
                      {searchTerm && (
                        <> para "{searchTerm}"</>
                      )}
                      {selectedDestination && (
                        <> en {selectedDestination}</>
                      )}
                      {selectedCategory && (
                        <> de categoría {selectedCategory}</>
                      )}
                    </p>
                    {!hasResults && (
                      <p className="text-blue-600 text-sm mt-1">
                        Te mostramos todos nuestros paquetes disponibles
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Trips Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
              <p className="text-secondary-500">Cargando paquetes...</p>
            </div>
          ) : error ? ( // Mostrar mensaje de error si existe
            <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl text-red-800 mb-2">
                Error al cargar los paquetes
              </h3>
              <p className="text-red-700 mb-4">
                {error.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
          ) : (
            <>
              {/* Show filtered results or all trips if no results */}
              {hasResults || !hasSearchCriteria ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(hasResults ? filteredTrips : trips).map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                /* No results found - show message and all trips */
                <div className="space-y-8">
                  {/* No results message */}
                  <div className="text-center py-8 bg-gradient-to-r from-orange-50 via-orange-100/30 to-orange-50 rounded-lg shadow-sm border border-orange-200">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-xl text-secondary-900 mb-2">
                      No encontramos paquetes con esas características
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      No hay paquetes que coincidan con tu búsqueda "{searchTerm}"
                      {selectedDestination && ` en ${selectedDestination}`}.
                    </p>
                    <p className="text-secondary-500">
                      Te mostramos todos nuestros paquetes disponibles para que puedas explorar otras opciones.
                    </p>
                  </div>

                  {/* Show all trips */}
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-secondary-900 mb-6 text-center">
                      Todos nuestros paquetes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {trips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}