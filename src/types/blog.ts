export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author_id: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    email: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  status: BlogPost['status'];
}