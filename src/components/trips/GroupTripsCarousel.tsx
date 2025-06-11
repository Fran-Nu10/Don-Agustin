import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
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
          {/* Navigation Buttons - Only show on desktop */}
          <button
            onClick={prevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors hidden md:block"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6 text-secondary-600" />
          </button>
          
          <button
            onClick={nextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors hidden md:block"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6 text-secondary-600" />
          </button>

          {/* Trips Carousel - IMPROVED FOR VERTICAL SCROLLING */}
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
                  <div className="bg-white rounded-lg overflow-hidden shadow-card">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Fixed height image container */}
                      <div className="relative h-64 md:h-80 lg:h-96">
                        <img
                          src={trip.image_url}
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-primary-950 text-white py-2 px-4 rounded-full text-lg font-bold">
                          ${trip.price.toLocaleString('es-UY')}
                        </div>
                      </div>
                      
                      {/* Content with matching height - SCROLLABLE */}
                      <div className="p-6 md:p-8 flex flex-col min-h-64 md:min-h-80 lg:min-h-96 touch-scroll">
                        <h3 className="font-heading font-bold text-2xl mb-4 text-secondary-900">
                          {trip.title}
                        </h3>
                        
                        <div className="flex items-center text-secondary-600 mb-2">
                          <Calendar className="h-5 w-5 mr-2 text-primary-950 flex-shrink-0" />
                          <span>
                            {format(new Date(trip.departure_date), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-secondary-600 mb-4">
                          <Clock className="h-5 w-5 mr-2 text-primary-950 flex-shrink-0" />
                          <span>
                            {Math.ceil(
                              (new Date(trip.return_date).getTime() - new Date(trip.departure_date).getTime()) / 
                              (1000 * 60 * 60 * 24)
                            )} días
                          </span>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto touch-scroll">
                          <p className="text-secondary-600 mb-6">
                            {trip.description}
                          </p>
                        </div>
                        
                        <div className="mt-auto">
                          <Link to={`/viajes/${trip.id}`}>
                            <Button variant="primary" fullWidth>
                              Ver detalles
                            </Button>
                          </Link>
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