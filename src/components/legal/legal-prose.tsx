export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export default function LegalProse({ sections }: { sections: LegalSection[] }) {
  return (
    <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[800px] mx-auto space-y-12">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-clash-display text-2xl md:text-[32px] leading-tight text-[#161618]">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="font-dm-sans text-lg text-[#161618] leading-relaxed mt-4"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
