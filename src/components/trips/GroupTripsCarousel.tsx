import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface GroupTripsCarouselProps {
  trips: Trip[];
}

export function GroupTripsCarousel({ trips }: GroupTripsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(1); // Always show 1 item per page for full-width design
      setCurrentPage(0); // Reset to first page on resize
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(trips.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle horizontal swipes, allow vertical scrolling
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    // Only trigger page change for significant horizontal swipes
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextPage();
      } else {
        prevPage();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentTrips = trips.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-2">
            Salidas Grupales
          </h2>
          <p className="text-lg text-secondary-600">
            Viaja en grupo y vive experiencias inolvidables
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6 text-secondary-600" />
          </button>
          
          <button
            onClick={nextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6 text-secondary-600" />
          </button>

          {/* Trips Carousel - IMPROVED VISUAL DESIGN */}
          <div 
            ref={containerRef}
            className="overflow-hidden touch-pan-x-only" // Custom class for horizontal-only touch
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-x pinch-zoom' }} // Allow horizontal pan and pinch, but not vertical pan
          >
            <AnimatePresence mode="wait">
              {currentTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  style={{ touchAction: 'auto' }} // Allow normal touch behavior on the content
                >
                  <div className="relative overflow-hidden rounded-xl shadow-xl">
                    {/* Full-width image with overlay */}
                    <div className="relative h-[400px] md:h-[500px]">
                      <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                        <div className="max-w-3xl">
                          <div className="bg-primary-600/90 text-white inline-block px-3 py-1 rounded-full text-sm font-medium mb-3">
                            Salida Grupal
                          </div>
                          
                          <h3 className="font-heading font-bold text-2xl md:text-3xl mb-3 drop-shadow-md">
                            {trip.title}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center text-white/90">
                              <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                              <span>{trip.destination}</span>
                            </div>
                            
                            <div className="flex items-center text-white/90">
                              <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                              <span>
                                {format(new Date(trip.departure_date), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-white/90">
                              <Clock className="h-4 w-4 mr-2 text-primary-500" />
                              <span>
                                {Math.ceil(
                                  (new Date(trip.return_date).getTime() - new Date(trip.departure_date).getTime()) / 
                                  (1000 * 60 * 60 * 24)
                                )} días
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <span className="text-white/70 text-sm">Precio</span>
                              <p className="text-white font-bold text-2xl">${trip.price.toLocaleString('es-UY')}</p>
                            </div>
                            
                            <Link to={`/viajes/${trip.id}`}>
                              <Button 
                                variant="outline" 
                                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                              >
                                Ver detalles
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === index
                    ? 'bg-primary-950'
                    : 'bg-secondary-300 hover:bg-secondary-400'
                }`}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}