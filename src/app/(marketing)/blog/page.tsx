import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostCard } from "@/sanity/types";
import BlogHero from "@/components/blog/blog-hero";
import BlogFeatured from "@/components/blog/blog-featured";
import BlogGrid from "@/components/blog/blog-grid";
import NewsletterCTA from "@/components/blog/newsletter-cta";

export const metadata: Metadata = {
  title: "Blog — Oregon Swift Deliveries",
  description:
    "Expert tips, industry news, and the latest updates from Oregon Swift Deliveries, your Pacific Northwest last-mile delivery partner.",
};

export default async function BlogPage() {
  const posts = await client.fetch<PostCard[]>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 60 } }
  );

  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <main>
      <BlogHero />
      <BlogFeatured posts={featured} />
      <BlogGrid
        posts={rest}
        heading="Latest articles"
        subtitle="More insights, tips, and stories from the Oregon Swift team."
      />
      <NewsletterCTA />
    </main>
  );
}
