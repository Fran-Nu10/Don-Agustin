import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { Calendar, Share2, Facebook, Twitter, Send, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBlogPost, getBlogPosts } from '../lib/supabase/blog';
import { BlogPost } from '../types/blog';
import { toast } from 'react-hot-toast';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  async function loadPost(postSlug: string) {
    try {
      setLoading(true);
      const [postData, allPosts] = await Promise.all([
        getBlogPost(postSlug),
        getBlogPosts(),
      ]);
      
      setPost(postData);
      
      if (postData) {
        // Get related posts from the same category
        const related = allPosts
          .filter(p => p.id !== postData.id && p.category === postData.category)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      toast.error('Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-secondary-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
            <p className="text-secondary-500">Cargando artículo...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center bg-secondary-50">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Artículo no encontrado
            </h1>
            <p className="text-secondary-600 mb-6">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center text-primary-950 hover:text-primary-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareText = `Leé "${post.title}" en Don Agustín Viajes`;

  const handleShare = (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      // Handle images in markdown format
      const imageMatch = paragraph.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        return (
          <div key={index} className="my-8">
            <img
              src={src}
              alt={alt || 'Imagen del artículo'}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
            />
            {alt && (
              <p className="text-center text-sm text-secondary-500 mt-2 italic">
                {alt}
              </p>
            )}
          </div>
        );
      }

      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="font-heading font-bold text-2xl text-secondary-900 mt-8 mb-4 first:mt-0">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="font-heading font-bold text-xl text-secondary-900 mt-6 mb-3">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      return (
        <p key={index} className="mb-4 text-secondary-700 leading-relaxed text-lg">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50">
        {/* Hero Image */}
        <div className="relative h-[60vh] min-h-[400px]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <Link 
              to="/blog" 
              className="inline-flex items-center bg-white/90 backdrop-blur-sm text-secondary-900 hover:bg-white px-4 py-2 rounded-full transition-colors shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Link>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto -mt-32 relative z-10"
          >
            {/* Post Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block bg-primary-950 text-white text-sm font-medium px-4 py-2 rounded-full">
                  {post.category}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-secondary-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-secondary-600 mb-6 pb-6 border-b border-secondary-200">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Por {post.author?.email || 'Don Agustín Viajes'}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {post.published_at && format(new Date(post.published_at), 'dd MMMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
              
              {/* Excerpt */}
              <div className="text-xl text-secondary-700 leading-relaxed mb-6 font-light">
                {post.excerpt}
              </div>
              
              {/* Share Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-secondary-600 flex items-center font-medium">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="Compartir en Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center w-10 h-10 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                  title="Compartir en Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  title="Compartir en WhatsApp"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="prose prose-lg max-w-none">
                {formatContent(post.content)}
              </div>
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="font-heading font-bold text-2xl text-secondary-900 mb-6">
                  Artículos relacionados
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-secondary-900 group-hover:text-primary-950 transition-colors mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-secondary-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}