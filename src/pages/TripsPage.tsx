import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TripCard } from '../components/trips/TripCard';
import { Input } from '../components/ui/Input';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';

export function TripsPage() {
  const { trips, loading } = useTrips();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get search parameters from URL
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const destination = searchParams.get('destination') || '';
    
    setSearchTerm(keyword);
    setSelectedDestination(destination);
  }, [searchParams]);

  // Get unique destinations
  const destinations = [...new Set(trips.map((trip) => trip.destination))].sort();

  // Enhanced search function
  const searchTrips = (trips: Trip[], searchTerm: string, selectedDestination: string) => {
    let filtered = trips;

    // Filter by destination first
    if (selectedDestination) {
      filtered = filtered.filter((trip) => trip.destination === selectedDestination);
    }

    // Then filter by search term if provided
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

    return filtered;
  };

  const filteredTrips = searchTrips(trips, searchTerm, selectedDestination);

  // Check if we have search criteria
  const hasSearchCriteria = searchTerm.trim() || selectedDestination;
  const hasResults = filteredTrips.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-12 main-content">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-10 text-center pt-12">
            <h1 className="font-heading font-bold text-4xl mb-6 text-secondary-900">
              Nuestros Viajes
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Explora nuestros destinos y encuentra el viaje perfecto para tus próximas vacaciones.
            </p>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
          </div>
          
          {/* Search Results Info */}
          {hasSearchCriteria && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      {hasResults ? (
                        <>Encontramos {filteredTrips.length} {filteredTrips.length === 1 ? 'viaje' : 'viajes'}</>
                      ) : (
                        <>No encontramos viajes</>
                      )}
                      {searchTerm && (
                        <> para "{searchTerm}"</>
                      )}
                      {selectedDestination && (
                        <> en {selectedDestination}</>
                      )}
                    </p>
                    {!hasResults && (
                      <p className="text-blue-600 text-sm mt-1">
                        Te mostramos todos nuestros viajes disponibles
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
              <p className="text-secondary-500">Cargando viajes...</p>
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
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-orange-200">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-xl text-secondary-900 mb-2">
                      No encontramos viajes con esas características
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      No hay viajes que coincidan con tu búsqueda "{searchTerm}"
                      {selectedDestination && ` en ${selectedDestination}`}.
                    </p>
                    <p className="text-secondary-500">
                      Te mostramos todos nuestros viajes disponibles para que puedas explorar otras opciones.
                    </p>
                  </div>

                  {/* Show all trips */}
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-secondary-900 mb-6 text-center">
                      Todos nuestros viajes
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