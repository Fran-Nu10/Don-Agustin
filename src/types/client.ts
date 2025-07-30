export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'nuevo' | 'presupuesto_enviado' | 'en_seguimiento' | 'cliente_cerrado' | 'en_proceso' | 'cliente_perdido' | 'seguimientos_proximos';
  internal_notes?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  // New fields for enhanced CRM
  source?: string; // 'website', 'referral', 'social_media', 'phone', 'email'
  priority?: 'baja' | 'normal' | 'media' | 'alta' | 'urgente';
  budget_range?: string;
  preferred_destination?: string;
  travel_date?: string;
  last_contact_date?: string;
  next_follow_up?: string;
  tags?: string[];
  trip_value?: number; // Valor del viaje
  trip_value_currency?: 'UYU' | 'USD';
  // New trip-related fields
  last_booked_trip_id?: string;
  last_booked_trip_title?: string;
  last_booked_trip_destination?: string;
  last_booked_trip_date?: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: Client['status'];
  internal_notes?: string;
  scheduled_date?: string;
  source?: string;
  priority?: Client['priority'];
  budget_range?: string;
  preferred_destination?: string;
  travel_date?: string;
  last_contact_date?: string;
  next_follow_up?: string;
  tags?: string[];
  trip_value?: number; // Valor del viaje
  trip_value_currency?: 'UYU' | 'USD';
  // New trip-related fields
  last_booked_trip_id?: string;
  last_booked_trip_title?: string;
  last_booked_trip_destination?: string;
  last_booked_trip_date?: string;
}

export interface ClientFilters {
  name: string;
  status: string;
  source: string;
  priority: string;
  dateRange: {
    start: string;
    end: string;
  };
  budgetRange: string;
  destination: string;
  tags: string[];
}

export interface ClientStatsType {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byPriority: Record<string, number>;
  conversionRate: number;
  avgResponseTime: number;
  upcomingFollowUps: number;
  overdueFollowUps: number;
  potentialRevenue: number; // Renamed from totalRevenue
  closedRevenue: number; // New field for closed clients revenue
  averageTripValue: number;
  clientsWithValue: number; // New field to track clients with value
  // New conversion rate fields
  newToQuotedConversion: number;
  quotedToFollowUpConversion: number;
  followUpToClosedConversion: number;
  globalConversion: number;
}