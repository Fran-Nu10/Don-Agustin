import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { TripCard } from '../../components/trips/TripCard';
import { TripForm } from '../../components/admin/TripForm';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Plus, Search, Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { Trip, TripFormData } from '../../types';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTrips } from '../../hooks/useTrips';

export function AdminTripsPage() {
  const { trips, loading, refetch } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateTrip = async (data: TripFormData) => {
    try {
      setIsSubmitting(true);
      await createTrip(data);
      await refetch(); // Refresh the trips list
      setShowForm(false);
      toast.success('Viaje creado con éxito');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Error al crear el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTrip = async (data: TripFormData) => {
    if (!editingTrip) return;
    
    try {
      setIsSubmitting(true);
      await updateTrip(editingTrip.id, data);
      await refetch(); // Refresh the trips list
      setEditingTrip(null);
      toast.success('Viaje actualizado con éxito');
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Error al actualizar el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteTrip(id);
      await refetch(); // Refresh the trips list
      toast.success('Viaje eliminado con éxito');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Error al eliminar el viaje');
    }
  };

  // Función mejorada para manejar la visualización del PDF - COMPLETAMENTE REESCRITA
  const handleViewPdf = (pdfUrl: string, pdfName: string) => {
    try {
      // Verificar si la URL es válida
      if (!pdfUrl || pdfUrl.trim() === '') {
        toast.error('No hay URL de PDF disponible');
        return;
      }

      // Para URLs externas válidas, abrir en nueva pestaña con un enfoque más robusto
      if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
        // Crear un iframe temporal invisible
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Usar el iframe para abrir el PDF, lo que evita problemas de bloqueo de popups
        if (iframe.contentWindow) {
          iframe.contentWindow.document.open();
          iframe.contentWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${pdfName}</title>
                <style>
                  body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                  .pdf-container { width: 100%; height: 100vh; }
                </style>
              </head>
              <body>
                <embed class="pdf-container" src="${pdfUrl}" type="application/pdf" />
              </body>
            </html>
          `);
          iframe.contentWindow.document.close();
          
          // Abrir en nueva pestaña
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(iframe.contentWindow.document.documentElement.outerHTML);
            newWindow.document.close();
            // Eliminar el iframe temporal
            setTimeout(() => document.body.removeChild(iframe), 100);
          } else {
            toast.error('El navegador ha bloqueado la apertura del PDF. Por favor, permite las ventanas emergentes para este sitio.');
            // Ofrecer descarga directa como alternativa
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = pdfName || 'documento.pdf';
            link.target = '_blank';
            link.click();
          }
        }
      } else {
        toast.error('URL de PDF no válida');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error('No se pudo abrir el PDF. Intenta descargarlo directamente.');
      
      // Ofrecer descarga como alternativa
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfName || 'documento.pdf';
      link.target = '_blank';
      link.click();
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

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Gestión de Viajes
          </h1>
          <p className="text-secondary-500">
            Administra los viajes disponibles en la plataforma
          </p>
        </div>
        
        <Button onClick={() => {
          setEditingTrip(null);
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo viaje
        </Button>
      </div>
      
      {/* Trip Form */}
      {(showForm || editingTrip) && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              {editingTrip ? 'Editar viaje' : 'Crear nuevo viaje'}
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
          <p className="text-secondary-500">Cargando viajes...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-500">No hay viajes que coincidan con tu búsqueda.</p>
          <p className="text-secondary-400 mt-2">Intenta con otros términos o crea un nuevo viaje.</p>
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