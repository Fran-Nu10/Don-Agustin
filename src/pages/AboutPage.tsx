import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Shield, MapPin, Clock, Star, Heart } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function AboutPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow main-content">
        {/* Hero Section with Background */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg"
              alt="Don Agustín Viajes Office"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/80 via-secondary-800/70 to-primary-900/80"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                Sobre Nosotros
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Más de 25 años creando experiencias inolvidables
              </p>
            </motion.div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading font-bold text-3xl mb-6 text-secondary-900">
                  Nuestra Historia
                </h2>
                <div className="prose prose-lg">
                  <p className="text-secondary-600">
                    Don Agustín Viajes nació en 1997 con una misión clara: brindar servicios 
                    integrales de viajes con un toque personal y profesional. Desde entonces, 
                    hemos crecido hasta convertirnos en una referencia en el mercado nacional 
                    de viajes y excursiones.
                  </p>
                  <p className="text-secondary-600">
                    A lo largo de estos años, hemos tenido el privilegio de ayudar a miles de 
                    viajeros a descubrir nuevos destinos y crear recuerdos inolvidables. Nuestra 
                    experiencia nos ha permitido desarrollar un profundo conocimiento de la 
                    industria y establecer relaciones sólidas con proveedores de todo el mundo.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative h-[400px] rounded-lg overflow-hidden"
              >
                <img
                  src="https://images.pexels.com/photos/7625042/pexels-photo-7625042.jpeg"
                  alt="Don Agustín Viajes Through the Years"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section with Background */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg"
              alt="Values Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/85 to-secondary-900/90"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading font-bold text-3xl text-white mb-4">
                Nuestros Valores
              </h2>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                Los pilares que guían nuestro trabajo diario y nos ayudan a brindar 
                el mejor servicio a nuestros clientes
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ValueCard
                icon={<Award />}
                title="Profesionalismo"
                description="Experiencia y conocimiento al servicio de nuestros clientes"
              />
              <ValueCard
                icon={<Users />}
                title="Servicio"
                description="Atención personalizada y asesoramiento experto"
              />
              <ValueCard
                icon={<Target />}
                title="Compromiso"
                description="Dedicación total a la satisfacción del cliente"
              />
              <ValueCard
                icon={<Shield />}
                title="Respaldo"
                description="Garantía y seguridad en todos nuestros servicios"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-secondary-50 p-8 rounded-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <Star className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-secondary-900">
                    Nuestra Misión
                  </h3>
                </div>
                <p className="text-secondary-600">
                  Convertirnos en una agencia que no solo ofrezca calidad, profesionalismo 
                  y respaldo, sino también integridad, para lograr que cada viaje sea una 
                  experiencia inolvidable, cuidando siempre la mejor relación costo-beneficio.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-secondary-50 p-8 rounded-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <Heart className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-secondary-900">
                    Nuestra Visión
                  </h3>
                </div>
                <p className="text-secondary-600">
                  Ser una herramienta indispensable al momento de viajar, trabajando en 
                  equipo y orientados a agregar valor, logrando la preferencia y fidelidad 
                  de nuestros clientes.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-secondary-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-card"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-4 text-secondary-900">
                  Destinos Únicos
                </h4>
                <p className="text-secondary-600">
                  Ofrecemos una cuidadosa selección de destinos nacionales e internacionales, 
                  cada uno elegido por su belleza y experiencias únicas.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-card"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-4 text-secondary-900">
                  Experiencia Comprobada
                </h4>
                <p className="text-secondary-600">
                  Más de 25 años en el mercado nos respaldan, brindando seguridad y 
                  confianza a todos nuestros viajeros.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-card lg:col-span-1 md:col-span-2 lg:col-start-3"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-4 text-secondary-900">
                  Atención Personalizada
                </h4>
                <p className="text-secondary-600">
                  Nuestro equipo de expertos está siempre disponible para brindarte 
                  asesoramiento personalizado y resolver todas tus dudas.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-card"
    >
      <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <div className="text-primary-600">
          {icon}
        </div>
      </div>
      <h4 className="font-heading font-bold text-xl mb-2 text-secondary-900">
        {title}
      </h4>
      <p className="text-secondary-600">
        {description}
      </p>
    </motion.div>
  );
}