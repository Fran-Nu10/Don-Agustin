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
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-secondary-600">
            Experiencias reales de viajeros que confiaron en nosotros
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-secondary-50 rounded-lg p-6 shadow-card"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-primary-950 fill-current"
                  />
                ))}
              </div>
              <p className="text-secondary-600 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-heading font-bold text-secondary-900">
                  {testimonial.author}
                </p>
                <p className="text-secondary-500 text-sm">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}