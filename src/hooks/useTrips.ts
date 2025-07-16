import { useState, useEffect } from 'react';
import { getTrips } from '../lib/supabase';
import { Trip } from '../types';
import { toast } from 'react-hot-toast'; // Importar toast

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
      setError(null);
    } catch (err) {
      console.error('Error loading trips:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los paquetes.';
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error(`Error al cargar los paquetes: ${errorMessage}`); // Mostrar notificación de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return { trips, loading, error, refetch: loadTrips };
}