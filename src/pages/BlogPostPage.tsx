import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { Calendar, Tag, Share2, Facebook, Twitter, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { blogPosts } from '../lib/mockData';

export function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-secondary-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              Artículo no encontrado
            </h1>
            <Link
              to="/blog"
              className="text-primary-950 hover:underline"
            >
              Volver al blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedPosts = post.related_posts
    ? blogPosts.filter(p => post.related_posts?.includes(p.id))
    : [];

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[400px]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto -mt-20 relative"
          >
            {/* Post Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-primary-950 text-white text-sm px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center text-secondary-500 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(post.date), 'dd MMM yyyy', { locale: es })}
                </div>
              </div>
              
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-secondary-900 mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center text-secondary-600 mb-6">
                <span>Por {post.author}</span>
              </div>
              
              {/* Share Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-secondary-600 flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="text-secondary-600 hover:text-primary-950 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="text-secondary-600 hover:text-primary-950 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="text-secondary-600 hover:text-primary-950 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="prose prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-secondary-100 text-secondary-600 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="font-heading font-bold text-2xl text-secondary-900 mb-6">
                  Te puede interesar
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="group"
                    >
                      <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-secondary-900 group-hover:text-primary-950 transition-colors">
                        {relatedPost.title}
                      </h3>
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