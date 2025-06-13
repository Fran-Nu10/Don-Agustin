import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { TripSearch } from '../components/trips/TripSearch';
import { TripCarousel } from '../components/trips/TripCarousel';
import { GroupTripsCarousel } from '../components/trips/GroupTripsCarousel';
import { TravelCategoriesSection } from '../components/home/TravelCategoriesSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { BlogSection } from '../components/home/BlogSection';
import { MapPin, Plane, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../hooks/useTrips';

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
        {/* Hero Section with Parallax Effect */}
        <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Parallax Background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          </div>
          
          {/* Content with padding top to account for fixed navbar */}
          <div className="container mx-auto px-4 relative z-10 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="font-heading font-bold text-4xl md:text-6xl text-white mb-8">
                Tu próxima aventura empieza aquí
              </h1>
            </motion.div>

            <TripSearch destinations={destinations} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl text-center mb-12 text-secondary-900">
              ¿Por qué elegirnos?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<MapPin className="h-10 w-10 text-primary-600" />}
                title="Destinos Únicos"
                description="Ofrecemos destinos cuidadosamente seleccionados para brindarte experiencias inolvidables."
              />
              <FeatureCard
                icon={<Plane className="h-10 w-10 text-primary-600" />}
                title="Transporte de Calidad"
                description="Viaja con comodidad y seguridad en nuestros medios de transporte seleccionados."
              />
              <FeatureCard
                icon={<Clock className="h-10 w-10 text-primary-600" />}
                title="Más de 25 Años"
                description="Más de dos décadas de experiencia organizando viajes perfectos para nuestros clientes."
              />
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-primary-600" />}
                title="Garantía de Satisfacción"
                description="Tu satisfacción es nuestra prioridad. Estamos contigo en cada paso del viaje."
              />
            </div>
          </div>
        </section>

        {/* Featured Trips */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-secondary-500">Cargando viajes...</p>
          </div>
        ) : (
          <>
            {/* Group Trips */}
            {groupTrips.length > 0 && (
              <GroupTripsCarousel trips={groupTrips} />
            )}
            
            {/* National Trips */}
            {nationalTrips.length > 0 && (
              <TripCarousel
                trips={nationalTrips}
                title="Viajes Nacionales"
                subtitle="Descubre los mejores destinos de Uruguay"
              />
            )}
            
            {/* International Trips */}
            {internationalTrips.length > 0 && (
              <TripCarousel
                trips={internationalTrips}
                title="Viajes Internacionales"
                subtitle="Explora destinos alrededor del mundo"
              />
            )}
          </>
        )}

        {/* Travel Categories */}
        <TravelCategoriesSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Blog Section */}
        <BlogSection />
        
        {/* CTA Section */}
        <section className="py-16 bg-primary-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl text-white mb-6">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Explora nuestros destinos y encuentra el viaje perfecto para ti. Déjanos llevarte a lugares increíbles.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link to="/viajes">
                <Button size="lg" variant="secondary">
                  Ver destinos
                </Button>
              </Link>
              <Link to="/contacto">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-primary-700">
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg p-6 text-center shadow-card"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900">{title}</h3>
      <p className="text-secondary-600">{description}</p>
    </motion.div>
  );
}