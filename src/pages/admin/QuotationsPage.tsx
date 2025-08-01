import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { QuotationsTable } from '../../components/admin/QuotationsTable';
import { QuotationModal } from '../../components/admin/QuotationModal';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Filter, FileText, Clock, CheckCircle, XCircle, Download, BarChart3 } from 'lucide-react';
import { Quotation, QuotationFilters, QuotationFormData } from '../../types/quotation';
import { getQuotations, updateQuotation } from '../../lib/supabase/quotations';
import { generateQuotationsSummaryPDF } from '../../utils/pdfGenerator';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function QuotationsPage() {
  const { isOwner, isEmployee } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<QuotationFilters>({
    name: '',
    status: '',
    department: '',
  });

  const itemsPerPage = 10;

  // Redirect if not admin
  if (!isOwner() && !isEmployee()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, filters]);

  async function loadQuotations() {
    try {
      setLoading(true);
      console.log('🚀 [QUOTATIONS PAGE] Iniciando carga de cotizaciones...');
      const quotationsData = await getQuotations();
      console.log('✅ [QUOTATIONS PAGE] Cotizaciones cargadas exitosamente:', quotationsData.length);
      setQuotations(quotationsData);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast.error('Error al cargar las cotizaciones');
    } finally {
      console.log('🏁 [QUOTATIONS PAGE] Finalizando carga de cotizaciones, setting loading to false');
      setLoading(false);
    }
  }

  function filterQuotations() {
    let filtered = [...quotations];

    // Filter by name
    if (filters.name) {
      filtered = filtered.filter(quotation =>
        quotation.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        quotation.email.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(quotation => quotation.status === filters.status);
    }

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter(quotation => quotation.department === filters.department);
    }

    setFilteredQuotations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsModalOpen(true);
  };

  const handleUpdateQuotation = async (id: string, data: Partial<QuotationFormData>) => {
    try {
      setIsSubmitting(true);
      await updateQuotation(id, data);
      await loadQuotations(); // Refresh the quotations list
      toast.success('Cotización actualizada con éxito');
      setIsModalOpen(false);
      setSelectedQuotation(null);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Error al actualizar la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSummary = () => {
    generateQuotationsSummaryPDF(filteredQuotations);
    toast.success('Reporte descargado exitosamente');
  };

  const handleFilterChange = (field: keyof QuotationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      status: '',
      department: '',
    });
  };

  // Calculate stats
  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending').length,
    processing: quotations.filter(q => q.status === 'processing').length,
    quoted: quotations.filter(q => q.status === 'quoted').length,
    closed: quotations.filter(q => q.status === 'closed').length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotations = filteredQuotations.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Gestión de Cotizaciones
          </h1>
          <p className="text-secondary-500">
            Administra las solicitudes de cotización de los clientes
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
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Total</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.total}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Pendientes</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.pending}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Procesando</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.processing}</h4>
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
                <p className="text-sm font-medium text-secondary-500">Cotizados</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.quoted}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100 mr-4">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Cerrados</p>
                <h4 className="text-2xl font-bold text-secondary-900">{stats.closed}</h4>
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
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="quoted">Cotizado</option>
              <option value="closed">Cerrado</option>
            </select>

            {(filters.name || filters.status || filters.department) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando cotizaciones...</p>
            </div>
          ) : (
            <>
              <QuotationsTable
                quotations={currentQuotations}
                onViewQuotation={handleViewQuotation}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-secondary-500">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredQuotations.length)} de {filteredQuotations.length} cotizaciones
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

      {/* Quotation Modal */}
      <QuotationModal
        quotation={selectedQuotation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuotation(null);
        }}
        onSave={handleUpdateQuotation}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
}