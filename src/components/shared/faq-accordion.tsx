export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="max-w-[800px] mx-auto divide-y divide-[#e2e2e2] border-y border-[#e2e2e2]">
      {items.map((item) => (
        <details key={item.question} className="group py-6">
          <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
            <span className="font-clash-display text-xl text-[#161618]">
              {item.question}
            </span>
            <span className="relative size-6 shrink-0">
              <span className="absolute top-1/2 left-0 -translate-y-1/2 w-6 h-0.5 bg-[#161618]" />
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[#161618] transition-transform group-open:scale-y-0" />
            </span>
          </summary>
          <p className="font-dm-sans text-lg text-[#504c4c] leading-relaxed mt-4">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
