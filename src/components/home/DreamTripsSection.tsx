import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Trip } from '../../types';
import { formatPrice } from '../../utils/currency';
import { createValidDate } from '../../utils/dateUtils';


interface DreamTripsSectionProps {
  trips: Trip[];
}

export function DreamTripsSection({ trips }: DreamTripsSectionProps) {
  // Filtrar solo los viajes con la etiqueta "dream" si hay alguno
  const dreamTrips = trips.filter(trip => trip.tags?.includes('dream'));

  // Si no hay viajes con etiqueta dream, seleccionar hasta 6 viajes aleatorios
  const tripsToShow = dreamTrips.length > 0
    ? dreamTrips.slice(0, 6)
    : trips
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

  // Asegurarse de que siempre haya exactamente 6 viajes
  const filledTrips = [...tripsToShow];
  const minTrips = 6; // Llenar hasta 6 espacios
  if (filledTrips.length > 0 && filledTrips.length < minTrips) {
    const neededExtras = minTrips - filledTrips.length;
    for (let i = 0; i < neededExtras; i++) {
      filledTrips.push(tripsToShow[i % tripsToShow.length]);
    }
  }

  if (tripsToShow.length === 0) return null;

  // Grid masonry asimétrico - 6 elementos
  const getItemClass = (index: number) => {
    switch (index) {
      case 0: // Grande - izquierda (1 col x 2 filas)
        return "col-span-1 row-span-2";
      case 1: // Rectangular horizontal arriba derecha (2 cols x 1 fila)
        return "col-span-2 row-span-1";
      case 2: // Mediana (1 col x 1 fila)
        return "col-span-1 row-span-1";
      case 3: // Mediana (1 col x 1 fila)
        return "col-span-1 row-span-1";
      case 4: // Mediana (1 col x 1 fila)
        return "col-span-1 row-span-1";
      case 5: // Mediana (1 col x 1 fila)
        return "col-span-1 row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  // Alturas específicas para cada posición del grid
  const getImageHeight = (index: number) => {
    switch (index) {
      case 0: // Grande - máxima altura
        return "h-[320px] md:h-[520px]";
      case 1: // Rectangular horizontal
        return "h-[200px] md:h-[250px]";
      case 2:
      case 3:
      case 4:
      case 5:
        return "h-[200px] md:h-[250px]";
      default:
        return "h-[200px] md:h-[250px]";
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
    <section className="py-12 bg-gradient-to-b from-white to-secondary-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-secondary-900 mb-3">
            Experiencias VIP Seleccionadas
          </h2>
          <p className="text-lg md:text-xl text-secondary-600">
            Destinos exclusivos diseñados para vos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {filledTrips.map((trip, index) => {
            return (
              <motion.div
                key={`${trip.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${getItemClass(index)}`}
              >
                <Link to={`/viajes/${trip.id}`} className="block group">
                  <div className={`relative ${getImageHeight(index)} overflow-hidden`}>
                    <img
                      src={trip.image_url}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay más oscuro estilo hiperviajes */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>

                    {/* Badge de precio estilo hiperviajes - MÁS GRANDE Y PROMINENTE */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary-600 text-white py-2 px-5 font-bold rounded-full shadow-xl text-sm md:text-base lg:text-lg z-10 border-2 border-white/20">
                      Desde {formatPrice(trip.price, trip.currency_type)}
                    </div>

                    {/* Badge "últimos lugares" más prominente */}
                    {trip.available_spots <= 5 && (
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-red-600 text-white py-1.5 px-4 rounded-full text-xs md:text-sm font-bold uppercase shadow-lg z-10 animate-pulse">
                        Últimos lugares
                      </div>
                    )}

                    {/* Contenido centrado - Estilo hiperviajes */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-6">
                      {/* Título grande y centrado */}
                      <h3 className="font-heading font-bold text-white text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-3 drop-shadow-2xl leading-tight">
                        {index === 0 || index === 1
                          ? trip.destination.split(',')[0]
                          : trip.title.length > 30
                          ? trip.title.substring(0, 30) + '...'
                          : trip.title}
                      </h3>

                      {/* Subtítulo descriptivo */}
                      {(index === 0 || index === 1) && (
                        <p className="text-white/95 text-base md:text-lg lg:text-xl font-medium drop-shadow-lg">
                          {trip.title.includes('Vacaciones')
                            ? trip.title
                            : (() => {
                                const departureDate = createValidDate(trip.departure_date);
                                return departureDate
                                  ? `Vacaciones de ${departureDate.toLocaleString('es-ES', { month: 'long' })}`
                                  : 'Vacaciones';
                              })()}
                        </p>
                      )}

                      {/* Tags pequeños abajo del título para tarjetas medianas/pequeñas */}
                      {index > 1 && trip.tags && trip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {trip.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className={`${getTagColor(tag)} text-xs px-3 py-1 rounded-full shadow-md`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botón "Ver oferta" que aparece en hover */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="bg-white hover:bg-primary-600 text-primary-900 hover:text-white text-sm md:text-base px-6 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center font-bold shadow-xl">
                        <span>Ver oferta</span>
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
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