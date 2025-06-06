import { supabase } from './client';
import { BlogPost, BlogCategory, BlogTag, BlogFormData } from '../../types/blog';

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
      updated_at
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
      author:users!blog_posts_author_id_fkey(id, email)
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
      updated_at
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
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

  // Get user from users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', user.user.id)
    .single();

  if (userDataError) throw userDataError;

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      ...data,
      slug,
      author_id: userData.id,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
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
      author:users!blog_posts_author_id_fkey(id, email)
    `)
    .single();

  if (error) throw error;
  return post;
}

export async function updateBlogPost(id: string, data: Partial<BlogFormData>): Promise<BlogPost> {
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (data.status === 'published' && !data.published_at) {
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
      author:users!blog_posts_author_id_fkey(id, email)
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