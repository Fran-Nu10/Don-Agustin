import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Trip } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';
import { createValidDate } from '../../utils/dateUtils';

interface TripCardProps {
  trip: Trip;
  showActions?: boolean;
}


export function TripCard({ trip, showActions = true }: TripCardProps) {
  const departureDate = createValidDate(trip.departure_date);
  const returnDate = createValidDate(trip.return_date);
  
  const formattedDepartureDate = departureDate ? format(departureDate, 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible';
  const formattedReturnDate = returnDate ? format(returnDate, 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible';
  
  // Use manual duration if available, otherwise calculate from dates
  const tripDuration = trip.days || ((departureDate && returnDate) 
    ? Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0);
  
  const tripNights = trip.nights !== undefined ? trip.nights : Math.max(0, tripDuration - 1);
  
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
  
  // Get destination color based on category
  const getDestinationColor = () => {
    switch (trip.category) {
      case 'nacional':
        return 'bg-blue-600/90 text-white';
      case 'internacional':
        return 'bg-purple-600/90 text-white';
      case 'grupal':
        return 'bg-green-600/90 text-white';
      default:
        return 'bg-white/90 backdrop-blur-sm text-primary-950';
    }
  };
  
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
          <div className="relative h-[320px] md:h-[380px] overflow-hidden">
            <img
              src={trip.image_url}
              alt={trip.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* Price tag - Now in USD */}
            <div className="absolute top-4 right-4 bg-primary-600 text-white py-1.5 px-4 font-bold rounded-full shadow-md text-base md:text-lg">
              <span className="text-sm md:text-base font-bold">
                {formatPrice(trip.price, trip.currency_type)}
              </span>
            </div>
            
            {/* Category badge with new colors */}
            <div className={`absolute top-4 left-4 ${getDestinationColor()} text-xs px-3 py-1 rounded-full shadow-sm`}>
              {trip.category === 'nacional' ? 'Nacional' : 
               trip.category === 'internacional' ? 'Internacional' : 'Grupal'}
            </div>
            
            {/* Tags if available - with new colors */}
            {trip.tags && trip.tags.length > 0 && (
              <div className="absolute top-12 left-4 flex flex-wrap gap-1 max-w-[70%]">
                {trip.tags.map((tag, i) => (
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
          <div className="bg-white p-4 md:p-5 hidden md:block">
            <div className="flex items-center justify-between text-sm text-secondary-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-primary-600 flex-shrink-0" />
                <span>
                  {tripDuration} {tripDuration === 1 ? 'día' : 'días'} / {tripNights} {tripNights === 1 ? 'noche' : 'noches'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1.5 text-primary-600 flex-shrink-0" />
                <span>
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