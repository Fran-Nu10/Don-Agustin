import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../../types';
import { ChevronLeft, ChevronRight, Plane, Palmtree, Mountain, Building2, Ship, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/currency';

interface PremiumTripsCarouselProps {
  trips: Trip[];
}

export function PremiumTripsCarousel({ trips }: PremiumTripsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = trips.length;

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

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

  const getDestinationIcon = (destination: string, index: number) => {
    const dest = destination.toLowerCase();
    const iconClass = "h-16 w-16 md:h-20 md:w-20";

    if (dest.includes('playa') || dest.includes('cancún') || dest.includes('caribe') || dest.includes('punta del este')) {
      return <Palmtree className={iconClass} />;
    } else if (dest.includes('bariloche') || dest.includes('cusco') || dest.includes('montaña')) {
      return <Mountain className={iconClass} />;
    } else if (dest.includes('buenos aires') || dest.includes('new york') || dest.includes('ciudad')) {
      return <Building2 className={iconClass} />;
    } else if (dest.includes('crucero') || dest.includes('río')) {
      return <Ship className={iconClass} />;
    } else if (dest.includes('europa') || dest.includes('internacional')) {
      return <Plane className={iconClass} />;
    } else {
      return <Compass className={iconClass} />;
    }
  };

  const currentTrip = trips[currentPage];

  if (trips.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-3xl md:text-4xl text-secondary-900 mb-3"
          >
            Experiencias <span className="text-primary-600">VIP</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-secondary-600"
          >
            Destinos exclusivos para viajeros exigentes
          </motion.p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {!isMobile && trips.length > 1 && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl hover:bg-white transition-all duration-300 hidden md:flex items-center justify-center group"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6 text-secondary-900 group-hover:text-primary-600 transition-colors" />
              </button>

              <button
                onClick={nextPage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl hover:bg-white transition-all duration-300 hidden md:flex items-center justify-center group"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6 text-secondary-900 group-hover:text-primary-600 transition-colors" />
              </button>
            </>
          )}

          <div
            ref={containerRef}
            className="overflow-hidden touch-pan-x rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-x pinch-zoom' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrip.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <Link to={`/viajes/${currentTrip.id}`} className="block group">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <div className="relative h-[500px] md:h-[600px]">
                      <img
                        src={currentTrip.image_url}
                        alt={currentTrip.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

                      <div className="absolute top-6 right-6 bg-primary-600 text-white py-3 px-6 font-bold rounded-full shadow-xl text-base md:text-lg z-10 border-2 border-white/30">
                        Desde {formatPrice(currentTrip.price, currentTrip.currency_type)}
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-white drop-shadow-2xl mb-8"
                        >
                          {getDestinationIcon(currentTrip.destination, currentPage)}
                        </motion.div>

                        <motion.h3
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="font-heading font-bold text-white text-4xl md:text-5xl lg:text-6xl mb-4 drop-shadow-2xl leading-tight tracking-wide"
                        >
                          {currentTrip.destination.split(',')[0]}
                        </motion.h3>

                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="text-white/95 text-lg md:text-xl lg:text-2xl font-medium drop-shadow-lg max-w-2xl"
                        >
                          {currentTrip.title}
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2"
                      >
                        <div className="border-2 border-white text-white group-hover:bg-white group-hover:text-secondary-900 px-12 py-4 rounded-lg text-lg md:text-xl font-bold uppercase transition-all duration-300 flex items-center shadow-2xl backdrop-blur-sm">
                          <span>ENTRAR</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {trips.length > 1 && (
            <div className="flex justify-center mt-6 space-x-3">
              {trips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentPage === index
                      ? 'w-8 h-3 bg-primary-600'
                      : 'w-3 h-3 bg-secondary-300 hover:bg-secondary-400'
                  }`}
                  aria-label={`Ir a destino ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
