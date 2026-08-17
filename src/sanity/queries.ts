import { defineQuery } from "next-sanity";

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "category": category->{ title, "slug": slug.current },
    "author": author->{ name, role },
    publishedAt,
    featured,
    "mainImage": mainImage.asset->url
  }
`);

export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "category": category->{ title, "slug": slug.current },
    "author": author->{ name, role, "image": image.asset->url },
    publishedAt,
    tags,
    "mainImage": mainImage.asset->url,
    body
  }
`);

export const RELATED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    "category": category->{ title },
    publishedAt,
    "mainImage": mainImage.asset->url
  }
`);
