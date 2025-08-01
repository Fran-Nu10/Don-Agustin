import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ReportsOverview } from '../../components/reports/ReportsOverview';
import { RevenueChart } from '../../components/reports/RevenueChart';
import { CategoryChart } from '../../components/reports/CategoryChart';
import { SourcesChart } from '../../components/reports/SourcesChart';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BarChart3, TrendingUp, DollarSign, Users, Target, Download, Calendar, Filter, PieChart, Activity } from 'lucide-react';
import { ReportsData, RevenueMetrics, ReportFilters } from '../../types/reports';
import { getReportsData } from '../../lib/supabase/reports';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ReportsPage() {
  const { isOwner, isEmployee } = useAuth();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
    category: '',
    period: 'monthly',
    comparison: 'previous_period',
  });

  // Redirect if not admin
  if (!isOwner() && !isEmployee()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadReportsData();
  }, [filters]);

  async function loadReportsData() {
    try {
      setLoading(true);
      console.log('🚀 [REPORTS PAGE] Iniciando carga de datos de reportes...');
      const data = await getReportsData(filters);
      console.log('✅ [REPORTS PAGE] Datos de reportes cargados exitosamente');
      setReportsData(data);
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Error al cargar los datos de reportes');
    } finally {
      console.log('🏁 [REPORTS PAGE] Finalizando carga de reportes, setting loading to false');
      setLoading(false);
    }
  }

  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExportReport = () => {
    // TODO: Implement PDF export functionality
    toast.success('Funcionalidad de exportación en desarrollo');
  };

  // Format currency in USD
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    
    // Convert from UYU to USD (approximate conversion rate)
    const usdAmount = amount / 40; // Using an approximate conversion rate of 40 UYU = 1 USD
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usdAmount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
          <p className="text-secondary-500">Cargando reportes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Reportes Financieros
          </h1>
          <p className="text-secondary-500">
            Análisis detallado de ingresos, conversiones y rendimiento
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExportReport}
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-heading font-bold text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Reporte
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Fecha de inicio
              </label>
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Fecha de fin
              </label>
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las categorías</option>
                <option value="nacional">Nacional</option>
                <option value="internacional">Internacional</option>
                <option value="grupal">Grupal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Período
              </label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Overview */}
      {reportsData && (
        <>
          <ReportsOverview metrics={reportsData.metrics} />
          
          {/* Revenue History Chart */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Evolución de Ingresos
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.revenueHistory.length > 0 ? (
                <RevenueChart data={reportsData.revenueHistory} />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No hay datos históricos disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Performance Chart */}
            <Card>
              <CardHeader>
                <h3 className="font-heading font-bold text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Distribución por Categoría
                </h3>
              </CardHeader>
              <CardContent>
                {reportsData.categoryPerformance.length > 0 ? (
                  <CategoryChart data={reportsData.categoryPerformance} />
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-500">No hay datos de categorías disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Sources Chart */}
            <Card>
              <CardHeader>
                <h3 className="font-heading font-bold text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ingresos por Fuente
                </h3>
              </CardHeader>
              <CardContent>
                {reportsData.revenueSources.length > 0 ? (
                  <SourcesChart data={reportsData.revenueSources} />
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-500">No hay datos de fuentes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Revenue Section */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Ingresos por Cliente
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.clientRevenueData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Client Revenue */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-green-800">Valor Total</h4>
                      <div className="bg-green-200 p-2 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {formatCurrency(reportsData.clientRevenueData.totalClientRevenue)}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Valor total de viajes asignados a clientes
                    </p>
                  </div>

                  {/* Average Client Value */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-blue-800">Valor Promedio</h4>
                      <div className="bg-blue-200 p-2 rounded-full">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {formatCurrency(reportsData.clientRevenueData.averageClientValue)}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Valor promedio por cliente
                    </p>
                  </div>

                  {/* Top Clients */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <h4 className="font-bold text-lg text-purple-800 mb-4">Clientes Top</h4>
                    {reportsData.clientRevenueData.topClients.length > 0 ? (
                      <div className="space-y-3">
                        {reportsData.clientRevenueData.topClients.map((client, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-bold text-purple-800">{index + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-purple-800 truncate max-w-[120px]">
                                {client.name}
                              </span>
                            </div>
                            <span className="font-bold text-purple-700">
                              {formatCurrency(client.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-purple-600">No hay datos disponibles</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Performance Details */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Rendimiento Detallado por Categoría
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.categoryPerformance.length > 0 ? (
                <div className="space-y-4">
                  {reportsData.categoryPerformance.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-4 ${
                          index === 0 ? 'bg-orange-500' :
                          index === 1 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-secondary-900">{category.category}</h4>
                          <p className="text-sm text-secondary-600">
                            {category.bookings} reservas • {category.marketShare.toFixed(1)}% del mercado
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary-950">
                          {formatCurrency(category.revenue)}
                        </p>
                        <p className={`text-sm flex items-center ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth >= 0 ? '↗' : '↘'} {Math.abs(category.growth).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No hay datos de categorías disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Sources Details */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Análisis de Fuentes de Ingresos
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.revenueSources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportsData.revenueSources.map((source, index) => (
                    <div key={index} className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg border border-secondary-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-secondary-900">{source.source}</h4>
                        <span className="text-2xl font-bold text-primary-950">
                          {source.percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Ingresos:</span>
                          <span className="font-medium text-secondary-900">
                            {formatCurrency(source.amount)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Reservas:</span>
                          <span className="font-medium text-secondary-900">
                            {source.bookings}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-secondary-600">ROI:</span>
                          <span className={`font-medium ${source.roi > 200 ? 'text-green-600' : source.roi > 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {source.roi}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-secondary-200 rounded-full h-2 mt-4">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No hay datos de fuentes disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Performance */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Rendimiento del Equipo de Ventas
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.salesPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Vendedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Leads
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Oportunidades
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Ingresos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Conversión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Ticket Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {reportsData.salesPerformance.map((performance, index) => (
                        <tr key={index} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-primary-950 font-medium text-sm">
                                  {performance.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-secondary-900">
                                {performance.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            {performance.leads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            {performance.opportunities}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                            {formatCurrency(performance.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              performance.conversionRate >= 30 ? 'bg-green-100 text-green-800' :
                              performance.conversionRate >= 20 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {performance.conversionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            {formatCurrency(performance.averageDealSize)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No hay datos de rendimiento disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Targets */}
          <Card>
            <CardHeader>
              <h3 className="font-heading font-bold text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Objetivos Financieros y Metas
              </h3>
            </CardHeader>
            <CardContent>
              {reportsData.targets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportsData.targets.map((target, index) => {
                    // Convert values to USD
                    const revenueTargetUSD = target.revenueTarget / 40;
                    const actualRevenueUSD = target.actualRevenue / 40;
                    
                    return (
                      <div key={index} className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-6 rounded-lg border border-secondary-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg text-secondary-900 capitalize">
                            {target.targetType === 'monthly' ? 'Mensual' :
                             target.targetType === 'quarterly' ? 'Trimestral' :
                             'Anual'} - {target.targetPeriod}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            target.achievementRate >= 100 ? 'bg-green-100 text-green-800' :
                            target.achievementRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            target.achievementRate >= 50 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {target.achievementRate.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-secondary-600 font-medium">💰 Ingresos</span>
                              <span className="font-bold text-secondary-900">
                                USD {actualRevenueUSD.toLocaleString('en-US')} / USD {revenueTargetUSD.toLocaleString('en-US')}
                              </span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                                style={{ width: `${Math.min((target.actualRevenue / target.revenueTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-secondary-600 font-medium">📋 Reservas</span>
                              <span className="font-bold text-secondary-900">
                                {target.actualBookings} / {target.bookingsTarget}
                              </span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                                style={{ width: `${Math.min((target.actualBookings / target.bookingsTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-secondary-600 font-medium">🎯 Leads</span>
                              <span className="font-bold text-secondary-900">
                                {target.actualLeads} / {target.leadsTarget}
                              </span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                                style={{ width: `${Math.min((target.actualLeads / target.leadsTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-secondary-600 font-medium">📈 Conversión</span>
                              <span className="font-bold text-secondary-900">
                                {target.actualConversion.toFixed(1)}% / {target.conversionTarget.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                                style={{ width: `${Math.min((target.actualConversion / target.conversionTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500 mb-4">No hay objetivos configurados</p>
                  <p className="text-sm text-secondary-400">
                    Los objetivos se configuran automáticamente desde la base de datos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}