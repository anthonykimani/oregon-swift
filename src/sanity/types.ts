export interface PostCard {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: { title?: string; slug?: string } | null;
  author?: { name?: string; role?: string } | null;
  publishedAt?: string | null;
  featured?: boolean | null;
  mainImage?: string | null;
}

export interface Article extends PostCard {
  author?: { name?: string; role?: string; image?: string | null } | null;
  tags?: string[] | null;
  body?: unknown;
}
