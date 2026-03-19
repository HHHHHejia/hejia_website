"use client";

import type { AtlasStop } from "@/data/photo-data";
import { useLanguage } from "@/i18n/LanguageContext";

interface StopCardProps {
  stop: AtlasStop;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function buildGradient(palette: string[], shift: number) {
  const colors =
    palette.length >= 3 ? palette : ["#f3e2cd", "#c2794b", "#4d3a35"];
  const s = shift % colors.length;
  const ordered = [...colors.slice(s), ...colors.slice(0, s)];
  return `linear-gradient(145deg, ${ordered[0]} 0%, ${ordered[1]} 48%, ${ordered[2]} 100%)`;
}

export default function StopCard({
  stop,
  index,
  isActive,
  onClick,
}: StopCardProps) {
  const { t } = useLanguage();
  const firstPhoto = stop.photos[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-3xl border p-5 grid gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white/60 backdrop-blur-sm ${
        isActive
          ? "border-vermillion/30 shadow-md"
          : "border-line hover:border-vermillion/20"
      }`}
    >
      {/* Thumbnail */}
      <div
        className="aspect-[4/3] overflow-hidden rounded-2xl"
        style={{ background: buildGradient(stop.palette, index) }}
      >
        {firstPhoto ? (
          <img
            src={encodeURI(firstPhoto.src)}
            alt={firstPhoto.alt}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center h-full text-white/80 font-mono text-xs uppercase tracking-wider">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
        {stop.region}
      </p>
      <h3 className="font-serif text-[clamp(24px,3vw,36px)] leading-[0.96] tracking-[-0.03em] text-ink">
        {stop.title}
      </h3>
      <p className="text-stone text-[13px]">{stop.location}</p>
      <p className="text-stone text-sm leading-relaxed">
        {stop.photos.length}{" "}
        {stop.photos.length !== 1 ? t("photo.photosPlural") : t("photo.photos")}
      </p>
    </button>
  );
}
