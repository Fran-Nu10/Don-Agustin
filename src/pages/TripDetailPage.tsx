import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { QuotationRequestForm } from '../components/trips/QuotationRequestForm';
import { TripItinerary } from '../components/trips/TripItinerary';
import { IncludedServices } from '../components/trips/IncludedServices';
import { RelatedTrips } from '../components/trips/RelatedTrips';
import { getTrip, getTrips } from '../lib/supabase';
import { Trip } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Tag, Clock, ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/currency';
import { createValidDate } from '../utils/dateUtils';


export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotationSuccess, setQuotationSuccess] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      try {
        setLoading(true);
        const [tripData, allTripsData] = await Promise.all([
          getTrip(id),
          getTrips(),
        ]);
        setTrip(tripData);
        setAllTrips(allTripsData);
      } catch (error) {
        console.error('Error loading trip:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleQuotationSuccess = () => {
    setQuotationSuccess(true);
    // Optionally refresh trip data to update available spots
    if (id) {
      getTrip(id).then(setTrip);
    }
  };

  // Improved PDF viewing function
  const handleViewPdf = (pdfUrl: string, pdfName: string) => {
    if (!pdfUrl) {
      toast.error('No hay URL de PDF disponible');
      return;
    }

    try {
      // Open in a new tab with proper handling
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow) {
        toast.error('El navegador ha bloqueado la apertura del PDF. Por favor, permite las ventanas emergentes para este sitio.');
        
        // Fallback: create a temporary link and click it
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.success('PDF abierto en nueva pestaña');
      }
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      toast.error('No se pudo abrir el PDF. Verifica que la URL sea válida.');
    }
  };

  // Download PDF function
  const handleDownloadPdf = (pdfUrl: string, pdfName: string) => {
    if (!pdfUrl) {
      toast.error('No hay URL de PDF disponible');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfName || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      toast.error('No se pudo descargar el PDF. Intenta nuevamente.');
    }
  };

  // Get tag color based on tag name
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'terrestre':
        return 'bg-green-100 text-green-800';
      case 'vuelos':
        return 'bg-blue-100 text-blue-800';
      case 'baja temporada':
        return 'bg-purple-100 text-purple-800';
      case 'verano':
        return 'bg-yellow-100 text-yellow-800';
      case 'eventos':
        return 'bg-red-100 text-red-800';
      case 'exprés':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  // Get destination color based on category
  const getDestinationColor = (category: string) => {
    switch (category) {
      case 'nacional':
        return 'bg-blue-100 text-blue-800';
      case 'internacional':
        return 'bg-purple-100 text-purple-800';
      case 'grupal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-secondary-500">Cargando información del paquete...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center bg-secondary-50">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Paquete no encontrado
            </h1>
            <p className="text-secondary-600 mb-6">
              El paquete que buscas no existe o ha sido eliminado.
            </p>
            <Link to="/viajes">
              <Button variant="primary">Ver todos los paquetes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const departureDate = createValidDate(trip.departure_date);
  const returnDate = createValidDate(trip.return_date);
  
  const formattedDepartureDate = departureDate ? format(departureDate, 'dd MMMM yyyy', { locale: es }) : 'Fecha no disponible';
  const formattedReturnDate = returnDate ? format(returnDate, 'dd MMMM yyyy', { locale: es }) : 'Fecha no disponible';
  
  // Use manual duration if available, otherwise calculate from dates
  const tripDuration = trip.days || ((departureDate && returnDate) 
    ? Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0);
  
  const tripNights = trip.nights !== undefined ? trip.nights : Math.max(0, tripDuration - 1);
  
  // If trip doesn't have tags, assign default ones based on category
  let displayTags = trip.tags || [];
  if (displayTags.length === 0) {
    if (trip.category === 'nacional') {
      displayTags = ['terrestre'];
    } else if (trip.category === 'internacional') {
      displayTags = ['vuelos'];
    } else if (trip.category === 'grupal') {
      displayTags = ['eventos'];
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 main-content">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button - ARREGLADO PARA QUE NO QUEDE DEBAJO DEL NAV */}
          <div className="mb-6 pt-8">
            <Link to="/viajes" className="inline-flex items-center text-primary-950 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a paquetes
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trip Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-card">
                {/* Trip Image */}
                <div className="relative h-64 md:h-96">
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-primary-950 text-white py-2 px-4 font-bold rounded-bl-lg text-xl">
                    <span className="text-lg md:text-xl font-bold">
                      {formatPrice(trip.price, trip.currency_type)}
                    </span>
                  </div>
                  
                  {/* Category badge with new colors */}
                  <div className={`absolute top-4 left-4 ${getDestinationColor(trip.category)} px-3 py-1 rounded-full text-sm font-medium`}>
                    {trip.category === 'nacional' ? 'Nacional' : 
                     trip.category === 'internacional' ? 'Internacional' : 'Grupal'}
                  </div>
                </div>
                
                {/* Trip Info */}
                <div className="p-6">
                  <h1 className="font-heading font-bold text-3xl mb-4 text-secondary-900">
                    {trip.title}
                  </h1>
                  
                  {/* Tags Section */}
                  {displayTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {displayTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`${getTagColor(tag)} px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-secondary-600">
                      <MapPin className="h-5 w-5 mr-2 text-primary-950" />
                      <span>{trip.destination}</span>
                    </div>
                    
                    <div className="flex items-center text-secondary-600">
                      <Calendar className="h-5 w-5 mr-2 text-primary-950" />
                      <span>
                        {formattedDepartureDate} - {formattedReturnDate}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-secondary-600">
                      <Clock className="h-5 w-5 mr-2 text-primary-950" />
                      <span>
                        {tripDuration} {tripDuration === 1 ? 'día' : 'días'} / {tripNights} {tripNights === 1 ? 'noche' : 'noches'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-secondary-600">
                      <Tag className="h-5 w-5 mr-2 text-primary-950" />
                      <span>
                        {trip.available_spots} {trip.available_spots === 1 ? 'cupo disponible' : 'cupos disponibles'}
                      </span>
                    </div>
                  </div>

                  {/* PDF Information - IMPROVED */}
                  {trip.info_pdf_url && trip.info_pdf_name && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-blue-900 text-base">Información Completa Disponible</h3>
                          <p className="text-sm text-blue-700">
                            {trip.info_pdf_name}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPdf(trip.info_pdf_url!, trip.info_pdf_name!)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPdf(trip.info_pdf_url!, trip.info_pdf_name!)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="prose max-w-none mb-8">
                    {trip.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-secondary-700 mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Itinerary */}
                  <div className="mb-8">
                    <h2 className="font-heading font-bold text-2xl mb-4 text-secondary-900">
                      Itinerario del paquete
                    </h2>
                    <TripItinerary itinerary={trip.itinerary} />
                  </div>

                  {/* Included Services */}
                  <div className="mb-8">
                    <h2 className="font-heading font-bold text-2xl mb-4 text-secondary-900">
                      Servicios incluidos
                    </h2>
                    <IncludedServices services={trip.included_services} />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Quotation Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              {quotationSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900">
                    ¡Solicitud enviada!
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Gracias por solicitar una cotización con Don Agustín Viajes. Te hemos enviado un correo con los detalles y nos pondremos en contacto contigo pronto.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setQuotationSuccess(false)}
                  >
                    Solicitar otra cotización
                  </Button>
                </div>
              ) : (
                <QuotationRequestForm trip={trip} onSuccess={handleQuotationSuccess} />
              )}
            </motion.div>
          </div>

          {/* Related Trips */}
          <div className="mt-8">
            <RelatedTrips currentTrip={trip} allTrips={allTrips} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}