import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { TripCard } from '../../components/trips/TripCard';
import { TripForm } from '../../components/admin/TripForm';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Trip, TripFormData } from '../../types';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      const tripsData = await getTrips();
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Error al cargar los viajes');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTrip = async (data: TripFormData) => {
    try {
      setIsSubmitting(true);
      await createTrip(data);
      await loadTrips();
      setShowForm(false);
      toast.success('Viaje creado con éxito');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Error al crear el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTrip = async (data: TripFormData) => {
    if (!editingTrip) return;
    
    try {
      setIsSubmitting(true);
      await updateTrip(editingTrip.id, data);
      await loadTrips();
      setEditingTrip(null);
      toast.success('Viaje actualizado con éxito');
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Error al actualizar el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteTrip(id);
      await loadTrips();
      toast.success('Viaje eliminado con éxito');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Error al eliminar el viaje');
    }
  };

  // Filter trips based on search
  const filteredTrips = trips.filter((trip) => {
    return (
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Gestión de Viajes
          </h1>
          <p className="text-secondary-500">
            Administra los viajes disponibles en la plataforma
          </p>
        </div>
        
        <Button onClick={() => {
          setEditingTrip(null);
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo viaje
        </Button>
      </div>
      
      {/* Trip Form */}
      {(showForm || editingTrip) && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              {editingTrip ? 'Editar viaje' : 'Crear nuevo viaje'}
            </h2>
          </CardHeader>
          <CardContent>
            <TripForm
              initialData={editingTrip || undefined}
              onSubmit={editingTrip ? handleUpdateTrip : handleCreateTrip}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por título o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Trips List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-secondary-500">Cargando viajes...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-500">No hay viajes que coincidan con tu búsqueda.</p>
          <p className="text-secondary-400 mt-2">Intenta con otros términos o crea un nuevo viaje.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-card overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Trip Image */}
                <div className="h-full">
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Trip Info */}
                <div className="p-6 md:col-span-2">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-heading font-bold text-xl text-secondary-900">
                      {trip.title}
                    </h3>
                    <div className="text-lg font-bold text-primary-950">
                      ${trip.price.toLocaleString('es-UY')}
                    </div>
                  </div>
                  
                  <p className="text-secondary-600 mb-4">
                    <span className="font-medium">Destino:</span> {trip.destination}
                  </p>
                  
                  <p className="text-secondary-700 mb-6 line-clamp-2">
                    {trip.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrip(trip);
                        setShowForm(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}