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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading dashboard statistics...');
        const statsData = await getStats();
        console.log('Statistics loaded successfully:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
        setError('Error al cargar las estadísticas. Por favor, intenta recargar la página.');
        toast.error('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    }

    if (isOwner()) {
      loadStats();
    }
    
    // Removed the interval that refreshed stats every 30 seconds
    
  }, [isOwner]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-secondary-900">
          Dashboard
        </h1>
        <p className="text-secondary-500">
          Bienvenido al panel de administración de TravelSuite360
        </p>
      </div>
      
      {isOwner() ? (
        loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
            <p className="text-secondary-500">Cargando estadísticas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => getStats().then(setStats).catch(e => console.error(e))}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Reintentar
            </button>
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