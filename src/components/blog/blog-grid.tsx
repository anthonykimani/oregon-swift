import PostCard from "./post-card";
import type { PostCard as PostCardType } from "@/sanity/types";

export default function BlogGrid({
  posts,
  heading,
  subtitle,
}: {
  posts: PostCardType[];
  heading: string;
  subtitle?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[80px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="mb-12">
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618]">
            {heading}
          </h2>
          {subtitle && (
            <p className="font-dm-sans text-lg text-[#504c4c] mt-4 max-w-[560px] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
