import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Trip } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TripCardProps {
  trip: Trip;
  showActions?: boolean;
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const formattedDepartureDate = format(new Date(trip.departure_date), 'dd MMM yyyy', { locale: es });
  const formattedReturnDate = format(new Date(trip.return_date), 'dd MMM yyyy', { locale: es });
  
  // Calculate trip duration
  const departureDate = new Date(trip.departure_date);
  const returnDate = new Date(trip.return_date);
  const tripDuration = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="touch-pan-y h-full"
    >
      <Link to={`/viajes/${trip.id}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-lg shadow-lg group">
          {/* Image container - Larger portion of the card */}
          <div className="relative h-[280px] overflow-hidden">
            <img
              src={trip.image_url}
              alt={trip.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* Price tag */}
            <div className="absolute top-4 right-4 bg-primary-600 text-white py-1 px-3 font-bold rounded-full shadow-md text-sm">
              ${trip.price.toLocaleString('es-UY')}
            </div>
            
            {/* Category badge - Only on desktop */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary-950 text-xs px-3 py-1 rounded-full shadow-sm hidden md:block">
              {trip.category === 'nacional' ? 'Nacional' : 
               trip.category === 'internacional' ? 'Internacional' : 'Grupal'}
            </div>
            
            {/* Title and destination - Positioned at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-heading font-bold text-lg md:text-xl mb-1 drop-shadow-md">{trip.title}</h3>
              <div className="flex items-center text-white/90 text-sm mb-1">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </div>
            </div>
            
            {/* Subtle view details link - Only on desktop */}
            {showActions && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white text-sm px-3 py-1.5 rounded-full transition-all duration-300 flex items-center group-hover:bg-primary-600">
                  <span>Ver detalles</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )}
          </div>
          
          {/* Info container - Smaller portion with key details - Only on desktop */}
          <div className="bg-white p-3 md:p-4 hidden md:block">
            <div className="flex items-center justify-between text-sm text-secondary-600">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-primary-600 flex-shrink-0" />
                <span className="text-xs">
                  {tripDuration} {tripDuration === 1 ? 'día' : 'días'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1 text-primary-600 flex-shrink-0" />
                <span className="text-xs">
                  {trip.available_spots} {trip.available_spots === 1 ? 'cupo' : 'cupos'}
                </span>
              </div>
              
              <div className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                {formattedDepartureDate.split(' ')[1]}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}