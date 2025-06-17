import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        
                        {/* Content overlay - Simplified for mobile */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                          <div className="max-w-3xl">
                            <div className="bg-primary-600/90 text-white inline-block px-3 py-1 rounded-full text-sm font-medium mb-3">
                              Salida Grupal
                            </div>
                            
                            <h3 className="font-heading font-bold text-2xl md:text-3xl mb-3 drop-shadow-md">
                              {trip.title}
                            </h3>
                            
                            {/* Desktop-only info */}
                            <div className="hidden md:flex md:flex-wrap md:gap-4 md:mb-4">
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
                            
                            {/* Mobile-only destination */}
                            <div className="flex md:hidden items-center text-white/90 mb-3">
                              <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                              <span>{trip.destination}</span>
                            </div>
                            
                            {/* Price - Smaller on mobile */}
                            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg inline-block">
                              <p className="text-white font-bold text-xl md:text-2xl">${trip.price.toLocaleString('es-UY')}</p>
                            </div>
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