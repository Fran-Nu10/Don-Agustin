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
import { TypewriterText } from '../components/home/TypewriterText';
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
        {/* Hero Section with Video Background - VIATUR Style */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg"
            >
              <source
                src="https://videos.pexels.com/video-files/3044494/3044494-uhd_2560_1440_25fps.mp4"
                type="video/mp4"
              />
            </video>

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Typewriter Text - Small Header */}
              <div className="mb-8 md:mb-12">
                <TypewriterText
                  phrases={[
                    'LOS VERDADEROS CREADORES DE EXPERIENCIAS VIP',
                    'DISEÑAMOS TU EXPERIENCIA',
                    'VIAJES PERSONALIZADOS A TU MEDIDA',
                    'ATENCIÓN EXCLUSIVA Y PREMIUM'
                  ]}
                  typingSpeed={80}
                  deletingSpeed={50}
                  pauseTime={2500}
                  className="text-sm md:text-base lg:text-lg text-white/90 font-medium tracking-[0.3em] uppercase drop-shadow-lg"
                />
              </div>

              {/* Main Title - VIATUR Style */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="mb-12 md:mb-16"
              >
                <h1 className="font-heading font-bold leading-tight mb-4">
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-transparent"
                        style={{
                          WebkitTextStroke: '2px white',
                          textStroke: '2px white',
                          paintOrder: 'stroke fill',
                          letterSpacing: '0.02em'
                        }}>
                    VIVÍ EXPERIENCIAS VIP
                  </span>
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white drop-shadow-2xl"
                        style={{ letterSpacing: '0.02em' }}>
                    CON <span className="font-extrabold">VIPTURISMO</span>
                  </span>
                </h1>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link to="/viajes">
                  <Button
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-6 shadow-2xl"
                  >
                    Explorar Destinos
                  </Button>
                </Link>
                <Link to="/cotizacion">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-6 backdrop-blur-sm"
                  >
                    Solicitar Cotización
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search Section - Below Hero */}
        <section className="relative -mt-16 z-20 mb-12">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200/50">
              <TripSearch destinations={destinations} />
            </div>
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
                  subtitle="Experiencias auténticas en los mejores rincones de Uruguay"
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
                  subtitle="Viajes exclusivos a destinos soñados con atención personalizada"
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

        {/* CTA Section - Regala una experiencia */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Image - Luxury resort pool with mountain view */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg)',
                backgroundAttachment: 'fixed'
              }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block mb-6"
              >
                <span className="px-6 py-2 bg-primary-600/90 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/20">
                  EXPERIENCIAS EXCLUSIVAS
                </span>
              </motion.div>

              {/* Main Heading */}
              <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight drop-shadow-2xl">
                ¡Regalá una experiencia única{' '}
                <span className="text-primary-400">ahora!</span>
              </h2>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-white/90 mb-10 drop-shadow-lg max-w-2xl mx-auto">
                Sorprendé a tus seres queridos con momentos inolvidables en destinos paradisíacos
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/viajes">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg md:text-xl px-10 md:px-14 py-4 md:py-5 rounded-full shadow-2xl transition-all duration-300 hover:shadow-primary-600/50 min-w-[250px]"
                  >
                    Ver más destinos
                  </motion.button>
                </Link>
                <Link to="/cotizacion">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-lg md:text-xl px-10 md:px-14 py-4 md:py-5 rounded-full shadow-2xl transition-all duration-300 border-2 border-white/30 min-w-[250px]"
                  >
                    Cotizar ahora
                  </motion.button>
                </Link>
              </div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Paquetes personalizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Atención 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Mejores precios</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}