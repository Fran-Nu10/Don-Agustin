// User Types
export interface User {
  id: string;
  email: string;
  role: 'owner' | 'employee';
  created_at: string;
}

// Trip Types
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface IncludedService {
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
  departure_date: string;
  return_date: string;
  available_spots: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  itinerary: ItineraryDay[];
  included_services: IncludedService[];
  category: 'nacional' | 'internacional' | 'religioso' | 'aventura' | 'escapada';
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
  trip?: Trip;
}

// Form Types
export interface TripFormData {
  title: string;
  destination: string;
  description: string;
  price: number;
  departure_date: string;
  return_date: string;
  available_spots: number;
  image_url: string;
  itinerary: ItineraryDay[];
  included_services: IncludedService[];
  category: Trip['category'];
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

export interface Stats {
  totalTrips: number;
  totalBookings: number;
  upcomingTrips: number;
  popularDestinations: { destination: string; count: number }[];
}