import { createClient } from '@supabase/supabase-js';
import { User, Trip, Booking, Stats, TripFormData, ItineraryDay, IncludedService } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation for environment variables
function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  // Check if the URL is still a placeholder
  if (supabaseUrl === 'your-supabase-project-url' || supabaseUrl.includes('your-supabase-project-url')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials. Click "Connect to Supabase" in the top right to set up your project.');
  }

  if (supabaseAnonKey === 'your-supabase-anon-key' || supabaseAnonKey.includes('your-supabase-anon-key')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials. Click "Connect to Supabase" in the top right to set up your project.');
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      throw new Error('🌐 Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in the .env file.');
    }
  } catch (urlError) {
    throw new Error('🌐 Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in the .env file.');
  }

  // Validate anon key format (should be a JWT-like string)
  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    throw new Error('🔑 Invalid Supabase anonymous key format. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
  }
}

// Validate configuration before creating client
try {
  validateSupabaseConfig();
} catch (error) {
  console.error('Supabase Configuration Error:', error);
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('trips').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}

// Enhanced error handling wrapper
async function handleSupabaseError<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`${operationName} error:`, error);
    
    // Check for common connection errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
      throw new Error(`🌐 Connection failed. Please check your internet connection and Supabase configuration. Original error: ${error.message}`);
    }
    
    if (error.message?.includes('Invalid API key') || error.message?.includes('unauthorized')) {
      throw new Error(`🔑 Authentication failed. Please check your Supabase credentials in the .env file.`);
    }
    
    throw error;
  }
}

// Authentication functions
export async function signIn(email: string, password: string) {
  return handleSupabaseError(async () => {
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
  }, 'Sign in');
}

export async function signOut() {
  return handleSupabaseError(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, 'Sign out');
}

export async function getCurrentUser(): Promise<User | null> {
  return handleSupabaseError(async () => {
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
  }, 'Get current user');
}

// Trip functions
export async function getTrips(): Promise<Trip[]> {
  return handleSupabaseError(async () => {
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
  }, 'Get trips');
}

export async function getTrip(id: string): Promise<Trip | null> {
  return handleSupabaseError(async () => {
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
  }, 'Get trip');
}

export async function createTrip(tripData: TripFormData): Promise<Trip> {
  return handleSupabaseError(async () => {
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
  }, 'Create trip');
}

export async function updateTrip(id: string, tripData: TripFormData): Promise<Trip> {
  return handleSupabaseError(async () => {
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
  }, 'Update trip');
}

export async function deleteTrip(id: string): Promise<void> {
  return handleSupabaseError(async () => {
    console.log('Attempting to delete trip with id:', id);
    
    // First, get the current user to check permissions
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Get user role from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      console.error('Error getting user data:', userError);
      throw new Error('Error verificando permisos de usuario');
    }

    console.log('User role:', userData?.role);

    // Check if user has permission to delete trips
    if (!userData || !['owner', 'employee'].includes(userData.role)) {
      throw new Error('No tienes permisos para eliminar viajes');
    }

    // Delete related data first (due to foreign key constraints)
    console.log('Deleting itinerary days...');
    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .delete()
      .eq('trip_id', id);

    if (itineraryError) {
      console.error('Error deleting itinerary:', itineraryError);
      throw new Error('Error eliminando itinerario del viaje');
    }

    console.log('Deleting included services...');
    const { error: servicesError } = await supabase
      .from('included_services')
      .delete()
      .eq('trip_id', id);

    if (servicesError) {
      console.error('Error deleting services:', servicesError);
      throw new Error('Error eliminando servicios del viaje');
    }

    // Finally delete the trip
    console.log('Deleting trip...');
    const { error: tripError } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (tripError) {
      console.error('Error deleting trip:', tripError);
      throw new Error('Error eliminando el viaje: ' + tripError.message);
    }

    console.log('Trip deleted successfully');
  }, 'Delete trip');
}

// Booking functions
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  return handleSupabaseError(async () => {
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
  }, 'Create booking');
}

export async function getBookings(): Promise<Booking[]> {
  return handleSupabaseError(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trip:trips(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, 'Get bookings');
}

export async function getBookingsByTrip(tripId: string): Promise<Booking[]> {
  return handleSupabaseError(async () => {
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
  }, 'Get bookings by trip');
}

// Enhanced Stats functions
export async function getStats(): Promise<Stats> {
  return handleSupabaseError(async () => {
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
        created_at,
        trip:trips!inner(
          id,
          destination,
          category,
          price
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

    // Calculate additional metrics
    const additionalMetrics = await calculateAdditionalMetrics(bookingsWithTrips || []);

    return {
      totalTrips: totalTrips || 0,
      totalBookings: totalBookings || 0,
      upcomingTrips: upcomingTrips || 0,
      popularDestinations,
      ...additionalMetrics,
    };
  }, 'Get stats');
}

// Calculate additional metrics for enhanced dashboard
async function calculateAdditionalMetrics(bookingsWithTrips: any[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent bookings (last 7 days)
  const recentBookings = bookingsWithTrips.filter(booking => 
    new Date(booking.created_at) >= sevenDaysAgo
  );

  // Bookings from previous 7 days (for trend calculation)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const previousWeekBookings = bookingsWithTrips.filter(booking => {
    const bookingDate = new Date(booking.created_at);
    return bookingDate >= fourteenDaysAgo && bookingDate < sevenDaysAgo;
  });

  // Calculate booking trend (percentage change)
  const currentWeekCount = recentBookings.length;
  const previousWeekCount = previousWeekBookings.length;
  const bookingTrend = previousWeekCount > 0 
    ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100 
    : currentWeekCount > 0 ? 100 : 0;

  // Average bookings per day (last 30 days)
  const last30DaysBookings = bookingsWithTrips.filter(booking => 
    new Date(booking.created_at) >= thirtyDaysAgo
  );
  const averageBookingsPerDay = last30DaysBookings.length / 30;

  // Category distribution
  const categoryCount: { [key: string]: number } = {};
  bookingsWithTrips.forEach(booking => {
    if (booking.trip && booking.trip.category) {
      const category = booking.trip.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  });

  const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
    category: category === 'nacional' ? 'Nacional' : 
              category === 'internacional' ? 'Internacional' : 
              category === 'grupal' ? 'Grupal' : category,
    count,
    percentage: bookingsWithTrips.length > 0 ? (count / bookingsWithTrips.length) * 100 : 0
  }));

  // Get total trips for conversion rate calculation
  const { count: totalTrips } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true });

  // Simple conversion rate: bookings per trip
  const conversionRate = totalTrips && totalTrips > 0 
    ? (bookingsWithTrips.length / totalTrips) * 100 
    : 0;

  return {
    bookingTrend: Math.round(bookingTrend * 10) / 10, // Round to 1 decimal
    averageBookingsPerDay: Math.round(averageBookingsPerDay * 10) / 10,
    categoryDistribution,
    recentBookingsCount: currentWeekCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}