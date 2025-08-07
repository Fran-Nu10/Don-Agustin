import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/currency';
import { createValidDate } from '../../utils/dateUtils';


interface GroupTripsCarouselProps {
  trips: Trip[];
}

export function GroupTripsCarousel({ trips }: GroupTripsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(1); // Always show 1 item per page for full-width design
      setCurrentPage(0); // Reset to first page on resize
      setIsMobile(window.innerWidth < 768);
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

  // Get tag color based on tag name
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'terrestre':
        return 'bg-green-500 text-white';
      case 'vuelos':
        return 'bg-blue-500 text-white';
      case 'baja temporada':
        return 'bg-purple-500 text-white';
      case 'verano':
        return 'bg-yellow-500 text-black';
      case 'eventos':
        return 'bg-red-500 text-white';
      case 'exprés':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-primary-500/80 text-white';
    }
  };

  return (
    <section className="py-6 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-2">
            Salidas Grupales
          </h2>
          <p className="text-lg text-secondary-600">
            Viaja en grupo y vive experiencias inolvidables
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons - Only show on desktop */}
          {!isMobile && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-secondary-50 transition-colors hidden md:flex items-center justify-center"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6 text-secondary-600" />
              </button>
              
              <button
                onClick={nextPage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-secondary-50 transition-colors hidden md:flex items-center justify-center"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6 text-secondary-600" />
              </button>
            </>
          )}

          {/* Trips Carousel - Mobile optimized */}
          <div 
            ref={containerRef}
            className="overflow-hidden touch-pan-x" 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-x pinch-zoom' }}
          >
            <AnimatePresence mode="wait">
              {currentTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  style={{ touchAction: 'auto' }}
                >
                  <Link to={`/viajes/${trip.id}`} className="block">
                    <div className="relative overflow-hidden rounded-xl shadow-xl">
                      {/* Full-width image with overlay */}
                      <div className="relative h-[350px] md:h-[500px]">
                        <img
                          src={trip.image_url}
                          alt={trip.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        
                        {/* Price tag - Convert to USD */}
                        <div className="absolute top-4 right-4 bg-primary-600 text-white py-1.5 px-4 font-bold rounded-full shadow-md text-base md:text-lg">
                          {formatPrice(trip.price, trip.currency_type)}
                        </div>
                        
                        {/* Category badge - Only on desktop */}
                        <div className="absolute top-4 left-4 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full shadow-sm hidden md:block">
                          Salida Grupal
                        </div>
                        
                        {/* Tags if available - with new colors */}
                        {trip.tags && trip.tags.length > 0 && (
                          <div className="absolute top-14 left-4 flex flex-wrap gap-1 max-w-[70%]">
                            {trip.tags.slice(0, 2).map((tag, i) => (
                              <span 
                                key={i} 
                                className={`${getTagColor(tag)} text-xs px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Title and destination - Positioned at bottom of image */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <h3 className="font-heading font-bold text-xl md:text-2xl mb-2 drop-shadow-md">{trip.title}</h3>
                          <div className="flex items-center text-white/90 text-sm mb-1">
                            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                        </div>
                        
                        {/* Info container - Desktop only */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 hidden md:block">
                          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 max-w-md">
                            <div className="flex flex-wrap gap-4 text-white/90 text-sm mb-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                                <span>
                                  {(() => {
                                    const departureDate = createValidDate(trip.departure_date);
                                    return departureDate ? format(departureDate, 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible';
                                  })()}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-primary-500" />
                                <span>
                                  {trip.days || 1} {(trip.days || 1) === 1 ? 'día' : 'días'}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-white/90 line-clamp-3 text-sm">
                              {trip.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-4 space-x-2">
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