"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

export default function StartupPage() {
  const { t } = useLanguage();

  const roadmapItems: TranslationKey[] = [
    "startup.roadmap1",
    "startup.roadmap2",
    "startup.roadmap3",
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          {t("startup.label")}
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          {t("startup.title")}
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed max-w-2xl">
          {t("startup.lede")}
        </p>
      </section>

      {/* Company */}
      <section className="border-t border-line pt-6 mb-14">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-4">
          {t("startup.company")}
        </p>
        <h2 className="font-serif font-semibold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] text-ink mb-4">
          Parthenon
        </h2>
        <p className="text-stone text-[17px] leading-[1.75] max-w-3xl">
          {t("startup.companyDesc")}
        </p>
        <a
          href="https://www.parthenon.law/products/aboutus/mission"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 text-stone text-[15px] no-underline hover:text-vermillion transition-colors border-b border-line-strong pb-0.5"
        >
          {t("startup.mission")}
        </a>
      </section>

      {/* Why this */}
      <section className="border-t border-line pt-6 mb-14">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-4">
          {t("startup.why")}
        </p>
        <p className="text-stone text-[17px] leading-[1.75] max-w-3xl">
          {t("startup.whyDesc")}
        </p>
      </section>

      {/* Roadmap */}
      <section className="border-t border-line pt-6">
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-6">
          {t("startup.roadmap")}
        </p>
        <div className="grid gap-3">
          {roadmapItems.map((key, i) => (
            <div key={i} className="border-t border-line pt-4 pb-4">
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-stone text-[17px] leading-[1.75]">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
