import { supabase } from './supabase/client';
import { User, Trip, Booking, Stats } from '../types';

// Authentication functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Trip functions
export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      itinerary:itinerary_days(*),
      included_services(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      itinerary:itinerary_days(*),
      included_services(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert([{
      ...trip,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrip(id: string, tripUpdate: Partial<Trip>): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .update({
      ...tripUpdate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Booking functions
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      ...booking,
      created_at: new Date().toISOString(),
    }])
    .select(`
      *,
      trip:trips(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trips(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBookingsByTrip(tripId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trips(*)
    `)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Stats functions
export async function getStats(): Promise<Stats> {
  const [
    { count: totalTrips },
    { count: totalBookings },
    { count: upcomingTrips },
    { data: popularDestinations }
  ] = await Promise.all([
    supabase.from('trips').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('trips')
      .select('*', { count: 'exact', head: true })
      .gte('departure_date', new Date().toISOString()),
    supabase.from('trips')
      .select('destination, count')
      .order('count', { ascending: false })
      .limit(5)
  ]);

  return {
    totalTrips: totalTrips || 0,
    totalBookings: totalBookings || 0,
    upcomingTrips: upcomingTrips || 0,
    popularDestinations: popularDestinations?.map(d => ({
      destination: d.destination,
      count: parseInt(d.count)
    })) || []
  };
}