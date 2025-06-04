import { useState, useEffect } from 'react';
import { getTrips } from '../lib/supabase';
import { Trip } from '../types';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const data = await getTrips();
        setTrips(data);
      } catch (err) {
        console.error('Error loading trips:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  return { trips, loading, error };
}