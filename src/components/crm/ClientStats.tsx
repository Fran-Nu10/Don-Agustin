import React from 'react';
import { ClientStatsType } from '../../types/client';
import { Card, CardContent } from '../ui/Card';
import { Users, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface ClientStatsProps {
  stats: ClientStatsType;
}

export function ClientStats({ stats }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                {(stats.byPriority.high || 0) + (stats.byPriority.urgent || 0)}
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
                  {priority === 'urgent' ? 'Urgente' : 
                   priority === 'high' ? 'Alta' : 
                   priority === 'medium' ? 'Media' : 
                   priority === 'low' ? 'Baja' : 
                   priority === 'normal' ? 'Normal' : priority}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'urgent' ? 'bg-red-600' :
                        priority === 'high' ? 'bg-orange-600' :
                        priority === 'medium' ? 'bg-yellow-600' :
                        priority === 'low' ? 'bg-green-600' :
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
    </div>
  );
}