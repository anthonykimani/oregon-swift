import { format } from "date-fns";
import type { Article } from "@/sanity/types";

export default function ArticleHero({ post }: { post: Article }) {
  const date = post.publishedAt
    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
    : null;

  return (
    <section className="relative bg-[#fcfcfc]">
      <div className="relative w-full h-[420px] md:h-[600px]">
        {post.mainImage ? (
          <img
            src={post.mainImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#173420]" />
        )}
        <div className="absolute inset-0 bg-[#173420]/70" />

        <div className="absolute inset-0 flex items-center justify-center px-6 lg:px-[100px]">
          <div className="max-w-[800px] text-center">
            {post.category?.title && (
              <span className="inline-flex rounded-full bg-white px-4 py-2 font-dm-sans text-base text-[#161618]">
                {post.category.title}
              </span>
            )}
            <h1 className="font-clash-display text-3xl md:text-5xl lg:text-[56px] leading-[1.1] text-white mt-6">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-dm-sans text-lg text-white/85 mt-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 mt-8 font-dm-sans text-base text-white/80">
              {post.author?.name && <span>{post.author.name}</span>}
              {post.author?.name && date && <span>·</span>}
              {date && <span>{date}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
