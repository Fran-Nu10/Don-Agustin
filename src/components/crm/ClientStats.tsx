import React from 'react';
import { ClientStatsType } from '../../types/client';
import { Card, CardContent } from '../ui/Card';
import { Users, TrendingUp, Calendar, AlertTriangle, DollarSign, CheckCircle, Clock, ArrowRight, ArrowDown } from 'lucide-react';

interface ClientStatsProps {
  stats: ClientStatsType;
}

export function ClientStats({ stats }: ClientStatsProps) {
  // Format currency in USD
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    
    // For stats aggregation, we need a common currency unit
    // Convert to USD for aggregation purposes only
    const usdAmount = amount / 40;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usdAmount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <div className="p-2 rounded-full bg-indigo-100 mr-4">
                <Clock className="h-6 w-6 text-indigo-600" />
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

        {/* Potential Total Value - RENAMED */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Valor Total Potencial</p>
                <h4 className="text-2xl font-bold text-secondary-900 text-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(stats.potentialRevenue)}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Closed Clients Total Value - NEW */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Valor Total Cerrado</p>
                <h4 className="text-2xl font-bold text-secondary-900 text-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(stats.closedRevenue)}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rates Card - NEW */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tasas de Conversión del Proceso Comercial
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New to Quoted */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-blue-800">Nuevo → Presupuesto</h5>
                <span className="text-lg font-bold text-blue-700">{formatPercentage(stats.newToQuotedConversion)}</span>
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span>Leads que reciben propuesta</span>
              </div>
              <div className="mt-2 h-2 bg-blue-200 rounded-full">
                <div 
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(stats.newToQuotedConversion, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Quoted to Follow-up */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-purple-800">Presupuesto → Seguimiento</h5>
                <span className="text-lg font-bold text-purple-700">{formatPercentage(stats.quotedToFollowUpConversion)}</span>
              </div>
              <div className="flex items-center text-sm text-purple-600">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span>Presupuestos con seguimiento</span>
              </div>
              <div className="mt-2 h-2 bg-purple-200 rounded-full">
                <div 
                  className="h-2 bg-purple-600 rounded-full"
                  style={{ width: `${Math.min(stats.quotedToFollowUpConversion, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Follow-up to Closed */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-green-800">Seguimiento → Cerrado</h5>
                <span className="text-lg font-bold text-green-700">{formatPercentage(stats.followUpToClosedConversion)}</span>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span>Seguimientos que cierran</span>
              </div>
              <div className="mt-2 h-2 bg-green-200 rounded-full">
                <div 
                  className="h-2 bg-green-600 rounded-full"
                  style={{ width: `${Math.min(stats.followUpToClosedConversion, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Global Conversion */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-orange-800">Conversión Global</h5>
                <span className="text-lg font-bold text-orange-700">{formatPercentage(stats.globalConversion)}</span>
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>Nuevo → Cliente Cerrado</span>
              </div>
              <div className="mt-2 h-2 bg-orange-200 rounded-full">
                <div 
                  className="h-2 bg-orange-600 rounded-full"
                  style={{ width: `${Math.min(stats.globalConversion, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
        <Card>
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
      </div>

      {/* Revenue Distribution */}
      <Card className="md:col-span-2 lg:col-span-2">
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
              Valor total potencial: <span className="font-medium text-secondary-900">{formatCurrency(stats.potentialRevenue)}</span>
            </p>
            <p className="text-sm text-secondary-600 mt-1">
              Valor total cerrado: <span className="font-medium text-secondary-900">{formatCurrency(stats.closedRevenue)}</span>
            </p>
            <p className="text-sm text-secondary-600 mt-1">
              Clientes con valor asignado: <span className="font-medium text-secondary-900">
                {stats.clientsWithValue}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}