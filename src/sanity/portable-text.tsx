import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "./image";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-clash-display text-2xl md:text-[40px] leading-tight text-[#161618] mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-clash-display text-xl md:text-[28px] leading-tight text-[#161618] mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="font-dm-sans text-lg text-[#161618] leading-relaxed my-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand pl-6 my-6 font-dm-sans text-lg text-[#2D5A3A] leading-relaxed italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 my-4 font-dm-sans text-lg text-[#161618] leading-relaxed">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 my-4 font-dm-sans text-lg text-[#161618] leading-relaxed">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        {value?.asset && (
          <img
            src={urlFor(value.asset).width(1200).url()}
            alt={value.alt || ""}
            className="w-full rounded-3xl"
          />
        )}
      </figure>
    ),
    imageWithCaption: ({ value }) => (
      <figure className="my-8">
        {value?.image?.asset && (
          <img
            src={urlFor(value.image.asset).width(1200).url()}
            alt={value.alt || value.caption || ""}
            className="w-full rounded-3xl"
          />
        )}
        {value?.caption && (
          <figcaption className="font-dm-sans text-sm text-[#8094A7] mt-3">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    callout: ({ value }) => (
      <div className="rounded-3xl bg-brand p-8 md:p-12 my-8">
        {value?.heading && (
          <h3 className="font-clash-display text-2xl text-white">
            {value.heading}
          </h3>
        )}
        {value?.text && (
          <p className="font-dm-sans text-lg text-white/90 mt-3 leading-relaxed">
            {value.text}
          </p>
        )}
      </div>
    ),
    quote: ({ value }) => (
      <div className="rounded-3xl bg-[#edf2ea] p-8 md:p-12 my-8">
        {value?.quote && (
          <p className="font-dm-sans text-xl text-[#173420] leading-relaxed font-medium">
            &ldquo;{value.quote}&rdquo;
          </p>
        )}
        {value?.attribution && (
          <p className="font-dm-sans text-lg text-[#2D5A3A] mt-4">
            &mdash; {value.attribution}
          </p>
        )}
      </div>
    ),
  },
};

export default function PortableTextRenderer({ value }: { value: unknown }) {
  return <PortableText value={value} components={components} />;
}
