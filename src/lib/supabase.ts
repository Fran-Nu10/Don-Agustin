// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { User, Trip, Booking, Stats, TripFormData, ItineraryDay, IncludedService } from '../types';
import { supabase } from './supabase/client';


// Enhanced error handling wrapper
async function handleSupabaseError<T>(
  operation: () => Promise<T>, 
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [${operationName}] Intento ${attempt}/${maxRetries}`);
      const startTime = Date.now();
      
      const result = await operation();
      
      const endTime = Date.now();
      console.log(`✅ [${operationName}] Éxito en intento ${attempt} (${endTime - startTime}ms)`);
      
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [${operationName}] Error en intento ${attempt}:`, error);
      
      // Check if this is a retryable error
      const isRetryable = isRetryableError(error);
      console.log(`🔍 [${operationName}] ¿Error reintentable?`, isRetryable);
      
      if (!isRetryable || attempt === maxRetries) {
        console.error(`🚫 [${operationName}] No se reintentará. Retryable: ${isRetryable}, Intento final: ${attempt === maxRetries}`);
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
      console.log(`⏳ [${operationName}] Esperando ${delay}ms antes del siguiente intento...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  console.error(`💥 [${operationName}] Todos los intentos fallaron. Error final:`, lastError);
  
  try {
    throw lastError;
  } catch (error: any) {
    console.error(`${operationName} error:`, error);
    
    // Check for common connection errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
      throw new Error(`🌐 Connection failed. Please check your internet connection and Supabase configuration. Original error: ${error.message}`);
    }
    
    // --- NUEVA LÓGICA PARA ERRORES DE AUTENTICACIÓN ---
    // Si el error indica un fallo de autenticación (ej. JWT expirado, token inválido, no autorizado),
    // debemos limpiar la sesión para forzar un nuevo inicio de sesión.
    if (error.message?.includes('Invalid API key') || 
        error.message?.includes('unauthorized') || 
        error.message?.includes('JWT expired') ||
        error.message?.includes('invalid JWT')) {
      
      console.warn(`🔑 Error de autenticación detectado durante ${operationName}. Limpiando sesión.`);
      // Realizar cierre de sesión y limpiar el almacenamiento local para asegurar un estado limpio
      await supabase.auth.signOut();
      
      // Lanzar un mensaje de error específico para la interfaz de usuario
      throw new Error(`🔑 Sesión inválida o expirada. Por favor, inicia sesión nuevamente.`);
    }
    // --- FIN NUEVA LÓGICA ---
    
    throw error;
  }
}

// Helper function to determine if an error is retryable
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.code;
  
  // Network errors - always retryable
  if (message.includes('failed to fetch') || 
      message.includes('network error') || 
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch')) {
    console.log(`🌐 [RETRY] Error de red detectado: ${message}`);
    return true;
  }
  
  // HTTP status codes that are retryable
  const retryableStatusCodes = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
    520, // Unknown Error (Cloudflare)
    521, // Web Server Is Down (Cloudflare)
    522, // Connection Timed Out (Cloudflare)
    523, // Origin Is Unreachable (Cloudflare)
    524, // A Timeout Occurred (Cloudflare)
  ];
  
  if (retryableStatusCodes.includes(status)) {
    console.log(`🔄 [RETRY] Status code reintentable detectado: ${status}`);
    return true;
  }
  
  // Non-retryable errors (client errors, auth errors, etc.)
  const nonRetryableStatusCodes = [
    400, // Bad Request
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
    409, // Conflict
    422, // Unprocessable Entity
  ];
  
  if (nonRetryableStatusCodes.includes(status)) {
    console.log(`🚫 [RETRY] Status code no reintentable detectado: ${status}`);
    return false;
  }
  
  // Auth-related errors - not retryable
  if (message.includes('jwt') || 
      message.includes('unauthorized') || 
      message.includes('invalid api key') ||
      message.includes('authentication')) {
    console.log(`🔑 [RETRY] Error de autenticación detectado: ${message}`);
    return false;
  }
  
  // Validation errors - not retryable
  if (message.includes('validation') || 
      message.includes('invalid') || 
      message.includes('required')) {
    console.log(`📝 [RETRY] Error de validación detectado: ${message}`);
    return false;
  }
  
  // Default to retryable for unknown errors
  console.log(`❓ [RETRY] Error desconocido, marcando como reintentable: ${message}`);
  return true;
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
      return newUser;
    }

    return userData;
  }, 'Sign in');
}

export async function signOut() {
  return handleSupabaseError(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, 'Sign out');
}



export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔍 getCurrentUser: Iniciando...');

    // First, try to get the session. This is more robust for rehydrating.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('⚠️ Error al obtener la sesión de Supabase:', sessionError);
      // If there's a session error, it's likely a problem, so clear and return null.
      await supabase.auth.signOut(); // Ensure any corrupted session is cleared
      return null;
    }

    if (!session) {
      console.log('⚠️ No hay sesión activa de Supabase.');
      return null; // No active session, so no user.
    }

    // If session exists, then get the user from our users table
    const authUser = session.user;
    console.log('✅ Usuario autenticado encontrado (desde sesión):', authUser.id, authUser.email);

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('👤 Usuario no existe en public.users, creando nuevo...');
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            user_id: authUser.id,
            email: authUser.email,
            role: 'employee',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error al crear nuevo usuario en public.users:', insertError);
          throw insertError; // Re-throw to be caught by handleSupabaseError
        }
        console.log('✅ Nuevo usuario creado:', newUser);
        return newUser;
      }
      console.error('❌ Error inesperado al buscar usuario en public.users:', fetchError);
      throw fetchError; // Re-throw to be caught by handleSupabaseError
    }
    console.log('✅ Usuario encontrado en public.users:', existingUser);
    return existingUser;

  } catch (error) {
    console.error('🔥 Error fatal en getCurrentUser:', error);
    // If any other error occurs, ensure session is cleared for this tab only
    await supabase.auth.signOut();
    return null;
  }
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

    // Delete related quotations first (due to foreign key constraints)
    console.log('Deleting related quotations...');
    const { error: quotationsError } = await supabase
      .from('quotations')
      .delete()
      .eq('trip_id', id);

    if (quotationsError) {
      console.error('Error deleting quotations:', quotationsError);
      throw new Error('Error eliminando cotizaciones del viaje');
    }

    // Delete related bookings (due to foreign key constraints)
    console.log('Deleting related bookings...');
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('trip_id', id);

    if (bookingsError) {
      console.error('Error deleting bookings:', bookingsError);
      throw new Error('Error eliminando reservas del viaje');
    }

    // Delete itinerary days
    console.log('Deleting itinerary days...');
    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .delete()
      .eq('trip_id', id);

    if (itineraryError) {
      console.error('Error deleting itinerary:', itineraryError);
      throw new Error('Error eliminando itinerario del viaje');
    }

    // Delete included services
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
    try {
      console.log('Fetching dashboard statistics...');
      
      // Get total trips with count
      const { data: tripsData, error: tripsError, count: totalTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact' });

      if (tripsError) {
        console.error('Error fetching trips:', tripsError);
        throw tripsError;
      }
      
      console.log(`Found ${totalTrips} total trips`);

      // Get total quotations with count - UPDATED FROM BOOKINGS TO QUOTATIONS
      const { data: quotationsData, error: quotationsError, count: totalQuotations } = await supabase
        .from('quotations')
        .select('*', { count: 'exact' })
        .limit(1000); // Ensure we get all quotations

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        throw quotationsError;
      }
      
      console.log(`Found ${totalQuotations} total quotations`);

      // Get upcoming trips
      const { data: upcomingTripsData, error: upcomingError, count: upcomingTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .gt('departure_date', new Date().toISOString());

      if (upcomingError) {
        console.error('Error fetching upcoming trips:', upcomingError);
        throw upcomingError;
      }
      
      console.log(`Found ${upcomingTrips} upcoming trips`);

      // Get quotations with trip details for destination analysis - UPDATED FROM BOOKINGS TO QUOTATIONS
      const { data: quotationsWithTrips, error: quotationsWithTripsError } = await supabase
        .from('quotations')
        .select(`
          id,
          created_at,
          trip_id,
          trip_destination,
          destination
        `);

      if (quotationsWithTripsError) {
        console.error('Error fetching quotations with trips:', quotationsWithTripsError);
        throw quotationsWithTripsError;
      }

      // Count quotations by destination - UPDATED FROM BOOKINGS TO QUOTATIONS
      const destinationCounts: { [key: string]: number } = {};
      
      if (quotationsWithTrips && quotationsWithTrips.length > 0) {
        console.log('Processing quotations for destination counts...');
        quotationsWithTrips.forEach(quotation => {
          // Use trip_destination if available, otherwise use destination
          const destination = quotation.trip_destination || quotation.destination;
          if (destination) {
            destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
          }
        });
      } else {
        // Si no hay cotizaciones, usar los destinos de los viajes disponibles
        console.log('No quotations found, using trip destinations instead');
        tripsData?.forEach(trip => {
          const destination = trip.destination;
          destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
        });
      }

      // Convert to array and sort by count
      const popularDestinations = Object.entries(destinationCounts)
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 destinations
      
      console.log('Popular destinations:', popularDestinations);

      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      tripsData?.forEach(trip => {
        const category = trip.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const totalTripsCount = tripsData?.length || 0;
      const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
        category: category === 'nacional' ? 'Nacional' : 
                  category === 'internacional' ? 'Internacional' : 
                  category === 'grupal' ? 'Grupal' : category,
        count,
        percentage: totalTripsCount > 0 ? (count / totalTripsCount) * 100 : 0
      }));
      
      console.log('Category distribution:', categoryDistribution);

      // Calculate quotation trend - UPDATED FROM BOOKINGS TO QUOTATIONS
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentQuotations = quotationsData?.filter(quotation => 
        new Date(quotation.created_at) >= sevenDaysAgo
      ) || [];
      
      const previousWeekQuotations = quotationsData?.filter(quotation => {
        const quotationDate = new Date(quotation.created_at);
        return quotationDate >= fourteenDaysAgo && quotationDate < sevenDaysAgo;
      }) || [];
      
      const currentWeekCount = recentQuotations.length;
      const previousWeekCount = previousWeekQuotations.length;
      
      const quotationTrend = previousWeekCount > 0 
        ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100 
        : currentWeekCount > 0 ? 100 : 0;
      
      console.log(`Quotation trend: ${quotationTrend.toFixed(1)}% (${currentWeekCount} vs ${previousWeekCount})`);

      // Calculate average quotations per day - UPDATED FROM BOOKINGS TO QUOTATIONS
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last30DaysQuotations = quotationsData?.filter(quotation => 
        new Date(quotation.created_at) >= thirtyDaysAgo
      ) || [];
      
      const averageQuotationsPerDay = last30DaysQuotations.length / 30;
      console.log(`Average quotations per day: ${averageQuotationsPerDay.toFixed(2)}`);

      // Calculate recent quotations count - UPDATED FROM BOOKINGS TO QUOTATIONS
      const recentQuotationsCount = recentQuotations.length;
      console.log(`Recent quotations (last 7 days): ${recentQuotationsCount}`);

      // Calculate conversion rate
      const conversionRate = totalTrips && totalTrips > 0 
        ? ((totalQuotations || 0) / totalTrips) * 100 
        : 0;
      
      console.log(`Conversion rate: ${conversionRate.toFixed(1)}%`);

      return {
        totalTrips: totalTrips || 0,
        totalBookings: totalQuotations || 0, // Now represents total quotations
        upcomingTrips: upcomingTrips || 0,
        popularDestinations,
        categoryDistribution,
        bookingTrend: Math.round(quotationTrend * 10) / 10, // Now represents quotation trend
        averageBookingsPerDay: Math.round(averageQuotationsPerDay * 10) / 10, // Now represents average quotations per day
        recentBookingsCount: recentQuotationsCount, // Now represents recent quotations count
        conversionRate,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }, 'Get stats');
}