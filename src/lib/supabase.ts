import { User, Trip, Booking, Stats } from '../types';
import { users, trips, bookings, stats } from './mockData';

// Authentication functions
export async function signIn(email: string, password: string) {
  const user = users.find(u => u.email === email);
  if (!user || password !== 'password') {
    throw new Error('Invalid credentials');
  }
  return { user };
}

export async function signOut() {
  // Mock sign out
  return;
}

export async function getCurrentUser(): Promise<User | null> {
  // For demo purposes, always return the owner user
  return users[0];
}

// Trip functions
export async function getTrips(): Promise<Trip[]> {
  return trips;
}

export async function getTrip(id: string): Promise<Trip | null> {
  return trips.find(trip => trip.id === id) || null;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
  const newTrip: Trip = {
    id: String(trips.length + 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...trip,
  };
  trips.push(newTrip);
  return newTrip;
}

export async function updateTrip(id: string, tripUpdate: Partial<Trip>): Promise<Trip> {
  const index = trips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');
  
  trips[index] = {
    ...trips[index],
    ...tripUpdate,
    updated_at: new Date().toISOString(),
  };
  
  return trips[index];
}

export async function deleteTrip(id: string): Promise<void> {
  const index = trips.findIndex(t => t.id === id);
  if (index !== -1) {
    trips.splice(index, 1);
  }
}

// Booking functions
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  const newBooking: Booking = {
    id: String(bookings.length + 1),
    created_at: new Date().toISOString(),
    ...booking,
    trip: trips.find(t => t.id === booking.trip_id),
  };
  bookings.push(newBooking);
  return newBooking;
}

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getBookingsByTrip(tripId: string): Promise<Booking[]> {
  return bookings.filter(booking => booking.trip_id === tripId);
}

// Stats functions
export async function getStats(): Promise<Stats> {
  return stats;
}