import { createClient } from '@supabase/supabase-js';
import { User, Trip, Booking, Stats, TripFormData, ItineraryDay, IncludedService } from '../types';

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

export async function createTrip(tripData: TripFormData): Promise<Trip> {
  const { itinerary, included_services, ...tripInfo } = tripData;
  
  // Create the trip first
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert([{
      ...tripInfo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (tripError) throw tripError;

  // Create itinerary days
  if (itinerary && itinerary.length > 0) {
    const itineraryData = itinerary.map((day, index) => ({
      trip_id: trip.id,
      day: index + 1,
      title: day.title,
      description: day.description,
    }));

    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .insert(itineraryData);

    if (itineraryError) throw itineraryError;
  }

  // Create included services
  if (included_services && included_services.length > 0) {
    const servicesData = included_services.map((service) => ({
      trip_id: trip.id,
      icon: service.icon,
      title: service.title,
      description: service.description,
    }));

    const { error: servicesError } = await supabase
      .from('included_services')
      .insert(servicesData);

    if (servicesError) throw servicesError;
  }

  // Return the complete trip with relations
  return getTrip(trip.id) as Promise<Trip>;
}

export async function updateTrip(id: string, tripData: TripFormData): Promise<Trip> {
  const { itinerary, included_services, ...tripInfo } = tripData;
  
  // Update the trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .update({
      ...tripInfo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (tripError) throw tripError;

  // Delete existing itinerary and services
  await supabase.from('itinerary_days').delete().eq('trip_id', id);
  await supabase.from('included_services').delete().eq('trip_id', id);

  // Create new itinerary days
  if (itinerary && itinerary.length > 0) {
    const itineraryData = itinerary.map((day, index) => ({
      trip_id: id,
      day: index + 1,
      title: day.title,
      description: day.description,
    }));

    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .insert(itineraryData);

    if (itineraryError) throw itineraryError;
  }

  // Create new included services
  if (included_services && included_services.length > 0) {
    const servicesData = included_services.map((service) => ({
      trip_id: id,
      icon: service.icon,
      title: service.title,
      description: service.description,
    }));

    const { error: servicesError } = await supabase
      .from('included_services')
      .insert(servicesData);

    if (servicesError) throw servicesError;
  }

  // Return the complete trip with relations
  return getTrip(id) as Promise<Trip>;
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
  try {
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

    // Get popular destinations based on actual bookings
    const { data: bookingsWithTrips, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        trip:trips!inner(
          id,
          destination
        )
      `);

    if (bookingsError) {
      console.error('Error fetching bookings for stats:', bookingsError);
    }

    // Count bookings by destination
    const destinationCounts: { [key: string]: number } = {};
    
    if (bookingsWithTrips) {
      bookingsWithTrips.forEach(booking => {
        if (booking.trip && booking.trip.destination) {
          const destination = booking.trip.destination;
          destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
        }
      });
    }

    // Convert to array and sort by count
    const popularDestinations = Object.entries(destinationCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 destinations

    // If no bookings yet, show some default destinations
    if (popularDestinations.length === 0) {
      // Get some trips to show as examples
      const { data: sampleTrips } = await supabase
        .from('trips')
        .select('destination')
        .limit(3);

      if (sampleTrips) {
        sampleTrips.forEach(trip => {
          popularDestinations.push({
            destination: trip.destination,
            count: 0
          });
        });
      }
    }

    return {
      totalTrips: totalTrips || 0,
      totalBookings: totalBookings || 0,
      upcomingTrips: upcomingTrips || 0,
      popularDestinations,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    
    // Return default stats if there's an error
    return {
      totalTrips: 0,
      totalBookings: 0,
      upcomingTrips: 0,
      popularDestinations: [],
    };
  }
}