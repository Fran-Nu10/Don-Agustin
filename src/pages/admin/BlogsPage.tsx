import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { BlogForm } from '../../components/admin/BlogForm';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { BlogPost, BlogFormData } from '../../types/blog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../lib/supabase/blog';

export function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const postsData = await getAllBlogPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar los artículos');
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePost = async (data: BlogFormData) => {
    try {
      setIsSubmitting(true);
      await createBlogPost(data);
      await loadPosts(); // Refresh the posts list
      setShowForm(false);
      toast.success('Artículo creado con éxito');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al crear el artículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (data: BlogFormData) => {
    if (!editingPost) return;
    
    try {
      setIsSubmitting(true);
      await updateBlogPost(editingPost.id, data);
      await loadPosts(); // Refresh the posts list
      setEditingPost(null);
      toast.success('Artículo actualizado con éxito');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error al actualizar el artículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteBlogPost(id);
      await loadPosts(); // Refresh the posts list
      toast.success('Artículo eliminado con éxito');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar el artículo');
    }
  };

  // Filter posts based on search
  const filteredPosts = posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary-900">
            Gestión de Blog
          </h1>
          <p className="text-secondary-500">
            Administra los artículos del blog
          </p>
        </div>
        
        <Button onClick={() => {
          setEditingPost(null);
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo artículo
        </Button>
      </div>
      
      {/* Blog Form */}
      {(showForm || editingPost) && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="font-heading font-bold text-xl text-secondary-900">
              {editingPost ? 'Editar artículo' : 'Crear nuevo artículo'}
            </h2>
          </CardHeader>
          <CardContent>
            <BlogForm
              initialData={editingPost ? {
                title: editingPost.title,
                excerpt: editingPost.excerpt,
                content: editingPost.content,
                image_url: editingPost.image_url,
                category: editingPost.category,
                status: editingPost.status,
              } : undefined}
              onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
              isSubmitting={isSubmitting}
            />
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por título, resumen o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-white border border-secondary-300 rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-secondary-500">Cargando artículos...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-500">No hay artículos que coincidan con tu búsqueda.</p>
          <p className="text-secondary-400 mt-2">Intenta con otros términos o crea un nuevo artículo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-card overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Post Image */}
                <div className="h-48 md:h-full">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Post Info */}
                <div className="p-6 md:col-span-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-secondary-900">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-secondary-500 mt-1">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(post.created_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                        <span>•</span>
                        <span className={`${
                          post.status === 'published' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {post.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-secondary-600 mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {post.status === 'published' && (
                      <Link to={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver artículo
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setShowForm(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}