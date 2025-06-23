import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { TripCard } from './TripCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripCarouselProps {
  trips: Trip[];
  title: string;
  subtitle?: string;
}

export function TripCarousel({ trips, title, subtitle }: TripCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };
  
  // Derive isMobile from itemsPerPage instead of maintaining separate state
  const isMobile = itemsPerPage === 1;
  
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
      setCurrentPage(0); // Reset to first page on resize
    };
    
    // Set initial items per page
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

  // Update trip tags to use the new tag system
  const updatedTrips = currentTrips.map(trip => {
    // If trip already has tags, leave them as is
    if (trip.tags && trip.tags.length > 0) {
      return trip;
    }
    
    // Otherwise, assign some default tags based on category
    let defaultTags: string[] = [];
    
    if (trip.category === 'nacional') {
      defaultTags.push('terrestre');
      
      // Add seasonal tag based on departure date
      const departureMonth = new Date(trip.departure_date).getMonth();
      if (departureMonth >= 11 || departureMonth <= 2) { // Dec-Mar
        defaultTags.push('verano');
      } else {
        defaultTags.push('baja temporada');
      }
    } else if (trip.category === 'internacional') {
      defaultTags.push('vuelos');
      
      // Add duration-based tag
      const duration = Math.ceil(
        (new Date(trip.return_date).getTime() - new Date(trip.departure_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      if (duration <= 5) {
        defaultTags.push('exprés');
      }
    } else if (trip.category === 'grupal') {
      defaultTags.push('eventos');
    }
    
    return {
      ...trip,
      tags: defaultTags
    };
  });

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-secondary-600">{subtitle}</p>
          )}
        </div>

        <div className="relative">
          {/* Navigation Buttons - Only show on desktop */}
          {!isMobile && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors hidden md:block"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6 text-secondary-600" />
              </button>
              
              <button
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-secondary-50 transition-colors hidden md:block"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6 text-secondary-600" />
              </button>
            </>
          )}

          {/* Trips Grid with Touch Support */}
          <div 
            ref={containerRef}
            className="overflow-hidden touch-pan-x-only" 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-x pinch-zoom' }} 
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                style={{ touchAction: 'auto' }} 
              >
                {updatedTrips.map((trip) => (
                  <div key={trip.id} style={{ touchAction: 'auto' }}>
                    <TripCard trip={trip} />
                  </div>
                ))}
              </motion.div>
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
    </div>
  );
}