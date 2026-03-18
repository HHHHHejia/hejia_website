"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/startup", label: "Startup" },
  { href: "/research", label: "Research" },
  { href: "/photo", label: "Photo" },
  { href: "/project", label: "Project" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-washi/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.12em] uppercase text-ink no-underline hover:text-vermillion transition-colors"
        >
          HG
        </Link>
        <div className="flex gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] no-underline transition-colors ${
                pathname === href
                  ? "text-vermillion"
                  : "text-stone hover:text-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
