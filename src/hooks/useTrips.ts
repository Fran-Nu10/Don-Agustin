import { useState, useEffect } from 'react';
import { getTrips } from '../lib/supabase';
import { Trip } from '../types';

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
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return { trips, loading, error, refetch: loadTrips };
}