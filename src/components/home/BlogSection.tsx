import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: '1',
    title: 'Tips para viajar mejor',
    excerpt: 'Descubre los mejores consejos para hacer de tu próximo viaje una experiencia inolvidable.',
    image_url: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
    category: 'Consejos',
    date: '2024-03-15',
  },
  {
    id: '2',
    title: 'Lugares que no te podés perder',
    excerpt: 'Explora los destinos más impresionantes y descubre por qué deberían estar en tu lista.',
    image_url: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg',
    category: 'Destinos',
    date: '2024-03-10',
  },
  {
    id: '3',
    title: 'Rankings sobre nuestros destinos',
    excerpt: 'Los mejores destinos según nuestros viajeros. Descubre qué lugares son los favoritos.',
    image_url: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
    category: 'Rankings',
    date: '2024-03-05',
  },
];

export function BlogSection() {
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
            Blog de Viajes
          </h2>
          <p className="text-lg text-secondary-600">
            Inspiración, consejos y experiencias para tu próxima aventura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-card group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-4 left-4 bg-primary-950 text-white text-sm px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900 group-hover:text-primary-950 transition-colors">
                  {post.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-primary-950 font-medium group-hover:text-primary-800">
                  <span>Leer más</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}