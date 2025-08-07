// User Types
export interface User {
  id: string;
  email: string;
  role: 'owner' | 'employee';
  created_at: string;
}

// Trip Types
export interface ItineraryDay {
  id?: string;
  day: number;
  title: string;
  description: string;
}

export interface IncludedService {
  id?: string;
  icon: string;
  title: string;
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  currency_type: 'UYU' | 'USD';
  departure_date: string;
  return_date: string;
  available_spots: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  itinerary: ItineraryDay[];
  included_services: IncludedService[];
  category: 'nacional' | 'internacional' | 'grupal';
  info_pdf_url?: string;
  info_pdf_name?: string;
  tags?: string[]; // Nueva propiedad para etiquetas como "dream"
  days?: number; // Días del paquete (manual)
  nights?: number; // Noches del paquete (manual)
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  related_posts?: string[];
}

// Booking Types
export interface Booking {
  id: string;
  trip_id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  user_id?: string;
  trip?: Trip;
}

// Form Types
export interface TripFormData {
  title: string;
  destination: string;
  description: string;
  price: number;
  currency_type: 'UYU' | 'USD';
  departure_date: string;
  return_date: string;
  available_spots: number;
  image_url: string;
  category: Trip['category'];
  itinerary: ItineraryDay[];
  included_services: IncludedService[];
  info_pdf_url?: string;
  info_pdf_name?: string;
  tags?: string[]; // Nueva propiedad para etiquetas como "dream"
  days?: number; // Días del paquete (manual)
  nights?: number; // Noches del paquete (manual)
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SearchFormData {
  destination: string;
  date: string;
  keyword: string;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface Stats {
  totalTrips: number;
  totalBookings: number;
  upcomingTrips: number;
  popularDestinations: { destination: string; count: number }[];
  bookingTrend?: number;
  averageBookingsPerDay?: number;
  categoryDistribution?: CategoryDistribution[];
  recentBookingsCount?: number;
  conversionRate?: number;
}