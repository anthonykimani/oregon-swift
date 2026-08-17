import type { PostCard } from "@/sanity/types";

function FeaturedCard({
  post,
  large = false,
}: {
  post: PostCard;
  large?: boolean;
}) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className={`group relative overflow-hidden rounded-3xl ${
        large ? "aspect-[2/1]" : "aspect-square"
      }`}
    >
      {post.mainImage ? (
        <img
          src={post.mainImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[#edf2ea]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-[56px]">
        {post.category?.title && (
          <span className="inline-flex rounded-lg bg-white px-3 py-2 font-dm-sans text-sm text-[#161618]">
            {post.category.title}
          </span>
        )}
        <h3
          className={`font-clash-display text-white leading-tight mt-4 ${
            large ? "text-2xl md:text-[40px]" : "text-xl md:text-[24px]"
          }`}
        >
          {post.title}
        </h3>
      </div>
    </a>
  );
}

export default function BlogFeatured({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null;

  const [first, second, third] = posts;

  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] pb-8 md:pb-12">
      <div className="max-w-[1240px] mx-auto space-y-6">
        {first && <FeaturedCard post={first} large />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {second && <FeaturedCard post={second} />}
          {third && <FeaturedCard post={third} />}
        </div>
      </div>
    </section>
  );
}
