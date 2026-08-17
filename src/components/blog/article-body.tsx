import type { Article } from "@/sanity/types";
import PortableTextRenderer from "@/sanity/portable-text";

export default function ArticleBody({ post }: { post: Article }) {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[800px] mx-auto">
        {post.author && (
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[#e5e5e5]">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || ""}
                className="size-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-14 rounded-full bg-[#edf2ea] flex items-center justify-center shrink-0">
                <span className="font-aboreto text-sm text-brand">
                  {post.author.name?.charAt(0) || "O"}
                </span>
              </div>
            )}
            <div>
              <p className="font-clash-display text-lg text-[#161618]">
                {post.author.name || "Oregon Swift Team"}
              </p>
              {post.author.role && (
                <p className="font-dm-sans text-base text-[#504c4c]">
                  {post.author.role}
                </p>
              )}
            </div>
          </div>
        )}

        <PortableTextRenderer value={post.body} />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-12 pt-8 border-t border-[#e5e5e5]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-[#f7f7f7] px-4 py-2 font-dm-sans text-sm text-[#504c4c]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
