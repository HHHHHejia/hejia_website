"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const links: { href: string; key: TranslationKey }[] = [
  { href: "/startup", key: "nav.startup" },
  { href: "/research", key: "nav.research" },
  { href: "/photo", key: "nav.photo" },
  { href: "/project", key: "nav.project" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-washi/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.12em] uppercase text-ink no-underline hover:text-vermillion transition-colors"
        >
          HG
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] no-underline transition-colors ${
                pathname === href
                  ? "text-vermillion"
                  : "text-stone hover:text-ink"
              }`}
            >
              {t(key)}
            </Link>
          ))}
          <button
            onClick={toggleLocale}
            className="text-[13px] text-stone hover:text-ink transition-colors cursor-pointer bg-transparent border border-line rounded-full px-2.5 py-0.5 font-mono tracking-wider"
            aria-label="Switch language"
          >
            {locale === "en" ? "中" : "EN"}
          </button>
        </div>
      </nav>
    </header>
  );
}
