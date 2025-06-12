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

export async function createClient(clientData: Omit<ClientFormData, 'internal_notes'>): Promise<Client> {
  try {
    console.log('Creating client with data:', clientData);
    
    // Ensure status is properly cast
    const dataToInsert = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || null,
      message: clientData.message || null,
      status: clientData.status || 'nuevo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Data to insert:', dataToInsert);

    const { data, error } = await supabase
      .from('clients')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Client created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createClient function:', error);
    throw error;
  }
}

export async function updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...clientData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}