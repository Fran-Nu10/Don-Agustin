export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'nuevo' | 'en_proceso' | 'cerrado';
  internal_notes?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: Client['status'];
  internal_notes?: string;
  scheduled_date?: string;
}

export interface ClientFilters {
  name: string;
  status: string;
}