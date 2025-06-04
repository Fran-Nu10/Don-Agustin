import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { Trip } from '../../types';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface TripCardProps {
  trip: Trip;
  showActions?: boolean;
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const formattedDepartureDate = format(new Date(trip.departure_date), 'dd MMM yyyy', { locale: es });
  const formattedReturnDate = format(new Date(trip.return_date), 'dd MMM yyyy', { locale: es });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
          <div className="absolute top-0 right-0 bg-primary-950 text-white py-1 px-3 font-medium rounded-bl-lg">
            ${trip.price.toLocaleString('es-UY')}
          </div>
        </div>
        
        <CardContent className="flex-grow">
          <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900">{trip.title}</h3>
          
          <div className="flex items-center text-secondary-600 mb-2">
            <MapPin className="h-4 w-4 mr-1 text-primary-950" />
            <span className="text-sm">{trip.destination}</span>
          </div>
          
          <div className="flex items-center text-secondary-600 mb-2">
            <Calendar className="h-4 w-4 mr-1 text-primary-950" />
            <span className="text-sm">
              {formattedDepartureDate} - {formattedReturnDate}
            </span>
          </div>
          
          <div className="flex items-center text-secondary-600 mb-4">
            <Tag className="h-4 w-4 mr-1 text-primary-950" />
            <span className="text-sm">
              {trip.available_spots} {trip.available_spots === 1 ? 'cupo disponible' : 'cupos disponibles'}
            </span>
          </div>
          
          <p className="text-secondary-700 line-clamp-3">{trip.description}</p>
        </CardContent>
        
        {showActions && (
          <CardFooter>
            <Link to={`/viajes/${trip.id}`} className="w-full">
              <Button variant="primary" fullWidth>
                Ver detalles
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}