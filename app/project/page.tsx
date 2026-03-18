import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project | Hejia Geng" };

export default function ProjectPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      <section className="max-w-3xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          04 / Project
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          Project
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed">
          A separate page for products, systems, and case studies.
        </p>
      </section>

      <section className="border-t border-line pt-6">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-4">
          Status
        </p>
        <h2 className="font-serif font-semibold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] text-ink mb-4">
          Coming soon.
        </h2>
        <p className="text-stone text-[17px] leading-[1.75]">
          This page is reserved for projects once there is enough material for a
          proper write-up.
        </p>
      </section>
    </div>
  );
}
