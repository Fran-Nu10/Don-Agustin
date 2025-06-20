import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { TripSearch } from '../components/trips/TripSearch';
import { TripCarousel } from '../components/trips/TripCarousel';
import { GroupTripsCarousel } from '../components/trips/GroupTripsCarousel';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { BlogSection } from '../components/home/BlogSection';
import { DreamTripsSection } from '../components/home/DreamTripsSection';
import { MapPin, Plane, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../hooks/useTrips';
import { FeatureCard } from '../components/home/FeatureCard';

export function HomePage() {
  const { trips, loading } = useTrips();

  // Get unique destinations for search
  const destinations = [...new Set(trips.map((trip) => trip.destination))].sort();

  // Filter trips by category
  const nationalTrips = trips.filter(trip => trip.category === 'nacional');
  const internationalTrips = trips.filter(trip => trip.category === 'internacional');
  const groupTrips = trips.filter(trip => trip.category === 'grupal');

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
                backgroundImage: 'url(https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg)',
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
                backgroundImage: 'url(https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg)',
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
                backgroundImage: 'url(https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg)',
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
                Tu próxima aventura empieza aquí
              </h1>
            </motion.div>

            <TripSearch destinations={destinations} />
          </div>
        </section>

        {/* Featured Trips - REDUCED SPACING */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-secondary-500">Cargando viajes...</p>
          </div>
        ) : (
          <>
            {/* National Trips - Moved up */}
            {nationalTrips.length > 0 && (
              <div className="py-8">
                <TripCarousel
                  trips={nationalTrips}
                  title="Viajes Nacionales"
                  subtitle="Descubre los mejores destinos de Uruguay"
                />
              </div>
            )}
            
            {/* International Trips - Moved up */}
            {internationalTrips.length > 0 && (
              <div className="py-8">
                <TripCarousel
                  trips={internationalTrips}
                  title="Viajes Internacionales"
                  subtitle="Explora destinos alrededor del mundo"
                />
              </div>
            )}
            
            {/* Group Trips - Moved down */}
            {groupTrips.length > 0 && (
              <div className="py-8">
                <GroupTripsCarousel trips={groupTrips} />
              </div>
            )}
          </>
        )}

        {/* Features Section - Moved below all trip sections - REDUCED SPACING */}
        <section className="py-8 bg-gradient-to-b from-white to-secondary-50">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-6 text-secondary-900">
              ¿Por qué elegirnos?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <FeatureCard
                icon={<MapPin className="h-8 w-8" />}
                title="Destinos Únicos"
                description="Ofrecemos destinos cuidadosamente seleccionados para brindarte experiencias inolvidables."
                bgImage="https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg"
              />
              <FeatureCard
                icon={<Plane className="h-8 w-8" />}
                title="Transporte de Calidad"
                description="Viaja con comodidad y seguridad en nuestros medios de transporte seleccionados."
                bgImage="https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg"
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8" />}
                title="Más de 25 Años"
                description="Más de dos décadas de experiencia organizando viajes perfectos para nuestros clientes."
                bgImage="https://images.pexels.com/photos/1252500/pexels-photo-1252500.jpeg"
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Garantía de Satisfacción"
                description="Tu satisfacción es nuestra prioridad. Estamos contigo en cada paso del viaje."
                bgImage="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
              />
            </div>
          </div>
        </section>

        {/* Dream Trips Section - REDUCED SPACING */}
        {!loading && trips.length > 0 && (
          <div className="py-8 bg-white">
            <DreamTripsSection trips={trips} />
          </div>
        )}

        {/* Testimonials - REDUCED SPACING */}
        <div className="py-8">
          <TestimonialsSection />
        </div>

        {/* Blog Section - REDUCED SPACING */}
        <div className="py-8">
          <BlogSection />
        </div>
        
        {/* CTA Section with Responsive Background - REDUCED SPACING */}
        <section className="relative py-8 overflow-hidden">
          {/* Responsive Background */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-primary-600"
              style={{
                backgroundImage: 'linear-gradient(135deg, #F2940A 0%, #EB951C 50%, #C4730A 100%)'
              }}
            />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-lg md:text-xl text-white mb-6 max-w-3xl mx-auto">
              Explora nuestros destinos y encuentra el viaje perfecto para ti. Déjanos llevarte a lugares increíbles.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link to="/viajes">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Ver destinos
                </Button>
              </Link>
              <Link to="/contacto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-primary-700">
                  Contáctanos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}