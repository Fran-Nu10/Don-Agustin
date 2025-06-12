import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ClientsTable } from '../../components/crm/ClientsTable';
import { ClientModal } from '../../components/crm/ClientModal';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Users, Clock, CheckCircle, AlertCircle, Send, Target, Download, BarChart3 } from 'lucide-react';
import { Client, ClientFilters, ClientFormData } from '../../types/client';
import { getClients, updateClient, deleteClient } from '../../lib/supabase/clients';
import { generateClientsSummaryPDF } from '../../utils/pdfGenerator';
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
  const [filters, setFilters] = useState<ClientFilters>({
    name: '',
    status: '',
  });

  const itemsPerPage = 10;

  // Redirect if not admin
  if (!isOwner() && !isEmployee()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, filters]);

  async function loadClients() {
    try {
      setLoading(true);
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }

  function filterClients() {
    let filtered = [...clients];

    // Filter by name
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

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleUpdateClient = async (id: string, data: Partial<ClientFormData>) => {
    try {
      setIsSubmitting(true);
      await updateClient(id, data);
      await loadClients(); // Refresh the clients list
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
      await loadClients(); // Refresh the clients list
      toast.success('Cliente eliminado con éxito');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar el cliente');
    }
  };

  const handleDownloadSummary = () => {
    generateClientsSummaryPDF(filteredClients);
    toast.success('Reporte descargado exitosamente');
  };

  const handleFilterChange = (field: keyof ClientFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      status: '',
    });
  };

  // Calculate stats
  const stats = {
    total: clients.length,
    nuevo: clients.filter(c => c.status === 'nuevo').length,
    presupuesto_enviado: clients.filter(c => c.status === 'presupuesto_enviado').length,
    en_seguimiento: clients.filter(c => c.status === 'en_seguimiento').length,
    cliente_cerrado: clients.filter(c => c.status === 'cliente_cerrado').length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Panel CRM - Clientes
          </h1>
          <p className="text-secondary-500">
            Gestiona los clientes agendados y sus consultas
          </p>
        </div>
        
        <Button
          onClick={handleDownloadSummary}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Descargar Reporte PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Nuevos</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.nuevo}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Presupuesto Enviado</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.presupuesto_enviado}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 mr-4">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">En Seguimiento</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.en_seguimiento}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Cliente Cerrado</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.cliente_cerrado}</h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-secondary-400" />
              <span className="text-sm font-medium text-secondary-700">Filtros:</span>
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="pl-10"
                fullWidth
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="presupuesto_enviado">Presupuesto Enviado</option>
              <option value="en_seguimiento">En Seguimiento</option>
              <option value="cliente_cerrado">Cliente Cerrado</option>
            </select>

            {(filters.name || filters.status) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando clientes...</p>
            </div>
          ) : (
            <>
              <ClientsTable
                clients={currentClients}
                onViewClient={handleViewClient}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-secondary-500">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      ))}
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