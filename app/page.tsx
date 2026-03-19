"use client";

import PhotoCarousel from "@/components/PhotoCarousel";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="-mt-16">
      <section className="relative flex min-h-screen items-center justify-center">
        <PhotoCarousel />
        <div className="relative z-10 text-center px-6">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 mb-6">
            {t("home.label")}
          </p>
          <h1 className="font-serif font-semibold text-white text-[clamp(56px,12vw,140px)] leading-[0.88] tracking-[-0.04em]">
            Hejia Geng
          </h1>
          <p className="mt-5 text-white/70 text-[clamp(16px,2vw,22px)] leading-relaxed">
            {t("home.subtitle")}
          </p>
        </div>
      </section>
    </div>
  );
}
