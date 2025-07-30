export interface Quotation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  department?: string;
  flexible_dates: boolean;
  adults: number;
  children: number;
  observations?: string;
  status: 'pending' | 'processing' | 'quoted' | 'closed';
  created_at: string;
  updated_at: string;
  trip_id?: string;
  trip_title?: string;
  trip_destination?: string;
  trip_price?: number;
  trip_price_currency?: 'UYU' | 'USD';
}

export interface QuotationFormData {
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  department?: string;
  flexible_dates: boolean;
  adults: number;
  children: number;
  observations?: string;
  trip_id?: string;
  trip_title?: string;
  trip_destination?: string;
  trip_price?: number;
  trip_price_currency?: 'UYU' | 'USD';
}

export interface QuotationFilters {
  name: string;
  status: string;
  department: string;
}