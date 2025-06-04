import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plane, Umbrella, Users, Mountain, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: '1',
    title: 'Viajes Nacionales',
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
    <section className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-4">
            Descubre Nuestros Viajes
          </h2>
          <p className="text-lg text-secondary-600">
            Encuentra el viaje perfecto para cada ocasión
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="block bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow group"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4 group-hover:bg-primary-200 transition-colors">
                    <div className="text-primary-950">
                      {category.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-secondary-900 group-hover:text-primary-950 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-secondary-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}