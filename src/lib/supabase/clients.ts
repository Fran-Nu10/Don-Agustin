import { supabase } from './client';
import { Client, ClientFormData } from '../../types/client';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createClient(clientData: Omit<ClientFormData, 'internal_notes' | 'scheduled_date'>): Promise<Client> {
  try {
    console.log('Creating client with data:', clientData);
    
    // Prepare data for insertion - only include fields that are allowed for public insertion
    const dataToInsert = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || null,
      message: clientData.message || null,
      status: clientData.status || 'nuevo',
      // Trip-related fields
      last_booked_trip_id: clientData.last_booked_trip_id || null,
      last_booked_trip_title: clientData.last_booked_trip_title || null,
      last_booked_trip_destination: clientData.last_booked_trip_destination || null,
      last_booked_trip_date: clientData.last_booked_trip_date || null,
      preferred_destination: clientData.preferred_destination || clientData.last_booked_trip_destination || null,
      trip_value: clientData.trip_value || null,
      trip_value_currency: clientData.trip_value_currency || null,
      // Set scheduled_date automatically for public bookings
      scheduled_date: new Date().toISOString(),
    };

    console.log('Data to insert:', dataToInsert);

    // For public users, just insert without trying to select back
    // For authenticated users (admins), we can select the result
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      // User is authenticated, can select the result
      const { data, error } = await supabase
        .from('clients')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Client created successfully by authenticated user:', data);
      return data;
    } else {
      // Anonymous user, just insert without selecting
      const { error } = await supabase
        .from('clients')
        .insert([dataToInsert]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Client created successfully by anonymous user');
      
      // Return a mock client object since we can't select the inserted row
      // This is acceptable for public forms where we just need to confirm creation
      return {
        id: 'created', // Placeholder ID
        name: dataToInsert.name,
        email: dataToInsert.email,
        phone: dataToInsert.phone,
        message: dataToInsert.message,
        status: dataToInsert.status,
        internal_notes: null,
        scheduled_date: dataToInsert.scheduled_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_booked_trip_id: dataToInsert.last_booked_trip_id,
        last_booked_trip_title: dataToInsert.last_booked_trip_title,
        last_booked_trip_destination: dataToInsert.last_booked_trip_destination,
        last_booked_trip_date: dataToInsert.last_booked_trip_date,
        preferred_destination: dataToInsert.preferred_destination,
        trip_value: dataToInsert.trip_value,
      } as Client;
    }
  } catch (error) {
    console.error('Error in createClient function:', error);
    throw error;
  }
}

export async function updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
  // Handle scheduled_date properly - convert to ISO string or set to null
  const updateData = {
    ...clientData,
    scheduled_date: clientData.scheduled_date ? 
      new Date(clientData.scheduled_date).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  console.log('Updating client with data:', updateData);

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  console.log('Client updated successfully:', data);
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  console.log('Deleting client with id:', id);
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
  
  console.log('Client deleted successfully');
}