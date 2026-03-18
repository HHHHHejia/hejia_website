import type { Metadata } from "next";
import { papers, groupByYear } from "@/data/research-data";

export const metadata: Metadata = { title: "Research | Hejia Geng" };

export default function ResearchPage() {
  const grouped = groupByYear(papers);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          02 / Research
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          Research
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed">
          Publications and preprints.
        </p>
      </section>

      {/* Papers */}
      <section className="border-t border-line pt-6">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-6">
          Publications
        </p>
        <div className="grid gap-0">
          {Array.from(grouped.entries()).map(([year, yearPapers]) => (
            <div key={year}>
              {yearPapers.map((paper, i) => (
                <a
                  key={i}
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-t border-line py-5 no-underline group transition-opacity hover:opacity-70"
                >
                  <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
                    {paper.year} &middot; {paper.venue}
                  </span>
                  <span className="block mt-2 font-serif text-[clamp(22px,3vw,30px)] leading-[1.1] tracking-[-0.03em] text-ink">
                    {paper.title}
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>

        <a
          href="https://scholar.google.com/citations?user=ameiXi0AAAAJ&hl=en"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-8 text-stone text-[15px] no-underline hover:text-vermillion transition-colors border-b border-line-strong pb-0.5"
        >
          Google Scholar
        </a>
      </section>
    </div>
  );
}
