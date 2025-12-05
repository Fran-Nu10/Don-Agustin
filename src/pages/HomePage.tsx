import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { TripSearch } from '../components/trips/TripSearch';
import { TripCarousel } from '../components/trips/TripCarousel';
import { TripGrid } from '../components/trips/TripGrid';
import { PremiumTripsCarousel } from '../components/trips/PremiumTripsCarousel';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { BlogSection } from '../components/home/BlogSection';
import { DreamTripsSection } from '../components/home/DreamTripsSection';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../hooks/useTrips';

export function HomePage() {
  const { trips, loading, error } = useTrips(); // Obtener el estado de error

  // Get unique destinations for search
  const destinations = [...new Set(trips.map((trip) => trip.destination))].sort();

  // Filter trips by category
  const nationalTrips = trips.filter(trip => trip.category === 'nacional');
  const internationalTrips = trips.filter(trip => trip.category === 'internacional');

  // Filter premium trips - those with 'premium' or 'vip' tags, or top price trips
  const premiumTrips = trips
    .filter(trip => trip.tags?.some(tag => tag.toLowerCase().includes('premium') || tag.toLowerCase().includes('vip')))
    .length > 0
    ? trips.filter(trip => trip.tags?.some(tag => tag.toLowerCase().includes('premium') || tag.toLowerCase().includes('vip')))
    : trips
        .sort((a, b) => b.price - a.price)
        .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Improved Responsive Background - REDUCED HEIGHT */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          {/* Responsive Background with Multiple Images */}
          <div className="absolute inset-0 z-0">
            {/* Desktop Background */}
            <div 
              className="hidden lg:block absolute inset-0"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Tablet Background */}
            <div 
              className="hidden md:block lg:hidden absolute inset-0"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                backgroundAttachment: 'scroll',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Mobile Background */}
            <div 
              className="block md:hidden absolute inset-0"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                backgroundAttachment: 'scroll',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Responsive Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 md:from-black/40 md:via-black/25 md:to-black/60"></div>
          </div>
          
          {/* Content with Better Responsive Spacing */}
          <div className="container mx-auto px-4 relative z-10 pt-16 md:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 md:mb-8"
            >
              <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 md:mb-8 leading-tight">
                Viví experiencias VIP únicas
              </h1>
            </motion.div>

            <TripSearch destinations={destinations} />
          </div>
        </section>

        {/* Dream Trips Section - Las mejores ofertas - PRIMERA POSICIÓN */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-secondary-500">Cargando paquetes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg shadow-sm mx-auto max-w-3xl mt-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-red-800 mb-2">
              Error al cargar los paquetes
            </h3>
            <p className="text-red-700 mb-4">
              {error.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        ) : (
          <>
            {trips.length > 0 && (
              <div className="py-8 bg-white">
                <DreamTripsSection trips={trips} />
              </div>
            )}

            {/* Premium Trips - SEGUNDA POSICIÓN */}
            {premiumTrips.length > 0 && (
              <div className="py-8">
                <PremiumTripsCarousel trips={premiumTrips} />
              </div>
            )}

            {/* National Trips - TERCERA POSICIÓN - Grid 4 columnas */}
            {nationalTrips.length > 0 && (
              <div className="py-8 bg-gradient-to-b from-secondary-50 to-white">
                <TripGrid
                  trips={nationalTrips}
                  title="Paquetes Nacionales"
                  subtitle="Descubre los mejores destinos de Uruguay"
                  maxItems={8}
                />
              </div>
            )}

            {/* International Trips - CUARTA POSICIÓN - Grid 4 columnas */}
            {internationalTrips.length > 0 && (
              <div className="py-8 bg-gradient-to-b from-white to-secondary-50">
                <TripGrid
                  trips={internationalTrips}
                  title="Paquetes Internacionales"
                  subtitle="Explora destinos alrededor del mundo"
                  maxItems={8}
                />
              </div>
            )}
          </>
        )}

        {/* Testimonials - REDUCED SPACING */}
        <div className="py-8">
          <TestimonialsSection />
        </div>

        {/* Blog Section - REDUCED SPACING */}
        <div className="py-8">
          <BlogSection />
        </div>

        {/* CTA Section - Inspired by Funtour */}
        <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
          {/* Background with dark pattern */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-8 md:mb-10 leading-tight">
                ¡Regalá una experiencia única{' '}
                <span className="text-primary-500">ahora!</span>
              </h2>

              <Link to="/viajes">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 rounded-full shadow-2xl transition-all duration-300 hover:shadow-primary-600/50"
                >
                  Ver más destinos
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}