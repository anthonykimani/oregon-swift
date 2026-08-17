import { format } from "date-fns";
import type { PostCard } from "@/sanity/types";

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return format(d, "MMM d, yyyy");
}

export default function PostCard({ post }: { post: PostCard }) {
  const date = formatDate(post.publishedAt);

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-[#f7f7f7] overflow-hidden hover:opacity-90 transition-opacity"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[#edf2ea]">
        {post.mainImage ? (
          <img
            src={post.mainImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-aboreto text-sm text-brand">OC</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6 flex-1">
        {post.category?.title && (
          <span className="self-start inline-flex rounded-full bg-white px-3 py-1 font-dm-sans text-xs uppercase tracking-wide text-[#2D5A3A]">
            {post.category.title}
          </span>
        )}
        <h3 className="font-clash-display text-xl text-[#161618] leading-snug group-hover:text-brand transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-dm-sans text-base text-[#504c4c] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2 font-dm-sans text-sm text-[#8094A7]">
          {date}
        </div>
      </div>
    </a>
  );
}
