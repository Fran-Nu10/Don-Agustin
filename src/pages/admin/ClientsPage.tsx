import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ClientsTable } from '../../components/crm/ClientsTable';
import { ClientModal } from '../../components/crm/ClientModal';
import { AdvancedFilters } from '../../components/crm/AdvancedFilters';
import { ClientStats } from '../../components/crm/ClientStats';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, BarChart3, FileText, Users, Filter, Calendar, Plus } from 'lucide-react';
import { Client, ClientFilters, ClientFormData, ClientStatsType } from '../../types/client';
import { getClients, updateClient, deleteClient } from '../../lib/supabase/clients';
import { getTrips } from '../../lib/supabase';
import { generateClientPDF, generateClientsSummaryPDF, generateClientsByStatusPDF, generateClientsBySourcePDF } from '../../utils/pdfGenerator';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ClientsPage() {
  const { isOwner, isEmployee } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stats, setStats] = useState<ClientStatsType | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [filters, setFilters] = useState<ClientFilters>({
    name: '',
    status: '',
    source: '',
    priority: '',
    dateRange: { start: '', end: '' },
    budgetRange: '',
    destination: '',
    tags: [],
  });

  const itemsPerPage = 10;

  // Redirect if not admin
  if (!isOwner() && !isEmployee()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
    calculateStats();
  }, [clients, filters]);

  async function loadData() {
    try {
      setLoading(true);
      const [clientsData, tripsData] = await Promise.all([
        getClients(),
        getTrips()
      ]);
      setClients(clientsData);
      
      // Extract unique destinations from trips
      const uniqueDestinations = [...new Set(tripsData.map(trip => trip.destination))].sort();
      setDestinations(uniqueDestinations);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  function filterClients() {
    let filtered = [...clients];

    // Filter by name/email
    if (filters.name) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(client => client.status === filters.status);
    }

    // Filter by source
    if (filters.source) {
      filtered = filtered.filter(client => client.source === filters.source);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(client => client.priority === filters.priority);
    }

    // Filter by destination - usar preferred_destination del cliente
    if (filters.destination) {
      filtered = filtered.filter(client => 
        client.preferred_destination === filters.destination ||
        (client.message && client.message.toLowerCase().includes(filters.destination.toLowerCase()))
      );
    }

    // Filter by date range
    if (filters.dateRange.start) {
      filtered = filtered.filter(client => 
        new Date(client.created_at) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(client => 
        new Date(client.created_at) <= new Date(filters.dateRange.end)
      );
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(client => 
        client.tags && filters.tags.some(tag => client.tags!.includes(tag))
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1);
  }

  function calculateStats() {
    const total = clients.length;
    
    // Status distribution
    const byStatus = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Source distribution
    const bySource = clients.reduce((acc, client) => {
      const source = client.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const byPriority = clients.reduce((acc, client) => {
      const priority = client.priority || 'normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversion rate (closed clients / total clients)
    const closedClientsCount = clients.filter(c => c.status === 'cliente_cerrado').length;
    const conversionRate = total > 0 ? (closedClientsCount / total) * 100 : 0;

    // Upcoming follow-ups
    const now = new Date();
    const upcomingFollowUps = clients.filter(client => 
      client.next_follow_up && new Date(client.next_follow_up) > now
    ).length;

    // Overdue follow-ups
    const overdueFollowUps = clients.filter(client => 
      client.next_follow_up && new Date(client.next_follow_up) < now
    ).length;

    // Average response time (mock calculation)
    const avgResponseTime = 24; // This would be calculated based on actual response times

    // Calculate potential revenue from clients that are not closed
    const potentialClients = clients.filter(client => client.status !== 'cliente_cerrado' && client.status !== 'cliente_perdido');
    const potentialRevenue = potentialClients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
    
    // Calculate closed revenue from clients with 'cliente_cerrado' status
    const closedClients = clients.filter(client => client.status === 'cliente_cerrado');
    const closedRevenue = closedClients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
    
    // Calculate average trip value
    const clientsWithValue = clients.filter(client => client.trip_value && client.trip_value > 0);
    const averageTripValue = clientsWithValue.length > 0 
      ? clientsWithValue.reduce((sum, client) => sum + (client.trip_value || 0), 0) / clientsWithValue.length
      : 0;

    setStats({
      total,
      byStatus,
      bySource,
      byPriority,
      conversionRate,
      avgResponseTime,
      upcomingFollowUps,
      overdueFollowUps,
      potentialRevenue,
      closedRevenue,
      averageTripValue,
      clientsWithValue: clientsWithValue.length,
    });
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleUpdateClient = async (id: string, data: Partial<ClientFormData>) => {
    try {
      setIsSubmitting(true);
      await updateClient(id, data);
      await loadData();
      toast.success('Cliente actualizado con éxito');
      setIsModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Error al actualizar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      await loadData();
      toast.success('Cliente eliminado con éxito');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar el cliente');
    }
  };

  const handleFilterChange = (field: keyof ClientFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      status: '',
      source: '',
      priority: '',
      dateRange: { start: '', end: '' },
      budgetRange: '',
      destination: '',
      tags: [],
    });
  };

  // Get unique tags for filters
  const availableTags = [...new Set(clients.flatMap(c => c.tags || []))];

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // PDF Export functions
  const handleDownloadSummary = () => {
    generateClientsSummaryPDF(filteredClients);
    toast.success('Reporte descargado exitosamente');
  };

  const handleDownloadByStatus = (status: string) => {
    const clientsByStatus = filteredClients.filter(c => c.status === status);
    generateClientsByStatusPDF(clientsByStatus, status);
    toast.success(`Reporte de clientes ${status} descargado exitosamente`);
  };

  const handleDownloadBySource = (source: string) => {
    const clientsBySource = filteredClients.filter(c => c.source === source);
    generateClientsBySourcePDF(clientsBySource, source);
    toast.success(`Reporte de clientes por ${source} descargado exitosamente`);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            CRM Profesional - Gestión de Clientes
          </h1>
          <p className="text-secondary-500">
            Sistema avanzado de gestión de relaciones con clientes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
          
          <div className="relative group">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button
                  onClick={handleDownloadSummary}
                  className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reporte Completo
                </button>
                
                <div className="border-t border-secondary-200 my-1"></div>
                <div className="px-4 py-2 text-xs font-medium text-secondary-500 uppercase">
                  Por Estado
                </div>
                
                {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => handleDownloadByStatus(status)}
                    className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-secondary-500">({count})</span>
                  </button>
                ))}
                
                <div className="border-t border-secondary-200 my-1"></div>
                <div className="px-4 py-2 text-xs font-medium text-secondary-500 uppercase">
                  Por Fuente
                </div>
                
                {Object.entries(stats?.bySource || {}).map(([source, count]) => (
                  <button
                    key={source}
                    onClick={() => handleDownloadBySource(source)}
                    className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {source.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-secondary-500">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && <ClientStats stats={stats} />}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          destinations={destinations}
          availableTags={availableTags}
        />
      )}

      {/* Clients Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando clientes...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-secondary-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
                  {filteredClients.length !== clients.length && (
                    <span className="ml-2 text-primary-600 font-medium">
                      (filtrados de {clients.length} total)
                    </span>
                  )}
                </div>
              </div>

              <ClientsTable
                clients={currentClients}
                onViewClient={handleViewClient}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-secondary-500">
                    Página {currentPage} de {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === page
                                ? 'bg-primary-950 text-white'
                                : 'text-secondary-600 hover:bg-secondary-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-secondary-500">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === totalPages
                                ? 'bg-primary-950 text-white'
                                : 'text-secondary-600 hover:bg-secondary-100'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Client Modal */}
      <ClientModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleUpdateClient}
        onDelete={handleDeleteClient}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
}