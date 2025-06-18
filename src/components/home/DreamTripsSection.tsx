import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Trip } from '../../types';

interface DreamTripsSectionProps {
  trips: Trip[];
}

export function DreamTripsSection({ trips }: DreamTripsSectionProps) {
  // Filtrar solo los viajes con la etiqueta "dream" si hay alguno
  // Si no hay ninguno con esa etiqueta, mostrar hasta 6 viajes aleatorios
  const dreamTrips = trips.filter(trip => trip.tags?.includes('dream'));
  
  // Si no hay viajes con etiqueta dream, seleccionar hasta 6 viajes aleatorios
  const tripsToShow = dreamTrips.length > 0 
    ? dreamTrips.slice(0, 6) 
    : trips
        .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
        .slice(0, 6); // Tomar los primeros 6

  if (tripsToShow.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-4">
            ¡Las mejores ofertas de Paquetes!
          </h2>
          <p className="text-lg text-secondary-600">
            Descubre destinos increíbles a precios especiales
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tripsToShow.map((trip, index) => {
            // Determinar si el viaje debe ocupar más espacio (para los primeros 3 viajes)
            const isLarge = index < 3;
            
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-lg ${
                  isLarge ? 'md:col-span-2 lg:col-span-1' : ''
                } ${index === 0 ? 'lg:row-span-2' : ''}`}
              >
                <Link to={`/viajes/${trip.id}`} className="block group">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={trip.image_url}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    
                    {/* Price tag */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white py-1 px-3 rounded-full text-sm font-bold">
                      Desde US$ {Math.floor(trip.price / 40)} {/* Conversión aproximada UYU a USD */}
                    </div>
                    
                    {/* Optional "últimos lugares" tag */}
                    {trip.available_spots <= 5 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white py-1 px-3 rounded-full text-sm font-bold uppercase">
                        Últimos lugares
                      </div>
                    )}
                    
                    {/* Title and destination */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-heading font-bold text-2xl md:text-3xl mb-1 drop-shadow-md">
                        {trip.destination.split(',')[0]}
                      </h3>
                      <p className="text-white/90 text-lg font-medium">
                        {trip.title.includes('Vacaciones') ? trip.title : `Vacaciones de ${new Date(trip.departure_date).toLocaleString('es-ES', { month: 'long' })}`}
                      </p>
                    </div>
                    
                    {/* View details link */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white text-sm px-3 py-1.5 rounded-full transition-all duration-300 flex items-center">
                        <span>Ver detalles</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}