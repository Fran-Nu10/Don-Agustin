import React from 'react';
import { Trip } from '../../types';
import { Calendar, MapPin, DollarSign, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TripDetailProps {
  trip: Trip;
}

export function TripDetail({ trip }: TripDetailProps) {
  const formattedDepartureDate = format(new Date(trip.departure_date), 'dd MMMM yyyy', { locale: es });
  const formattedReturnDate = format(new Date(trip.return_date), 'dd MMMM yyyy', { locale: es });
  
  // Calculate trip duration
  const departureDate = new Date(trip.departure_date);
  const returnDate = new Date(trip.return_date);
  const tripDuration = Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Convert price from UYU to USD
  const priceUSD = Math.round(trip.price / 40); // Using an approximate conversion rate of 40 UYU = 1 USD
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-heading font-bold text-2xl mb-4 text-secondary-900">
        Detalles del paquete
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <MapPin className="h-6 w-6 text-primary-950" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Destino</p>
            <p className="font-medium text-secondary-900">{trip.destination}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <DollarSign className="h-6 w-6 text-primary-950" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Precio</p>
            <p className="font-medium text-secondary-900">USD {priceUSD}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <Calendar className="h-6 w-6 text-primary-950" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Fechas</p>
            <p className="font-medium text-secondary-900">
              {formattedDepartureDate} - {formattedReturnDate}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-primary-950" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Duración</p>
            <p className="font-medium text-secondary-900">
              {tripDuration} {tripDuration === 1 ? 'día' : 'días'} / {tripDuration - 1} {tripDuration - 1 === 1 ? 'noche' : 'noches'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-primary-950" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Cupos disponibles</p>
            <p className="font-medium text-secondary-900">
              {trip.available_spots} {trip.available_spots === 1 ? 'cupo' : 'cupos'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}