import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBlogPosts } from '../../lib/supabase/blog';
import { BlogPost } from '../../types/blog';


export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const postsData = await getBlogPosts();
      setPosts(postsData.slice(0, 3)); // Show only the latest 3 posts
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-b from-secondary-50 via-white/80 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-secondary-500">Cargando artículos del blog...</p>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show the section if there are no posts
  }

  return (
    <section className="py-8 bg-gradient-to-b from-secondary-50 via-white/80 to-secondary-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-3">
            Blog de Viajes
          </h2>
          <p className="text-lg text-secondary-600">
            Inspiración, consejos y experiencias para tu próxima aventura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="block bg-gradient-to-br from-white to-secondary-50 rounded-lg overflow-hidden shadow-card group cursor-pointer h-full hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-primary-600 text-white text-sm px-3 py-1 rounded-full">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center text-secondary-500 text-sm mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {(() => {
                        const publishedDate = post.published_at ? new Date(post.published_at) : null;
                        return publishedDate ? format(publishedDate, 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible';
                      })()}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-secondary-600 mb-4 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 mt-auto">
                    <span>Leer más</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {posts.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Ver todos los artículos
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}