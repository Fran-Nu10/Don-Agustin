import React from 'react';
import { ClientStatsType } from '../../types/client';
import { Card, CardContent } from '../ui/Card';
import { Users, TrendingUp, Calendar, AlertTriangle, DollarSign } from 'lucide-react';

interface ClientStatsProps {
  stats: ClientStatsType;
}

export function ClientStats({ stats }: ClientStatsProps) {
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Clients */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500">Total Clientes</p>
              <h4 className="text-2xl font-bold text-secondary-900">{stats.total}</h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500">Tasa de Conversión</p>
              <h4 className="text-2xl font-bold text-secondary-900">{stats.conversionRate.toFixed(1)}%</h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Follow-ups */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500">Seguimientos Próximos</p>
              <h4 className="text-2xl font-bold text-secondary-900">{stats.upcomingFollowUps}</h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500">Alta Prioridad</p>
              <h4 className="text-2xl font-bold text-secondary-900">
                {(stats.byPriority.alta || 0) + (stats.byPriority.urgente || 0)}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500">Valor Total</p>
              <h4 className="text-2xl font-bold text-secondary-900">
                {formatCurrency(stats.totalRevenue)}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <h4 className="font-semibold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Distribución por Estado
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {status.replace('_', ' ')}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution Details */}
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <h4 className="font-semibold text-secondary-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Distribución por Prioridad
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {priority === 'urgente' ? 'Urgente' : 
                   priority === 'alta' ? 'Alta' : 
                   priority === 'media' ? 'Media' : 
                   priority === 'baja' ? 'Baja' : 
                   priority === 'normal' ? 'Normal' : priority}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'urgente' ? 'bg-red-600' :
                        priority === 'alta' ? 'bg-orange-600' :
                        priority === 'media' ? 'bg-yellow-600' :
                        priority === 'baja' ? 'bg-green-600' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardContent className="p-6">
          <h4 className="font-semibold text-secondary-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Valor Promedio por Cliente
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Valor promedio</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.averageTripValue)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <p className="text-sm text-secondary-600">
              Valor total de viajes: <span className="font-medium text-secondary-900">{formatCurrency(stats.totalRevenue)}</span>
            </p>
            <p className="text-sm text-secondary-600 mt-1">
              Clientes con valor asignado: <span className="font-medium text-secondary-900">
                {stats.total > 0 ? Math.round((stats.totalRevenue || 0) / (stats.averageTripValue || 1)) : 0}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}