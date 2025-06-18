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

export async function getClientStats(): Promise<any> {
  try {
    // Get all clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) throw error;

    // Get bookings to calculate conversion rate
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');

    if (bookingsError) throw bookingsError;

    // Calculate stats
    const total = clients.length;
    
    // Status distribution
    const byStatus = clients.reduce((acc: Record<string, number>, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {});

    // Source distribution
    const bySource = clients.reduce((acc: Record<string, number>, client) => {
      const source = client.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Priority distribution
    const byPriority = clients.reduce((acc: Record<string, number>, client) => {
      const priority = client.priority || 'normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Conversion rate (closed clients / total clients)
    const closedClients = clients.filter(c => c.status === 'cliente_cerrado').length;
    const conversionRate = total > 0 ? (closedClients / total) * 100 : 0;

    // Upcoming follow-ups
    const now = new Date();
    const upcomingFollowUps = clients.filter(client => 
      client.next_follow_up && new Date(client.next_follow_up) > now
    ).length;

    // Overdue follow-ups
    const overdueFollowUps = clients.filter(client => 
      client.next_follow_up && new Date(client.next_follow_up) < now
    ).length;

    // Average response time (mock calculation)
    const avgResponseTime = 24; // This would be calculated based on actual response times

    // Calculate total revenue from trip_value
    const totalRevenue = clients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
    
    // Calculate average trip value
    const clientsWithValue = clients.filter(client => client.trip_value && client.trip_value > 0);
    const averageTripValue = clientsWithValue.length > 0 
      ? clientsWithValue.reduce((sum, client) => sum + (client.trip_value || 0), 0) / clientsWithValue.length
      : 0;

    return {
      total,
      byStatus,
      bySource,
      byPriority,
      conversionRate,
      avgResponseTime,
      upcomingFollowUps,
      overdueFollowUps,
      totalRevenue,
      averageTripValue,
    };
  } catch (error) {
    console.error('Error getting client stats:', error);
    throw error;
  }
}