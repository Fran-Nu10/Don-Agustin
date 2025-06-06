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
      
      <main className="flex-grow bg-secondary-50">
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg"
              alt="Blog Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                Blog de Viajes
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Inspiración, consejos y experiencias para tu próxima aventura
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-950 text-white'
                      : 'bg-white text-secondary-600 hover:bg-secondary-100'
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">Cargando artículos...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-secondary-500">No se encontraron artículos.</p>
              <p className="text-secondary-400 mt-2">
                {searchTerm || selectedCategory !== 'Todos' 
                  ? 'Intenta con otros términos de búsqueda o categorías.'
                  : 'Aún no hay artículos publicados en el blog.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-card group cursor-pointer h-full"
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
                    
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center text-secondary-500 text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {post.published_at && format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                      
                      <h3 className="font-heading font-bold text-xl mb-2 text-secondary-900 group-hover:text-primary-950 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-secondary-600 mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center text-primary-950 font-medium group-hover:text-primary-800 mt-auto">
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