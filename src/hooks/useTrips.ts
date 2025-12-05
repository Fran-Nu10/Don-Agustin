import { useState, useEffect, useCallback } from 'react';
import { getTrips } from '../lib/supabase';
import { Trip } from '../types';
import { toast } from 'react-hot-toast'; // Importar toast

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 [USE TRIPS] Iniciando carga de trips...');
      const data = await getTrips();
      console.log('✅ [USE TRIPS] Trips cargados exitosamente:', data.length);
      setTrips(data);
      setError(null);
    } catch (err) {
      console.error('Error loading trips:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los paquetes.';
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error(`Error al cargar los paquetes: ${errorMessage}`); // Mostrar notificación de error
    } finally {
      console.log('🏁 [USE TRIPS] Finalizando carga de trips, setting loading to false');
      setLoading(false);
    }
  }, []);

  // Optimistic update functions
  const addOrUpdateTrip = useCallback((trip: Trip) => {
    console.log('🔄 [OPTIMISTIC UPDATE] Adding/updating trip:', trip.id, trip.title);
    setTrips(prevTrips => {
      const existingIndex = prevTrips.findIndex(t => t.id === trip.id);
      if (existingIndex >= 0) {
        // Update existing trip
        console.log('✏️ [OPTIMISTIC UPDATE] Updating existing trip at index:', existingIndex);
        const newTrips = [...prevTrips];
        newTrips[existingIndex] = trip;
        return newTrips;
      } else {
        // Add new trip at the beginning
        console.log('➕ [OPTIMISTIC UPDATE] Adding new trip to beginning of list');
        return [trip, ...prevTrips];
      }
    });
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const removeTrip = useCallback((tripId: string) => {
    console.log('🗑️ [OPTIMISTIC UPDATE] Removing trip:', tripId);
    setTrips(prevTrips => {
      const filteredTrips = prevTrips.filter(t => t.id !== tripId);
      console.log('✅ [OPTIMISTIC UPDATE] Trip removed, new count:', filteredTrips.length);
      return filteredTrips;
    });
  }, []);
  return { 
    trips, 
    loading, 
    error, 
    refetch: loadTrips,
    addOrUpdateTrip,
    removeTrip
  };
}