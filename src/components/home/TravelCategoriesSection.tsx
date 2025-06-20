import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Plane, Umbrella, Users, Mountain, Anchor } from 'lucide-react';

const categories = [
  {
    id: '1',
    title: 'Paquetes Nacionales',
    description: 'Descubre los tesoros de Uruguay',
    icon: <MapPin className="h-8 w-8" />,
    link: '/viajes?category=nacional',
  },
  {
    id: '2',
    title: 'Internacionales',
    description: 'Explora el mundo con nosotros',
    icon: <Plane className="h-8 w-8" />,
    link: '/viajes?category=internacional',
  },
  {
    id: '3',
    title: 'Escapadas',
    description: 'Breaks perfectos para desconectar',
    icon: <Umbrella className="h-8 w-8" />,
    link: '/viajes?category=escapada',
  },
  {
    id: '4',
    title: 'Turismo Familiar',
    description: 'Diversión para toda la familia',
    icon: <Users className="h-8 w-8" />,
    link: '/viajes?category=familiar',
  },
  {
    id: '5',
    title: 'Turismo Aventura',
    description: 'Experiencias únicas y emocionantes',
    icon: <Mountain className="h-8 w-8" />,
    link: '/viajes?category=aventura',
  },
  {
    id: '6',
    title: 'Cruceros',
    description: 'Navega hacia nuevos horizontes',
    icon: <Anchor className="h-8 w-8" />,
    link: '/viajes?category=crucero',
  },
];

export function TravelCategoriesSection() {
  return (
    <section className="py-6 bg-gradient-to-b from-secondary-50 via-white/80 to-secondary-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-3">
            Descubre Nuestros Paquetes
          </h2>
          <p className="text-lg text-secondary-600">
            Encuentra el paquete perfecto para cada ocasión
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={category.link}
                className="block h-full rounded-lg overflow-hidden shadow-lg group"
              >
                <div className="h-full bg-gradient-to-br from-white via-secondary-50 to-primary-50 p-6 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary-50 group-hover:via-primary-100/50 group-hover:to-white">
                  <div className="flex items-center mb-3">
                    <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                      {category.icon}
                    </div>
                    <h4 className="font-heading font-bold text-lg text-secondary-900">
                      {category.title}
                    </h4>
                  </div>
                  <p className="text-secondary-600">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}