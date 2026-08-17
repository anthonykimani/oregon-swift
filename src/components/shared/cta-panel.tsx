export interface CtaAction {
  label: string;
  href: string;
  primary?: boolean;
}

export default function CtaPanel({
  heading,
  subtext,
  actions,
}: {
  heading: string;
  subtext: string;
  actions: CtaAction[];
}) {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 md:px-12 py-14 md:py-[48px]">
          <div className="absolute -top-20 -right-10 size-[300px] rounded-full bg-[#F3BC24]/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 size-[400px] rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-[640px]">
              <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-white">
                {heading}
              </h2>
              <p className="font-dm-sans text-lg text-white/80 mt-4 leading-relaxed">
                {subtext}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:shrink-0">
              {actions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={
                    action.primary
                      ? "inline-flex justify-center rounded-full bg-[#F3BC24] px-6 py-3 font-inter text-sm font-semibold text-[#173420] hover:opacity-90 transition-opacity whitespace-nowrap"
                      : "inline-flex justify-center rounded-full border border-white/40 px-6 py-3 font-inter text-sm text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                  }
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
