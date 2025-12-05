import React from 'react';
import { Trip } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';
import { ArrowRight } from 'lucide-react';

interface TripGridProps {
  trips: Trip[];
  title: string;
  subtitle?: string;
  maxItems?: number;
}

export function TripGrid({ trips, title, subtitle, maxItems = 8 }: TripGridProps) {
  // Llenar la grilla repitiendo viajes si es necesario
  const filledTrips = [...trips.slice(0, maxItems)];

  if (filledTrips.length > 0 && filledTrips.length < maxItems) {
    const neededExtras = maxItems - filledTrips.length;
    for (let i = 0; i < neededExtras; i++) {
      filledTrips.push(trips[i % trips.length]);
    }
  }

  const displayTrips = filledTrips;

  if (displayTrips.length === 0) return null;

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-3xl md:text-4xl text-secondary-900 mb-3"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-secondary-600"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {displayTrips.map((trip, index) => (
            <motion.div
              key={`${trip.id}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <Link to={`/viajes/${trip.id}`} className="block">
                <div className="relative h-[380px] md:h-[420px] overflow-hidden">
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay oscuro con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75"></div>

                  {/* Badge de categoría en la esquina superior */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md z-10 ${
                    trip.category === 'nacional'
                      ? 'bg-blue-600 text-white'
                      : trip.category === 'internacional'
                      ? 'bg-purple-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}>
                    {trip.category === 'nacional' ? 'Nacional' :
                     trip.category === 'internacional' ? 'Internacional' : 'Grupal'}
                  </div>

                  {/* Badge de precio */}
                  <div className="absolute top-3 right-3 bg-primary-600 text-white py-1.5 px-4 font-bold rounded-full shadow-lg text-sm md:text-base z-10 border-2 border-white/20">
                    {formatPrice(trip.price, trip.currency_type)}
                  </div>

                  {/* Logo/Ícono centrado arriba (opcional) */}
                  {/* Puedes agregar un logo aquí si tienes logos por destino */}

                  {/* Contenido centrado - Estilo TiendaViajes */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    {/* Título principal - GRANDE Y CENTRADO */}
                    <h3 className="font-heading font-bold text-white text-2xl md:text-3xl lg:text-3xl mb-2 drop-shadow-2xl leading-tight uppercase tracking-wide">
                      {trip.destination.split(',')[0]}
                    </h3>

                    {/* Subtítulo */}
                    <p className="text-white/90 text-base md:text-lg font-medium drop-shadow-lg mb-1">
                      {trip.title.length > 40 ? trip.title.substring(0, 40) + '...' : trip.title}
                    </p>

                    {/* Fechas o duración */}
                    <p className="text-white/80 text-sm">
                      {trip.duration} días
                    </p>
                  </div>

                  {/* Botón ENTRAR estilo ghost - centrado abajo */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300">
                    <div className="border-2 border-white text-white group-hover:bg-white group-hover:text-primary-900 px-8 py-2.5 rounded-lg text-base md:text-lg font-bold uppercase transition-all duration-300 flex items-center shadow-xl">
                      <span>Entrar</span>
                      <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Badge de últimos lugares si aplica */}
                  {trip.available_spots <= 5 && (
                    <div className="absolute bottom-3 right-3 bg-red-600 text-white py-1 px-3 rounded-full text-xs font-bold uppercase shadow-lg animate-pulse z-10">
                      {trip.available_spots} cupos
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Botón "Ver todos" si hay más viajes */}
        {trips.length > maxItems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              to="/viajes"
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Ver todos los paquetes
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
