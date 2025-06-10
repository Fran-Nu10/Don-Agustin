import React from 'react';
import { Stats } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Map, Users, Calendar, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Chart data for popular destinations
  const chartData = {
    labels: stats.popularDestinations.map((d) => d.destination),
    datasets: [
      {
        label: 'Reservas por destino',
        data: stats.popularDestinations.map((d) => d.count),
        backgroundColor: '#FF6B00',
        borderColor: '#E66B00',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Destinos más reservados',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trips */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <Map className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Total de viajes</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.totalTrips}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <Users className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Total de reservas</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.totalBookings}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Trips */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <Calendar className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Viajes próximos</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.upcomingTrips}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Bookings per Trip */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <TrendingUp className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Promedio de reservas</p>
                <h4 className="text-2xl font-bold text-secondary-900">
                  {stats.totalTrips > 0
                    ? (stats.totalBookings / stats.totalTrips).toFixed(1)
                    : '0'}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Destinos más populares</h3>
          {stats.popularDestinations.length > 0 ? (
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-500">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p className="text-lg font-medium mb-2">Sin reservas aún</p>
                <p className="text-sm">Las estadísticas aparecerán cuando los clientes hagan reservas</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Destinations List */}
      {stats.popularDestinations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Ranking de destinos</h3>
            <div className="space-y-3">
              {stats.popularDestinations.map((destination, index) => (
                <div key={destination.destination} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-950 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-secondary-900">{destination.destination}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary-950">{destination.count}</span>
                    <span className="text-sm text-secondary-500 ml-1">
                      {destination.count === 1 ? 'reserva' : 'reservas'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}