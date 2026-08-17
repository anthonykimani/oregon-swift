import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { POST_BY_SLUG_QUERY, RELATED_POSTS_QUERY } from "@/sanity/queries";
import type { Article, PostCard } from "@/sanity/types";
import ArticleHero from "@/components/blog/article-hero";
import ArticleBody from "@/components/blog/article-body";
import BlogGrid from "@/components/blog/blog-grid";
import NewsletterCTA from "@/components/blog/newsletter-cta";

const options = { next: { revalidate: 60 } };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<Article | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    options
  );

  if (!post) return {};

  return {
    title: `${post.title} — Oregon Swift Deliveries`,
    description: post.excerpt || undefined,
    openGraph: post.mainImage
      ? { images: [{ url: post.mainImage }] }
      : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch<Article | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    options
  );

  if (!post) notFound();

  const related = await client.fetch<PostCard[]>(
    RELATED_POSTS_QUERY,
    { slug },
    options
  );

  return (
    <main>
      <ArticleHero post={post} />
      <ArticleBody post={post} />
      <BlogGrid posts={related} heading="Read more" />
      <NewsletterCTA />
    </main>
  );
}
