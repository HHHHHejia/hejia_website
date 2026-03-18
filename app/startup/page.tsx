import type { Metadata } from "next";

export const metadata: Metadata = { title: "Startup | Hejia Geng" };

export default function StartupPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          01 / Startup
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          Startup
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed max-w-2xl">
          Building Parthenon, an AI-native legal company focused on narrowing
          the justice gap.
        </p>
      </section>

      {/* Company */}
      <section className="border-t border-line pt-6 mb-14">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-4">
          Company
        </p>
        <h2 className="font-serif font-semibold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] text-ink mb-4">
          Parthenon
        </h2>
        <p className="text-stone text-[17px] leading-[1.75] max-w-3xl">
          The current wedge is an intelligent voice-based intake agent for law
          firms. The longer-term ambition is much larger: use legal AI to make
          access to justice cheaper, broader, and eventually close to ubiquitous.
        </p>
        <a
          href="https://www.parthenon.law/products/aboutus/mission"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 text-stone text-[15px] no-underline hover:text-vermillion transition-colors border-b border-line-strong pb-0.5"
        >
          Mission page
        </a>
      </section>

      {/* Why this */}
      <section className="border-t border-line pt-6 mb-14">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-4">
          Why this
        </p>
        <p className="text-stone text-[17px] leading-[1.75] max-w-3xl">
          Legal services remain expensive while a large share of individuals and
          small businesses go unserved. Parthenon is positioned around a simple
          thesis: start with high-value B2B legal workflows, improve autonomy
          over time, and push the cost of legal help down-market.
        </p>
      </section>

      {/* Roadmap */}
      <section className="border-t border-line pt-6">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-6">
          Roadmap
        </p>
        <div className="grid gap-3">
          {[
            "Intake agent for law firms.",
            "Vertical AI paralegals for high-volume legal domains.",
            "Autonomous AI lawyer accessible to the general public.",
          ].map((text, i) => (
            <div key={i} className="border-t border-line pt-4 pb-4">
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-stone text-[17px] leading-[1.75]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
