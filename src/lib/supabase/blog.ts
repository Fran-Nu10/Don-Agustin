import { supabase } from './client';
import { BlogPost, BlogCategory, BlogTag, BlogFormData } from '../../types/blog';

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:author_id(id, email),
      tags:blog_posts_tags(tag:blog_tags(*))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:author_id(id, email),
      tags:blog_posts_tags(tag:blog_tags(*))
    `)
    .eq('slug', slug)
    .single();

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

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      ...data,
      slug,
      author_id: user.user.id,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  if (data.tags.length > 0) {
    const { error: tagsError } = await supabase
      .from('blog_posts_tags')
      .insert(
        data.tags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId,
        }))
      );

    if (tagsError) throw tagsError;
  }

  return post;
}

export async function updateBlogPost(id: string, data: Partial<BlogFormData>): Promise<BlogPost> {
  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (data.tags) {
    // Delete existing tags
    await supabase
      .from('blog_posts_tags')
      .delete()
      .eq('post_id', id);

    // Insert new tags
    if (data.tags.length > 0) {
      const { error: tagsError } = await supabase
        .from('blog_posts_tags')
        .insert(
          data.tags.map(tagId => ({
            post_id: id,
            tag_id: tagId,
          }))
        );

      if (tagsError) throw tagsError;
    }
  }

  return post;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}