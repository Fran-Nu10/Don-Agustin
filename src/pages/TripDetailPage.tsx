import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { BookingForm } from '../components/trips/BookingForm';
import { TripItinerary } from '../components/trips/TripItinerary';
import { IncludedServices } from '../components/trips/IncludedServices';
import { RelatedTrips } from '../components/trips/RelatedTrips';
import { getTrip, getTrips } from '../lib/supabase';
import { Trip } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Tag, Clock, ArrowLeft, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    // Optionally refresh trip data to update available spots
    if (id) {
      getTrip(id).then(setTrip);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-secondary-500">Cargando información del viaje...</p>
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
              Viaje no encontrado
            </h1>
            <p className="text-secondary-600 mb-6">
              El viaje que buscas no existe o ha sido eliminado.
            </p>
            <Link to="/viajes">
              <Button variant="primary">Ver todos los viajes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDepartureDate = format(new Date(trip.departure_date), 'dd MMMM yyyy', { locale: es });
  const formattedReturnDate = format(new Date(trip.return_date), 'dd MMMM yyyy', { locale: es });
  
  // Calculate trip duration
  const departureDate = new Date(trip.departure_date);
  const returnDate = new Date(trip.return_date);
  const tripDuration = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 main-content">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button - ARREGLADO PARA QUE NO QUEDE DEBAJO DEL NAV */}
          <div className="mb-6 pt-8">
            <Link to="/viajes" className="inline-flex items-center text-primary-950 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a viajes
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
                    ${trip.price.toLocaleString('es-UY')}
                  </div>
                </div>
                
                {/* Trip Info */}
                <div className="p-6">
                  <h1 className="font-heading font-bold text-3xl mb-4 text-secondary-900">
                    {trip.title}
                  </h1>
                  
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
                        {tripDuration} {tripDuration === 1 ? 'día' : 'días'} / {tripDuration - 1} {tripDuration - 1 === 1 ? 'noche' : 'noches'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-secondary-600">
                      <Tag className="h-5 w-5 mr-2 text-primary-950" />
                      <span>
                        {trip.available_spots} {trip.available_spots === 1 ? 'cupo disponible' : 'cupos disponibles'}
                      </span>
                    </div>
                  </div>

                  {/* PDF Information - MEJORADO */}
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
                            Ver PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(trip.info_pdf_url!, '_blank');
                              toast.success('Descarga iniciada');
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
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
                      Itinerario del viaje
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
            
            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              {bookingSuccess ? (
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
                    ¡Reserva exitosa!
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Gracias por reservar con Don Agustín Viajes. Te hemos enviado un correo con los detalles de tu reserva.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setBookingSuccess(false)}
                  >
                    Hacer otra reserva
                  </Button>
                </div>
              ) : (
                <BookingForm trip={trip} onSuccess={handleBookingSuccess} />
              )}
            </motion.div>
          </div>

          {/* Related Trips */}
          <div className="mt-12">
            <RelatedTrips currentTrip={trip} allTrips={allTrips} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}