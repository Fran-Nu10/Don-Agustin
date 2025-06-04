import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { BookingsTable } from '../../components/admin/BookingsTable';
import { Card, CardContent } from '../../components/ui/Card';
import { getBookings } from '../../lib/supabase';
import { Booking } from '../../types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function BookingsPage() {
  const { isOwner } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not owner
  if (!isOwner()) {
    return <Navigate to="/admin/dashboard\" replace />;
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const bookingsData = await getBookings();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-secondary-900">
          Gestión de Reservas
        </h1>
        <p className="text-secondary-500">
          Administra las reservas realizadas por los clientes
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando reservas...</p>
            </div>
          ) : (
            <BookingsTable bookings={bookings} />
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}