import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { getStats } from '../../lib/supabase';
import { Stats } from '../../types';
import { toast } from 'react-hot-toast';

export function DashboardPage() {
  const { isOwner } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    }

    if (isOwner()) {
      loadStats();
    }
  }, [isOwner]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-secondary-900">
          Dashboard
        </h1>
        <p className="text-secondary-500">
          Bienvenido al panel de administración de Don Agustín Viajes
        </p>
      </div>
      
      {isOwner() ? (
        loading ? (
          <div className="text-center py-12">
            <p className="text-secondary-500">Cargando estadísticas...</p>
          </div>
        ) : stats ? (
          <DashboardStats stats={stats} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-secondary-500">No se pudieron cargar las estadísticas</p>
            <p className="text-secondary-400 mt-2">Intenta recargar la página</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-secondary-600">
            Como empleado, tienes acceso limitado al sistema. Puedes gestionar los viajes desde el menú lateral.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}