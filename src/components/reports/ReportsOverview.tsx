import React from 'react';
import { RevenueMetrics } from '../../types/reports';
import { Card, CardContent } from '../ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportsOverviewProps {
  metrics: RevenueMetrics;
}

export function ReportsOverview({ metrics }: ReportsOverviewProps) {
  const formatCurrency = (amount: number) => {
    // Convert from UYU to USD (approximate conversion rate)
    const usdAmount = amount / 40; // Using an approximate conversion rate of 40 UYU = 1 USD
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usdAmount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-bl-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className={`flex items-center space-x-1 ${getGrowthColor(metrics.revenueGrowth)}`}>
                {getGrowthIcon(metrics.revenueGrowth)}
                <span className="text-sm font-medium">
                  {formatPercentage(metrics.revenueGrowth)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 mb-1">Ingresos Totales</p>
              <h3 className="text-2xl font-bold text-secondary-900">
                {formatCurrency(metrics.totalRevenue)}
              </h3>
              <p className="text-xs text-secondary-500 mt-1">vs. mes anterior</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leads Generated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-bl-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+8.7%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 mb-1">Leads Generados</p>
              <h3 className="text-2xl font-bold text-secondary-900">
                {metrics.leadsGenerated.toLocaleString()}
              </h3>
              <p className="text-xs text-secondary-500 mt-1">este mes</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-bl-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+2.1%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 mb-1">Tasa de Conversión</p>
              <h3 className="text-2xl font-bold text-secondary-900">
                {metrics.conversionRate.toFixed(1)}%
              </h3>
              <p className="text-xs text-secondary-500 mt-1">leads a reservas</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Booking Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-bl-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 mb-1">Valor Promedio</p>
              <h3 className="text-2xl font-bold text-secondary-900">
                {formatCurrency(metrics.averageBookingValue)}
              </h3>
              <p className="text-xs text-secondary-500 mt-1">por reserva</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}