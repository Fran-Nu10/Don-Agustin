import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBlogPosts, getBlogCategories } from '../lib/supabase/blog';
import { BlogPost, BlogCategory } from '../types/blog';
import { toast } from 'react-hot-toast';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getBlogCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog data:', error);
      toast.error('Error al cargar los artículos del blog');
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allCategories = ['Todos', ...categories.map(cat => cat.name)];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-secondary-50 via-white to-secondary-50 main-content">
        {/* Hero Section with Responsive Background */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Desktop Background */}
            <div 
              className="hidden md:block absolute inset-0"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg)',
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
                backgroundImage: 'url(https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                backgroundAttachment: 'scroll',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-secondary-900/80"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-12"
            >
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6">
                Blog de Viajes
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                Inspiración, consejos y experiencias para tu próxima aventura
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Filters */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center mb-4 md:mb-6">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-full transition-colors text-sm md:text-base ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gradient-to-br from-white to-secondary-50 text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
              <p className="text-secondary-500">Cargando artículos...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-white via-secondary-50 to-white rounded-lg shadow-sm">
              <p className="text-secondary-500">No se encontraron artículos.</p>
              <p className="text-secondary-400 mt-2">
                {searchTerm || selectedCategory !== 'Todos' 
                  ? 'Intenta con otros términos de búsqueda o categorías.'
                  : 'Aún no hay artículos publicados en el blog.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block bg-gradient-to-br from-white via-white to-secondary-50 rounded-lg overflow-hidden shadow-card group cursor-pointer h-full hover:shadow-lg transition-all duration-300"
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
                    
                    <div className="p-4 md:p-6 flex flex-col h-full">
                      <div className="flex items-center text-secondary-500 text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {post.published_at && format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                      
                      <h3 className="font-heading font-bold text-lg md:text-xl mb-2 text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-secondary-600 mb-4 line-clamp-3 flex-grow text-sm md:text-base">
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
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}