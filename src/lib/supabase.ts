// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { User, Trip, Booking, Stats, TripFormData, ItineraryDay, IncludedService } from '../types';
import { supabase } from './supabase/client';
import { sanitizeTripData } from '../utils/dataSanitizer';


// Enhanced error handling wrapper
async function handleSupabaseError<T>(
  operation: () => Promise<T>, 
  operationName: string,
  maxRetries: number = 3,
  timeoutMs: number = 90000 // Increased to 90 seconds for diagnosis
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [${operationName}] Intento ${attempt}/${maxRetries}`);
      const startTime = Date.now();
      const perfStart = performance.now();
      
      // Crear promesa de timeout que se rechaza después del tiempo límite
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`⏰ HANDLESUPABASEERROR TIMEOUT: La operación "${operationName}" excedió el tiempo límite de ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Hacer que la operación compita con el timeout
      console.log(`⏱️ [${operationName}] Iniciando operación con timeout de ${timeoutMs}ms (global fetch: 60s)...`);
      const result = await Promise.race([operation(), timeoutPromise]);
      
      const endTime = Date.now();
      const perfEnd = performance.now();
      const duration = endTime - startTime;
      const perfDuration = perfEnd - perfStart;
      
      console.log(`✅ [${operationName}] Éxito en intento ${attempt} (${duration}ms wall time, ${perfDuration.toFixed(1)}ms performance)`);
      
      // Log performance warnings for slow operations
      if (perfDuration > 10000) {
        console.warn(`🐌 [${operationName}] SLOW OPERATION: ${perfDuration.toFixed(1)}ms - Consider investigating`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [${operationName}] Error en intento ${attempt}:`, error);
      
      // Verificar si es un error de timeout
      if (error.message?.includes('TIMEOUT:') || error.message?.includes('SUPABASE TIMEOUT:')) {
        console.error(`⏰ [${operationName}] Error de timeout detectado en intento ${attempt}`);
      }
      
      // Check if this is a retryable error
      const isRetryable = isRetryableError(error);
      console.log(`🔍 [${operationName}] ¿Error reintentable?`, isRetryable);
      
      if (!isRetryable || attempt === maxRetries) {
        console.error(`🚫 [${operationName}] No se reintentará. Retryable: ${isRetryable}, Intento final: ${attempt === maxRetries}`);
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); // Max 8 seconds para evitar timeouts largos
      console.log(`⏳ [${operationName}] Esperando ${delay}ms antes del siguiente intento...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  console.error(`💥 [${operationName}] Todos los intentos fallaron. Error final:`, lastError);
  
  try {
    // Manejo específico para errores de timeout
    if (lastError.message?.includes('TIMEOUT:') || lastError.message?.includes('SUPABASE TIMEOUT:')) {
      throw new Error(`⏰ La operación "${operationName}" tardó demasiado tiempo. Esto puede deberse a problemas de conexión o sobrecarga del servidor. Por favor, verifica tu conexión a internet y recarga la página si el problema persiste.`);
    }
    
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
  
  // Timeout errors - retryable but with limited attempts
  if (message.includes('timeout') || message.includes('TIMEOUT:')) {
    console.log(`⏰ [RETRY] Error de timeout detectado: ${message}`);
    return true;
  }
  
  // Network errors - always retryable
  if (message.includes('failed to fetch') || 
      message.includes('network error') || 
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
      message.includes('authentication') ||
      message.includes('auth session missing') ||
      message.includes('authsessionmissingerror')) {
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
    const perfStart = performance.now();
    console.log('🔐 [SIGN IN] Starting authentication process...');
    
    // First authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) throw authError;
    
    const authTime = performance.now();
    console.log(`✅ [SIGN IN] Supabase auth completed in ${(authTime - perfStart).toFixed(1)}ms`);

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
      
      const totalTime = performance.now();
      console.log(`✅ [SIGN IN] New user created. Total process: ${(totalTime - perfStart).toFixed(1)}ms`);
      return newUser;
    }

    const totalTime = performance.now();
    console.log(`✅ [SIGN IN] Existing user found. Total process: ${(totalTime - perfStart).toFixed(1)}ms`);
    return userData;
  }, 'Sign in', 3, 70000);
}

export async function signOut() {
  return handleSupabaseError(async () => {
    const perfStart = performance.now();
    console.log('🚪 [SIGN OUT] Starting logout process...');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    const perfEnd = performance.now();
    console.log(`✅ [SIGN OUT] Logout completed in ${(perfEnd - perfStart).toFixed(1)}ms`);
  }, 'Sign out', 3, 70000);
}



export async function getCurrentUser(): Promise<User | null> {
  const totalStart = performance.now();
  console.log('🔍 [GET CURRENT USER] Starting getCurrentUser function...');
  
  const perfStart = performance.now();
  console.log('🔍 getCurrentUser: Iniciando...');

  // First, try to get the session. This is more robust for rehydrating.
  const sessionStart = performance.now();
  console.log('📋 [GET SESSION] Starting session retrieval...');
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  const sessionEnd = performance.now();
  console.log(`📋 [GET SESSION] Session retrieval completed in ${(sessionEnd - sessionStart).toFixed(1)}ms`);

  if (sessionError) {
    console.error('⚠️ Error al obtener la sesión de Supabase:', sessionError);
    // If there's a session error, it's likely a problem, so clear and return null.
    await supabase.auth.signOut(); // Ensure any corrupted session is cleared
    return null;
  }

  if (!session) {
    console.log('⚠️ No hay sesión activa de Supabase.');
    const perfEnd = performance.now();
    console.log(`🔍 [GET CURRENT USER] No session found. Total time: ${(perfEnd - perfStart).toFixed(1)}ms`);
    const totalEnd = performance.now();
    console.log(`🔍 [GET CURRENT USER] TOTAL getCurrentUser time (no session): ${(totalEnd - totalStart).toFixed(1)}ms`);
    return null; // No active session, so no user.
  }

  // If session exists, then get the user from our users table
  const authUser = session.user;
  const sessionTime = performance.now();
  console.log('✅ Usuario autenticado encontrado (desde sesión):', authUser.id, authUser.email);
  console.log(`📊 [GET CURRENT USER] Session validation took ${(sessionTime - perfStart).toFixed(1)}ms`);

  const userQueryStart = performance.now();
  console.log('👤 [USER QUERY] Fetching user from users table...');
  
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', authUser.id)
    .single();
  
  const userQueryEnd = performance.now();
  console.log(`👤 [USER QUERY] User query completed in ${(userQueryEnd - userQueryStart).toFixed(1)}ms`);

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      const createUserStart = performance.now();
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
        throw insertError;
      }
      
      const createUserEnd = performance.now();
      console.log(`🔍 [GET CURRENT USER] User creation process took ${(createUserEnd - createUserStart).toFixed(1)}ms`);
      const perfEnd = performance.now();
      console.log('✅ Nuevo usuario creado:', newUser);
      console.log(`🔍 [GET CURRENT USER] Total time with user creation: ${(perfEnd - perfStart).toFixed(1)}ms`);
      const totalEnd = performance.now();
      console.log(`🔍 [GET CURRENT USER] TOTAL getCurrentUser time (new user): ${(totalEnd - totalStart).toFixed(1)}ms`);
      return newUser;
    }
    console.error('❌ Error inesperado al buscar usuario en public.users:', fetchError);
    throw fetchError;
  }
  
  const perfEnd = performance.now();
  console.log('✅ Usuario encontrado en public.users:', existingUser);
  console.log(`🔍 [GET CURRENT USER] Total time: ${(perfEnd - perfStart).toFixed(1)}ms`);
  const totalEnd = performance.now();
  console.log(`🔍 [GET CURRENT USER] TOTAL getCurrentUser time (existing user): ${(totalEnd - totalStart).toFixed(1)}ms`);
  return existingUser;
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
    console.log('🧹 [CREATE TRIP] Aplicando sanitización de datos...');
    const sanitizedTripData = sanitizeTripData(tripData);
    console.log('✅ [CREATE TRIP] Datos sanitizados aplicados');
    
    const { itinerary, included_services, ...tripInfo } = sanitizedTripData;
    
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
    console.log('🧹 [UPDATE TRIP] Aplicando sanitización de datos...');
    const sanitizedTripData = sanitizeTripData(tripData);
    console.log('✅ [UPDATE TRIP] Datos sanitizados aplicados');
    
    // Get current trip data to check for existing PDF
    const currentTrip = await getTrip(id);
    
    const { itinerary, included_services, ...tripInfo } = sanitizedTripData;
    
    // Handle PDF deletion if a new one is uploaded or if PDF is removed
    if (currentTrip?.info_pdf_url && 
        (tripInfo.info_pdf_url !== currentTrip.info_pdf_url || !tripInfo.info_pdf_url)) {
      try {
        console.log('🗑️ [UPDATE TRIP] Eliminando PDF anterior del storage...');
        const { deletePDF } = await import('../lib/supabase/storage');
        await deletePDF(currentTrip.info_pdf_url);
        console.log('✅ [UPDATE TRIP] PDF anterior eliminado del storage');
      } catch (error) {
        console.warn('⚠️ [UPDATE TRIP] No se pudo eliminar el PDF anterior del storage:', error);
      }
    }
    
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
  }, 'Delete trip', 3, 60000);
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
  const totalStart = performance.now();
  console.log('📊 [GET STATS] Starting getStats function...');
  
  try {
    console.log('📊 [GET STATS] Fetching dashboard statistics...');
    
    // Get total trips with count
    const tripsStart = performance.now();
    console.log('📊 [GET STATS] Step 1: Fetching trips...');
    const { data: tripsData, error: tripsError, count: totalTrips } = await supabase
      .from('trips')
      .select('*', { count: 'exact' });
    const tripsEnd = performance.now();
    console.log(`📊 [GET STATS] Step 1 completed in ${(tripsEnd - tripsStart).toFixed(1)}ms`);

    if (tripsError) {
      console.error('Error fetching trips:', tripsError);
      throw tripsError;
    }
    
    console.log(`📊 [GET STATS] Found ${totalTrips} total trips`);

    // Get total quotations with count - UPDATED FROM BOOKINGS TO QUOTATIONS
    const quotationsStart = performance.now();
    console.log('📊 [GET STATS] Step 2: Fetching quotations...');
    const { data: quotationsData, error: quotationsError, count: totalQuotations } = await supabase
      .from('quotations')
      .select('*', { count: 'exact' })
      .limit(1000); // Ensure we get all quotations
    const quotationsEnd = performance.now();
    console.log(`📊 [GET STATS] Step 2 completed in ${(quotationsEnd - quotationsStart).toFixed(1)}ms`);

    if (quotationsError) {
      console.error('Error fetching quotations:', quotationsError);
      throw quotationsError;
    }
    
    console.log(`📊 [GET STATS] Found ${totalQuotations} total quotations`);

    // Get upcoming trips
    const upcomingStart = performance.now();
    console.log('📊 [GET STATS] Step 3: Fetching upcoming trips...');
    const { data: upcomingTripsData, error: upcomingError, count: upcomingTrips } = await supabase
      .from('trips')
      .select('*', { count: 'exact' })
      .gt('departure_date', new Date().toISOString());
    const upcomingEnd = performance.now();
    console.log(`📊 [GET STATS] Step 3 completed in ${(upcomingEnd - upcomingStart).toFixed(1)}ms`);

    if (upcomingError) {
      console.error('Error fetching upcoming trips:', upcomingError);
      throw upcomingError;
    }
    
    console.log(`📊 [GET STATS] Found ${upcomingTrips} upcoming trips`);

    // Get quotations with trip details for destination analysis - UPDATED FROM BOOKINGS TO QUOTATIONS
    const quotationsWithTripsStart = performance.now();
    console.log('📊 [GET STATS] Step 4: Fetching quotations with trip details...');
    const { data: quotationsWithTrips, error: quotationsWithTripsError } = await supabase
      .from('quotations')
      .select(`
        id,
        created_at,
        trip_id,
        trip_destination,
        destination
      `);
    const quotationsWithTripsEnd = performance.now();
    console.log(`📊 [GET STATS] Step 4 completed in ${(quotationsWithTripsEnd - quotationsWithTripsStart).toFixed(1)}ms`);

    if (quotationsWithTripsError) {
      console.error('Error fetching quotations with trips:', quotationsWithTripsError);
      throw quotationsWithTripsError;
    }

    // Count quotations by destination - UPDATED FROM BOOKINGS TO QUOTATIONS
    const processingStart = performance.now();
    console.log('📊 [GET STATS] Step 5: Processing destination counts...');
    const destinationCounts: { [key: string]: number } = {};
    
    if (quotationsWithTrips && quotationsWithTrips.length > 0) {
      console.log('📊 [GET STATS] Processing quotations for destination counts...');
      quotationsWithTrips.forEach(quotation => {
        // Use trip_destination if available, otherwise use destination
        const destination = quotation.trip_destination || quotation.destination;
        if (destination) {
          destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
        }
      });
    } else {
      // Si no hay cotizaciones, usar los destinos de los viajes disponibles
      console.log('📊 [GET STATS] No quotations found, using trip destinations instead');
      tripsData?.forEach(trip => {
        const destination = trip.destination;
        destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
      });
    }
    const processingEnd = performance.now();
    console.log(`📊 [GET STATS] Step 5 completed in ${(processingEnd - processingStart).toFixed(1)}ms`);

    // Convert to array and sort by count
    const sortingStart = performance.now();
    console.log('📊 [GET STATS] Step 6: Sorting popular destinations...');
    const popularDestinations = Object.entries(destinationCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 destinations
    const sortingEnd = performance.now();
    console.log(`📊 [GET STATS] Step 6 completed in ${(sortingEnd - sortingStart).toFixed(1)}ms`);
    
    console.log('📊 [GET STATS] Popular destinations:', popularDestinations);

    // Calculate category distribution
    const categoryStart = performance.now();
    console.log('📊 [GET STATS] Step 7: Calculating category distribution...');
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
    const categoryEnd = performance.now();
    console.log(`📊 [GET STATS] Step 7 completed in ${(categoryEnd - categoryStart).toFixed(1)}ms`);
    
    console.log('📊 [GET STATS] Category distribution:', categoryDistribution);

    // Calculate quotation trend - UPDATED FROM BOOKINGS TO QUOTATIONS
    const trendStart = performance.now();
    console.log('📊 [GET STATS] Step 8: Calculating quotation trends...');
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
    const trendEnd = performance.now();
    console.log(`📊 [GET STATS] Step 8 completed in ${(trendEnd - trendStart).toFixed(1)}ms`);
    
    console.log(`📊 [GET STATS] Quotation trend: ${quotationTrend.toFixed(1)}% (${currentWeekCount} vs ${previousWeekCount})`);

    // Calculate average quotations per day - UPDATED FROM BOOKINGS TO QUOTATIONS
    const averageStart = performance.now();
    console.log('📊 [GET STATS] Step 9: Calculating averages...');
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysQuotations = quotationsData?.filter(quotation => 
      new Date(quotation.created_at) >= thirtyDaysAgo
    ) || [];
    
    const averageQuotationsPerDay = last30DaysQuotations.length / 30;
    console.log(`📊 [GET STATS] Average quotations per day: ${averageQuotationsPerDay.toFixed(2)}`);

    // Calculate recent quotations count - UPDATED FROM BOOKINGS TO QUOTATIONS
    const recentQuotationsCount = recentQuotations.length;
    console.log(`📊 [GET STATS] Recent quotations (last 7 days): ${recentQuotationsCount}`);

    // Calculate conversion rate
    const conversionRate = totalTrips && totalTrips > 0 
      ? ((totalQuotations || 0) / totalTrips) * 100 
      : 0;
    const averageEnd = performance.now();
    console.log(`📊 [GET STATS] Step 9 completed in ${(averageEnd - averageStart).toFixed(1)}ms`);
    
    console.log(`📊 [GET STATS] Conversion rate: ${conversionRate.toFixed(1)}%`);

    const resultStart = performance.now();
    console.log('📊 [GET STATS] Step 10: Building result object...');
    const result = {
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
    const resultEnd = performance.now();
    console.log(`📊 [GET STATS] Step 10 completed in ${(resultEnd - resultStart).toFixed(1)}ms`);
    
    const totalEnd = performance.now();
    console.log(`📊 [GET STATS] TOTAL getStats function time: ${(totalEnd - totalStart).toFixed(1)}ms`);
    
    return result;
  } catch (error) {
    const totalEnd = performance.now();
    console.error(`📊 [GET STATS] ERROR after ${(totalEnd - totalStart).toFixed(1)}ms:`, error);
    throw error;
  }
}