"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { AtlasStop, Photo } from "@/data/photo-data";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

interface TimelineViewProps {
  stop: AtlasStop;
  onPhotoClick: (index: number) => void;
  onClose: () => void;
}

function extractDate(photo: Photo): string {
  // Photo src ends with e.g. .../2025-07_001.jpg
  const match = photo.src.match(/(\d{4}-\d{2})_\d+\.\w+$/);
  return match ? match[1] : "unknown";
}

function isVideo(src: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

export default function TimelineView({
  stop,
  onPhotoClick,
  onClose,
}: TimelineViewProps) {
  const { t } = useLanguage();

  function formatDate(dateKey: string): string {
    const [year, month] = dateKey.split("-");
    const m = parseInt(month);
    const monthKey = `month.${m}` as TranslationKey;
    return `${t(monthKey)} ${year}`;
  }

  // Group photos: first by attraction, then by date within each
  const attractionGroups = useMemo(() => {
    const aMap = new Map<string, { photo: Photo; globalIndex: number }[]>();
    stop.photos.forEach((photo, i) => {
      const key = photo.attraction || "";
      const existing = aMap.get(key) ?? [];
      existing.push({ photo, globalIndex: i });
      aMap.set(key, existing);
    });

    // For each attraction, sub-group by date
    return Array.from(aMap.entries()).map(([attraction, items]) => {
      const dateMap = new Map<string, { photo: Photo; globalIndex: number }[]>();
      for (const item of items) {
        const date = extractDate(item.photo);
        const existing = dateMap.get(date) ?? [];
        existing.push(item);
        dateMap.set(date, existing);
      }
      const dateGroups = Array.from(dateMap.entries()).sort((a, b) =>
        b[0].localeCompare(a[0])
      );
      return { attraction, dateGroups };
    });
  }, [stop.photos]);

  const hasAttractions = attractionGroups.some((g) => g.attraction !== "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-washi overflow-y-auto shadow-2xl"
      >
        <div className="px-8 py-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion mb-2">
                {t("photo.timeline")}
              </p>
              <h3 className="font-serif text-[clamp(32px,5vw,48px)] leading-[0.92] tracking-[-0.03em] text-ink">
                {stop.title}
              </h3>
              <p className="text-stone text-[15px] mt-2">
                {stop.photos.length}{" "}
                {stop.photos.length !== 1 ? t("photo.photosPlural") : t("photo.photos")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink/60 hover:text-ink transition-colors text-2xl cursor-pointer p-2 leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Timeline */}
          <div className="relative pl-8 border-l-2 border-line-strong">
            {attractionGroups.map(({ attraction, dateGroups }) => (
              <div key={attraction || "__none__"}>
                {/* Attraction header — only show if there are named attractions */}
                {hasAttractions && attraction && (
                  <div className="mb-6 relative">
                    <div className="absolute -left-[calc(2rem+7px)] w-[14px] h-[14px] rounded-full bg-ink border-2 border-washi top-1" />
                    <h4 className="font-serif text-[22px] leading-[1] tracking-[-0.02em] text-ink">
                      {attraction}
                    </h4>
                  </div>
                )}

                {dateGroups.map(([dateKey, items]) => (
                  <div key={dateKey} className="mb-10 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[calc(2rem+5px)] w-[10px] h-[10px] rounded-full bg-vermillion top-1" />

                    {/* Date label */}
                    <p className="font-mono text-[13px] tracking-[0.06em] text-vermillion mb-4">
                      {formatDate(dateKey)}
                    </p>

                    {/* Photo grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {items.map(({ photo, globalIndex }) => (
                        <button
                          key={globalIndex}
                          onClick={() => onPhotoClick(globalIndex)}
                          className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                        >
                          {isVideo(photo.src) ? (
                            <div className="w-full h-full bg-ink/10 flex items-center justify-center">
                              <span className="text-stone text-2xl">&#9654;</span>
                            </div>
                          ) : (
                            <img
                              src={photo.src}
                              alt={photo.alt}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
