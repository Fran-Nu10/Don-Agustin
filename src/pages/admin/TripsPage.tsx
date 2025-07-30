import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { TripForm } from '../../components/admin/TripForm';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Plus, Search, Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { Trip, TripFormData } from '../../types';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTrips } from '../../hooks/useTrips';

export function AdminTripsPage() {
  const { trips, loading, refetch, addOrUpdateTrip, removeTrip } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Paginación para mejorar rendimiento

  const handleCreateTrip = async (data: TripFormData) => {
    console.log('🚀 [CREATE TRIP] Iniciando creación de viaje...');
    console.log('📋 [CREATE TRIP] Datos del formulario:', data);
    console.log('🔍 [CREATE TRIP] Validando datos antes del envío...');
    
    // Log validation details
    console.log('✅ [CREATE TRIP] Título:', data.title);
    console.log('✅ [CREATE TRIP] Destino:', data.destination);
    console.log('✅ [CREATE TRIP] Precio (UYU):', data.price);
    console.log('✅ [CREATE TRIP] Imagen URL:', data.image_url ? 'Presente' : 'Faltante');
    console.log('✅ [CREATE TRIP] Itinerario días:', data.itinerary?.length || 0);
    console.log('✅ [CREATE TRIP] Servicios incluidos:', data.included_services?.length || 0);
    console.log('✅ [CREATE TRIP] Tags:', data.tags?.length || 0);
    
    try {
      setIsSubmitting(true);
      console.log('📝 [CREATE TRIP] Estado isSubmitting establecido a true');
      console.log('🌐 [CREATE TRIP] Llamando a createTrip API...');
      
      const startTime = Date.now();
      const newTrip = await createTrip(data);
      const endTime = Date.now();
      
      console.log('✅ [CREATE TRIP] API createTrip completada exitosamente');
      console.log('📦 [CREATE TRIP] Nuevo viaje creado:', newTrip);
      console.log('⏱️ [CREATE TRIP] Tiempo de respuesta:', (endTime - startTime), 'ms');
      
      // Optimistic update - add the new trip immediately to the UI
      console.log('🚀 [CREATE TRIP] Aplicando actualización optimista...');
      addOrUpdateTrip(newTrip);
      console.log('✅ [CREATE TRIP] Actualización optimista completada');
      
      // Background refetch to ensure data consistency
      console.log('🔄 [CREATE TRIP] Iniciando refetch en segundo plano...');
      refetch().then(() => {
        console.log('✅ [CREATE TRIP] Refetch en segundo plano completado');
      }).catch((error) => {
        console.warn('⚠️ [CREATE TRIP] Error en refetch de segundo plano:', error);
      });
      
      setShowForm(false);
      console.log('🎯 [CREATE TRIP] Formulario cerrado');
      console.log('✅ [CREATE TRIP] PROCESO COMPLETADO EXITOSAMENTE');
      toast.success('Paquete creado con éxito');
    } catch (error) {
      console.error('❌ [CREATE TRIP] Error capturado en catch block:', error);
      console.error('❌ [CREATE TRIP] Tipo de error:', typeof error);
      console.error('❌ [CREATE TRIP] Error completo:', JSON.stringify(error, null, 2));
      
      // Log additional error details
      if (error && typeof error === 'object') {
        console.error('❌ [CREATE TRIP] Error.message:', (error as any).message);
        console.error('❌ [CREATE TRIP] Error.code:', (error as any).code);
        console.error('❌ [CREATE TRIP] Error.status:', (error as any).status);
        console.error('❌ [CREATE TRIP] Error.statusText:', (error as any).statusText);
      }
      
      // Manejo robusto de errores para mostrar mensaje legible
      let errorMessage = 'Error al crear el paquete';
      if (error && typeof error === 'object' && 'message' in error) {
        const originalMessage = (error as any).message;
        console.log('🔍 [CREATE TRIP] Analizando mensaje de error:', originalMessage);
        
        if (originalMessage.includes('401') || originalMessage.includes('unauthorized')) {
          errorMessage = 'No tienes permisos para crear paquetes. Contacta al administrador.';
          console.log('🚫 [CREATE TRIP] Error identificado como: PERMISOS');
        } else if (originalMessage.includes('network') || originalMessage.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
          console.log('🌐 [CREATE TRIP] Error identificado como: CONEXIÓN');
        } else if (originalMessage.includes('JWT') || originalMessage.includes('token')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          console.log('🔑 [CREATE TRIP] Error identificado como: SESIÓN EXPIRADA');
        } else if (originalMessage.includes('413') || originalMessage.includes('too large')) {
          errorMessage = 'Los datos del paquete son demasiado grandes. Intenta reducir la cantidad de información.';
          console.log('📦 [CREATE TRIP] Error identificado como: PAYLOAD DEMASIADO GRANDE');
        } else if (originalMessage.includes('timeout')) {
          errorMessage = 'La operación tardó demasiado tiempo. Intenta nuevamente.';
          console.log('⏰ [CREATE TRIP] Error identificado como: TIMEOUT');
        } else if (originalMessage) {
          errorMessage = `Error: ${originalMessage}`;
          console.log('❓ [CREATE TRIP] Error no categorizado:', originalMessage);
        }
      }
      
      console.log('💬 [CREATE TRIP] Mensaje de error para usuario:', errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('🔄 [CREATE TRIP] Ejecutando bloque finally...');
      console.log('🔄 [CREATE TRIP] Reseteando estado isSubmitting a false');
      setIsSubmitting(false);
      // Verificación adicional para asegurar que el estado se resetee
      setTimeout(() => {
        console.log('🔍 [CREATE TRIP] Verificación final: isSubmitting debería ser false');
        setIsSubmitting(false);
      }, 100);
      console.log('✅ [CREATE TRIP] Bloque finally completado');
    }
  };

  const handleUpdateTrip = async (data: TripFormData) => {
    if (!editingTrip) return;
    
    console.log('🚀 [UPDATE TRIP] Iniciando actualización de viaje...');
    console.log('📋 [UPDATE TRIP] ID del viaje a actualizar:', editingTrip.id);
    console.log('📋 [UPDATE TRIP] Datos del formulario:', data);
    console.log('🔍 [UPDATE TRIP] Validando datos antes del envío...');
    
    // Log validation details
    console.log('✅ [UPDATE TRIP] Título:', data.title);
    console.log('✅ [UPDATE TRIP] Destino:', data.destination);
    console.log('✅ [UPDATE TRIP] Precio (UYU):', data.price);
    console.log('✅ [UPDATE TRIP] Imagen URL:', data.image_url ? 'Presente' : 'Faltante');
    console.log('✅ [UPDATE TRIP] Itinerario días:', data.itinerary?.length || 0);
    console.log('✅ [UPDATE TRIP] Servicios incluidos:', data.included_services?.length || 0);
    console.log('✅ [UPDATE TRIP] Tags:', data.tags?.length || 0);
    
    try {
      setIsSubmitting(true);
      console.log('📝 [UPDATE TRIP] Estado isSubmitting establecido a true');
      console.log('🌐 [UPDATE TRIP] Llamando a updateTrip API...');
      
      const startTime = Date.now();
      const updatedTrip = await updateTrip(editingTrip.id, data);
      const endTime = Date.now();
      
      console.log('✅ [UPDATE TRIP] API updateTrip completada exitosamente');
      console.log('📦 [UPDATE TRIP] Viaje actualizado:', updatedTrip);
      console.log('⏱️ [UPDATE TRIP] Tiempo de respuesta:', (endTime - startTime), 'ms');
      
      // Optimistic update - update the trip immediately in the UI
      console.log('🚀 [UPDATE TRIP] Aplicando actualización optimista...');
      addOrUpdateTrip(updatedTrip);
      console.log('✅ [UPDATE TRIP] Actualización optimista completada');
      
      // Background refetch to ensure data consistency
      console.log('🔄 [UPDATE TRIP] Iniciando refetch en segundo plano...');
      refetch().then(() => {
        console.log('✅ [UPDATE TRIP] Refetch en segundo plano completado');
      }).catch((error) => {
        console.warn('⚠️ [UPDATE TRIP] Error en refetch de segundo plano:', error);
      });
      
      setEditingTrip(null);
      console.log('🎯 [UPDATE TRIP] Modo edición desactivado');
      console.log('✅ [UPDATE TRIP] PROCESO COMPLETADO EXITOSAMENTE');
      toast.success('Paquete actualizado con éxito');
    } catch (error) {
      console.error('❌ [UPDATE TRIP] Error capturado en catch block:', error);
      console.error('❌ [UPDATE TRIP] Tipo de error:', typeof error);
      console.error('❌ [UPDATE TRIP] Error completo:', JSON.stringify(error, null, 2));
      
      // Log additional error details
      if (error && typeof error === 'object') {
        console.error('❌ [UPDATE TRIP] Error.message:', (error as any).message);
        console.error('❌ [UPDATE TRIP] Error.code:', (error as any).code);
        console.error('❌ [UPDATE TRIP] Error.status:', (error as any).status);
        console.error('❌ [UPDATE TRIP] Error.statusText:', (error as any).statusText);
      }
      
      // Manejo robusto de errores para mostrar mensaje legible
      let errorMessage = 'Error al actualizar el paquete';
      if (error && typeof error === 'object' && 'message' in error) {
        const originalMessage = (error as any).message;
        console.log('🔍 [UPDATE TRIP] Analizando mensaje de error:', originalMessage);
        
        if (originalMessage.includes('401') || originalMessage.includes('unauthorized')) {
          errorMessage = 'No tienes permisos para actualizar paquetes. Contacta al administrador.';
          console.log('🚫 [UPDATE TRIP] Error identificado como: PERMISOS');
        } else if (originalMessage.includes('network') || originalMessage.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
          console.log('🌐 [UPDATE TRIP] Error identificado como: CONEXIÓN');
        } else if (originalMessage.includes('JWT') || originalMessage.includes('token')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          console.log('🔑 [UPDATE TRIP] Error identificado como: SESIÓN EXPIRADA');
        } else if (originalMessage.includes('413') || originalMessage.includes('too large')) {
          errorMessage = 'Los datos del paquete son demasiado grandes. Intenta reducir la cantidad de información.';
          console.log('📦 [UPDATE TRIP] Error identificado como: PAYLOAD DEMASIADO GRANDE');
        } else if (originalMessage.includes('timeout')) {
          errorMessage = 'La operación tardó demasiado tiempo. Intenta nuevamente.';
          console.log('⏰ [UPDATE TRIP] Error identificado como: TIMEOUT');
        } else if (originalMessage) {
          errorMessage = `Error: ${originalMessage}`;
          console.log('❓ [UPDATE TRIP] Error no categorizado:', originalMessage);
        }
      }
      
      console.log('💬 [UPDATE TRIP] Mensaje de error para usuario:', errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('🔄 [UPDATE TRIP] Ejecutando bloque finally...');
      console.log('🔄 [UPDATE TRIP] Reseteando estado isSubmitting a false');
      setIsSubmitting(false);
      // Verificación adicional para asegurar que el estado se resetee
      setTimeout(() => {
        console.log('🔍 [UPDATE TRIP] Verificación final: isSubmitting debería ser false');
        setIsSubmitting(false);
      }, 100);
      console.log('✅ [UPDATE TRIP] Bloque finally completado');
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.')) {
      return;
    }
    
    console.log('🗑️ [DELETE TRIP] Iniciando eliminación de viaje:', id);
    
    try {
      console.log('🌐 [DELETE TRIP] Llamando a deleteTrip API...');
      await deleteTrip(id);
      console.log('✅ [DELETE TRIP] API deleteTrip completada exitosamente');
      
      // Optimistic update - remove the trip immediately from the UI
      console.log('🚀 [DELETE TRIP] Aplicando actualización optimista...');
      removeTrip(id);
      console.log('✅ [DELETE TRIP] Actualización optimista completada');
      
      // Background refetch to ensure data consistency
      console.log('🔄 [DELETE TRIP] Iniciando refetch en segundo plano...');
      refetch().then(() => {
        console.log('✅ [DELETE TRIP] Refetch en segundo plano completado');
      }).catch((error) => {
        console.warn('⚠️ [DELETE TRIP] Error en refetch de segundo plano:', error);
      });
      
      toast.success('Paquete eliminado con éxito');
      console.log('✅ [DELETE TRIP] PROCESO COMPLETADO EXITOSAMENTE');
    } catch (error) {
      console.error('❌ [DELETE TRIP] Error capturado:', error);
      toast.error('Error al eliminar el paquete');
    }
  };

  // Función mejorada para manejar la visualización del PDF
  const handleViewPdf = (pdfUrl: string, pdfName: string) => {
    if (!pdfUrl) {
      toast.error('No hay URL de PDF disponible');
      return;
    }

    try {
      // Abrir en una nueva pestaña
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      
      // Mostrar mensaje de éxito
      toast.success('PDF abierto en nueva pestaña');
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      toast.error('No se pudo abrir el PDF. Verifica que la URL sea válida.');
    }
  };

  // Filter trips based on search
  const filteredTrips = trips.filter((trip) => {
    return (
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Gestión de Paquetes
          </h1>
          <p className="text-secondary-500">
            Administra los paquetes disponibles en la plataforma
          </p>
        </div>
        
        <Button onClick={() => {
          setEditingTrip(null);
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo paquete
        </Button>
      </div>
      
      {/* Trip Form */}
      {(showForm || editingTrip) && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              {editingTrip ? 'Editar paquete' : 'Crear nuevo paquete'}
            </h2>
          </CardHeader>
          <CardContent>
            <TripForm
              initialData={editingTrip || undefined}
              onSubmit={editingTrip ? handleUpdateTrip : handleCreateTrip}
              isSubmitting={isSubmitting}
            />
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingTrip(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por título, destino o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Trips List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-secondary-500">Cargando paquetes...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-500">No hay paquetes que coincidan con tu búsqueda.</p>
          <p className="text-secondary-400 mt-2">Intenta con otros términos o crea un nuevo paquete.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-card overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Trip Image */}
                <div className="h-48 md:h-full">
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Trip Info */}
                <div className="p-6 md:col-span-2">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-secondary-900">
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-secondary-600">{trip.destination}</span>
                        <span className="text-sm bg-primary-100 text-primary-950 px-2 py-1 rounded-full">
                          {trip.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary-950">
                      ${trip.price.toLocaleString('es-UY')}
                    </div>
                  </div>
                  
                  <p className="text-secondary-700 mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-600 mb-4">
                    <span>{trip.available_spots} cupos disponibles</span>
                    <span>•</span>
                    <span>{trip.itinerary?.length || 0} días de itinerario</span>
                    <span>•</span>
                    <span>{trip.included_services?.length || 0} servicios incluidos</span>
                    {trip.info_pdf_url && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-green-600 font-medium">
                          <FileText className="h-4 w-4 mr-1" />
                          PDF disponible
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-auto">
                    {trip.info_pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPdf(trip.info_pdf_url!, trip.info_pdf_name || 'documento.pdf')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver PDF
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/viajes/${trip.id}`, '_blank')}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vista previa
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrip(trip);
                        setShowForm(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}