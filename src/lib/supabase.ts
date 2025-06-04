import { createClient } from '@supabase/supabase-js';
import { User, Trip, Booking, Stats } from '../types';
import { users, trips, bookings, stats } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export async function signIn(email: string, password: string) {
  try {
    // First authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) throw authError;

    // Then get the user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (userError) {
      // If user doesn't exist in the users table, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          user_id: authData.user.id,
          email: authData.user.email,
          role: 'employee', // Default role
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;
      return { user: newUser };
    }

    return { user: userData };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If user doesn't exist in the users table, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          user_id: user.id,
          email: user.email,
          role: 'employee', // Default role
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;
      return newUser;
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
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
  // Get total trips
  const { count: totalTrips } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true });

  // Get total bookings
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get upcoming trips
  const { count: upcomingTrips } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .gt('departure_date', new Date().toISOString());

  // Get popular destinations
  const { data: popularDestinations } = await supabase
    .from('trips')
    .select('destination')
    .order('available_spots', { ascending: true })
    .limit(3);

  return {
    totalTrips: totalTrips || 0,
    totalBookings: totalBookings || 0,
    upcomingTrips: upcomingTrips || 0,
    popularDestinations: (popularDestinations || []).map(trip => ({
      destination: trip.destination,
      count: 1,
    })),
  };
}