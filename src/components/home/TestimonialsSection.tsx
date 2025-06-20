import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    quote: "Viajé a Brasil con Don Agustín y fue una experiencia increíble. El servicio y la atención superaron mis expectativas.",
    author: "María Rodríguez",
    location: "Montevideo",
    rating: 5,
  },
  {
    id: '2',
    quote: "Siempre elijo Don Agustín para mis viajes. Su profesionalismo y conocimiento me dan tranquilidad para disfrutar al máximo.",
    author: "Carlos Martínez",
    location: "Punta del Este",
    rating: 5,
  },
  {
    id: '3',
    quote: "El viaje a Bariloche fue perfecto. Cada detalle estaba cuidadosamente planificado. ¡Definitivamente volveré a viajar con ellos!",
    author: "Laura Fernández",
    location: "Colonia",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-8 overflow-hidden">
      {/* Responsive Background Image */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Background */}
        <div 
          className="hidden md:block absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Mobile Background */}
        <div 
          className="block md:hidden absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundAttachment: 'scroll',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/85 via-secondary-800/80 to-primary-900/85"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            Experiencias reales de viajeros que confiaron en nosotros
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-card"
            >
              <div className="flex mb-3 md:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 md:h-5 md:w-5 text-primary-600 fill-current"
                  />
                ))}
              </div>
              <p className="text-secondary-600 mb-3 md:mb-4 italic text-sm md:text-base">"{testimonial.quote}"</p>
              <div>
                <p className="font-heading font-bold text-secondary-900 text-sm md:text-base">
                  {testimonial.author}
                </p>
                <p className="text-secondary-500 text-xs md:text-sm">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}