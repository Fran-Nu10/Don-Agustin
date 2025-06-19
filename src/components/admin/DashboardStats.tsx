import React from 'react';
import { Stats } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Map, Users, Calendar, TrendingUp, TrendingDown, Activity, Target, BarChart3, Clock, Zap } from 'lucide-react';
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
        label: 'Cotizaciones por destino',
        data: stats.popularDestinations.map((d) => d.count),
        backgroundColor: '#FF6B00',
        borderColor: '#E66B00',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Destinos más solicitados',
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
      {/* Main Stats Cards */}
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

        {/* Total Quotations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <Users className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Total de cotizaciones</p>
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

        {/* Avg Quotations per Trip */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 mr-4">
                <TrendingUp className="h-6 w-6 text-primary-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Promedio de cotizaciones</p>
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

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Destinos más solicitados</h3>
            {stats.popularDestinations.length > 0 ? (
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-secondary-400">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                  <p className="text-lg font-medium mb-2">Sin cotizaciones aún</p>
                  <p className="text-sm">Las estadísticas aparecerán cuando los clientes soliciten cotizaciones</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Analytics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Análisis de Tendencias</h3>
            <div className="space-y-4">
              {/* Quotation Trend */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    (stats.bookingTrend || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {(stats.bookingTrend || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Tendencia semanal</p>
                    <p className="text-xs text-secondary-500">vs. semana anterior</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    (stats.bookingTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(stats.bookingTrend || 0) >= 0 ? '+' : ''}{stats.bookingTrend || 0}%
                  </span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Cotizaciones recientes</p>
                    <p className="text-xs text-secondary-500">últimos 7 días</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-purple-600">
                    {stats.recentBookingsCount || 0}
                  </span>
                </div>
              </div>

              {/* Average per Day */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-orange-100 mr-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Promedio diario</p>
                    <p className="text-xs text-secondary-500">últimos 30 días</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-600">
                    {stats.averageBookingsPerDay || 0}
                  </span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Tasa de conversión</p>
                    <p className="text-xs text-secondary-500">cotizaciones por viaje</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {stats.conversionRate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Rankings and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations Ranking */}
        {stats.popularDestinations.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary-950" />
                Ranking de destinos
              </h3>
              <div className="space-y-3">
                {stats.popularDestinations.map((destination, index) => (
                  <div key={destination.destination} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-primary-950 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-secondary-900">{destination.destination}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary-950">{destination.count}</span>
                      <span className="text-sm text-secondary-500 ml-1">
                        {destination.count === 1 ? 'cotización' : 'cotizaciones'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Distribution */}
        {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary-950" />
                Distribución por categoría
              </h3>
              <div className="space-y-4">
                {stats.categoryDistribution.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-secondary-900">{category.category}</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary-950">{category.count}</span>
                        <span className="text-sm text-secondary-500 ml-2">
                          ({category.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}