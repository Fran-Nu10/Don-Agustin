import { supabase } from './client';
import { BlogPost, BlogCategory, BlogTag, BlogFormData } from '../../types/blog';
import { sanitizeBlogData } from '../../utils/dataSanitizer';

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author_id,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(email)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author_id,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author_id,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(email)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createBlogPost(data: BlogFormData): Promise<BlogPost> {
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  console.log('🧹 [CREATE BLOG POST] Aplicando sanitización de datos...');
  const sanitizedData = sanitizeBlogData(data);
  console.log('✅ [CREATE BLOG POST] Datos sanitizados aplicados');

  // Get user from users table using the current user's ID
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', user.user.id)
    .single();

  if (userDataError) {
    console.error('Error fetching user data:', userDataError);
    throw new Error('No se pudo obtener la información del usuario');
  }

  const slug = sanitizedData.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      ...sanitizedData,
      slug,
      author_id: userData.id,
      published_at: sanitizedData.status === 'published' ? new Date().toISOString() : null,
    })
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author_id,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(email)
    `)
    .single();

  if (error) throw error;
  return post;
}

export async function updateBlogPost(id: string, data: Partial<BlogFormData>): Promise<BlogPost> {
  console.log('🧹 [UPDATE BLOG POST] Aplicando sanitización de datos...');
  const sanitizedData = sanitizeBlogData(data);
  console.log('✅ [UPDATE BLOG POST] Datos sanitizados aplicados');
  
  const updateData: any = {
    ...sanitizedData,
    updated_at: new Date().toISOString(),
  };

  if (sanitizedData.status === 'published' && !sanitizedData.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author_id,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(email)
    `)
    .single();

  if (error) throw error;
  return post;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}