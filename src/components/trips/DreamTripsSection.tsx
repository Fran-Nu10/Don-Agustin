import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Trip } from '../../types';
import { convertToUSD } from '../../lib/supabase';

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

  // Asegurarse de que siempre haya 6 viajes para mostrar (o un múltiplo de 3)
  // Si hay menos de 6, repetir algunos para llenar los espacios
  const filledTrips = [...tripsToShow];
  if (filledTrips.length < 6) {
    const neededExtras = 6 - filledTrips.length;
    for (let i = 0; i < neededExtras; i++) {
      filledTrips.push(tripsToShow[i % tripsToShow.length]);
    }
  }

  if (tripsToShow.length === 0) return null;

  // Definir la estructura de la cuadrícula
  // Primer viaje: grande (ocupa 2 columnas en móvil, 2 filas en desktop)
  // Segundo y tercer viaje: medianos (ocupan 1 columna cada uno)
  // Cuarto, quinto y sexto viaje: pequeños (ocupan 1 columna cada uno)
  const getItemClass = (index: number) => {
    switch (index) {
      case 0: // Primer viaje (grande)
        return "col-span-2 row-span-2 md:col-span-2 lg:col-span-2";
      case 1: // Segundo viaje (mediano)
        return "col-span-2 md:col-span-1 lg:col-span-1";
      case 2: // Tercer viaje (mediano)
        return "col-span-2 md:col-span-1 lg:col-span-1";
      default: // Resto (pequeños)
        return "col-span-1";
    }
  };

  // Altura de las imágenes según su posición
  const getImageHeight = (index: number) => {
    switch (index) {
      case 0: // Primer viaje (grande)
        return "h-96 md:h-[500px]";
      case 1: // Segundo viaje (mediano)
      case 2: // Tercer viaje (mediano)
        return "h-64 md:h-[240px]";
      default: // Resto (pequeños)
        return "h-48 md:h-[240px]";
    }
  };

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
  const getDestinationColor = (category: string) => {
    switch (category) {
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
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-4">
            ¡Las mejores ofertas de Paquetes!
          </h2>
          <p className="text-lg text-secondary-600">
            Descubre destinos increíbles a precios especiales
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filledTrips.map((trip, index) => {
            // Convert price from UYU to USD
            const priceUSD = convertToUSD(trip.price);
            
            return (
              <motion.div
                key={`${trip.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-lg ${getItemClass(index)}`}
              >
                <Link to={`/viajes/${trip.id}`} className="block group">
                  <div className={`relative ${getImageHeight(index)} overflow-hidden`}>
                    <img
                      src={trip.image_url}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    
                    {/* Price tag - Now in USD */}
                    <div className="absolute top-4 right-4 bg-primary-600 text-white py-1.5 px-4 font-bold rounded-full shadow-md text-base md:text-lg">
                      USD {priceUSD}
                    </div>
                    
                    {/* Optional "últimos lugares" tag */}
                    {trip.available_spots <= 5 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white py-1 px-3 rounded-full text-sm font-bold uppercase">
                        Últimos lugares
                      </div>
                    )}
                    
                    {/* Category badge with new colors */}
                    {trip.available_spots > 5 && (
                      <div className={`absolute top-4 left-4 ${getDestinationColor(trip.category)} text-xs px-3 py-1 rounded-full shadow-sm`}>
                        {trip.category === 'nacional' ? 'Nacional' : 
                         trip.category === 'internacional' ? 'Internacional' : 'Grupal'}
                      </div>
                    )}
                    
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
                    
                    {/* Title and destination */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-heading font-bold text-xl md:text-2xl lg:text-3xl mb-1 drop-shadow-md">
                        {index === 0 || index === 1 || index === 2 
                          ? trip.destination.split(',')[0]
                          : trip.title.length > 15 ? trip.title.substring(0, 15) + '...' : trip.title
                        }
                      </h3>
                      {(index === 0 || index === 1 || index === 2) && (
                        <p className="text-white/90 text-sm md:text-base font-medium">
                          {trip.title.includes('Vacaciones') 
                            ? trip.title 
                            : `Vacaciones de ${new Date(trip.departure_date).toLocaleString('es-ES', { month: 'long' })}`
                          }
                        </p>
                      )}
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