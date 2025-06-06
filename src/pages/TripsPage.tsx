import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TripCard } from '../components/trips/TripCard';
import { Input } from '../components/ui/Input';
import { Search, MapPin } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';

export function TripsPage() {
  const { trips, loading } = useTrips();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  // Get unique destinations
  const destinations = [...new Set(trips.map((trip) => trip.destination))].sort();

  // Filter trips based on search and destination
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDestination = selectedDestination ? trip.destination === selectedDestination : true;
    
    return matchesSearch && matchesDestination;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-12 main-content">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="font-heading font-bold text-4xl mb-4 text-secondary-900">
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
                <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
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
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
          </div>
          
          {/* Trips Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando viajes...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-secondary-500">No se encontraron viajes que coincidan con tu búsqueda.</p>
              <p className="text-secondary-400 mt-2">Intenta con otros términos o destinos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}