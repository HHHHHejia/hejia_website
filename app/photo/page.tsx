"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { AtlasStop, CountryGroup } from "@/data/photo-data";
import { useLanguage } from "@/i18n/LanguageContext";
import StopCard from "@/components/StopCard";
import TimelineView from "@/components/TimelineView";
import Lightbox from "@/components/Lightbox";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function PhotoPage() {
  const { t } = useLanguage();
  const [stops, setStops] = useState<AtlasStop[]>([]);
  const [countries, setCountries] = useState<CountryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStopId, setActiveStopId] = useState<string>("");
  const [timelineStopId, setTimelineStopId] = useState<string | null>(null);
  const [lightboxStopId, setLightboxStopId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetch("/api/atlas")
      .then((res) => res.json())
      .then((data) => {
        setStops(data.stops ?? []);
        setCountries(data.countries ?? []);
        if (data.stops?.length > 0) {
          setActiveStopId(data.stops[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const regionCount = new Set(stops.map((s) => s.region)).size;
  const photoCount = stops.reduce((t, s) => t + s.photos.length, 0);

  const handleStopClick = useCallback((id: string) => {
    setActiveStopId(id);
    setTimelineStopId(id);
  }, []);

  const handlePhotoClick = useCallback(
    (index: number) => {
      setLightboxStopId(timelineStopId);
      setLightboxIndex(index);
    },
    [timelineStopId]
  );

  const timelineStop = stops.find((s) => s.id === timelineStopId);
  const lightboxPhotos =
    stops.find((s) => s.id === lightboxStopId)?.photos ?? [];

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
        <p className="text-stone text-center mt-20 animate-pulse">
          {t("photo.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      {/* Hero */}
      <section className="max-w-4xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          {t("photo.label")}
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          {t("photo.title")}
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed max-w-3xl">
          {t("photo.lede")}
        </p>
      </section>

      {/* Globe */}
      <section className="border-t border-line pt-6 mb-14">
        <div className="flex justify-between items-end gap-6 mb-6 flex-wrap">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
            {t("photo.globe")}
          </p>
          <p className="text-stone text-[15px] max-w-xl leading-relaxed">
            {t("photo.globeHint")}
          </p>
        </div>

        <Globe
          stops={stops}
          activeStopId={activeStopId}
          onStopClick={handleStopClick}
        />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { value: stops.length, label: t("photo.stops") },
            { value: regionCount, label: t("photo.regions") },
            { value: photoCount, label: t("photo.images") },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="border border-line rounded-2xl p-5 bg-white/60 backdrop-blur-sm"
            >
              <span className="block font-serif text-[40px] leading-[0.92] text-ink">
                {value}
              </span>
              <span className="text-stone text-[13px] lowercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations — grouped by country */}
      <section className="border-t border-line pt-6">
        <div className="flex justify-between items-end gap-6 mb-6 flex-wrap">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
            {t("photo.destinations")}
          </p>
          <p className="text-stone text-[15px] max-w-xl leading-relaxed">
            {t("photo.destHint")}
          </p>
        </div>

        {countries.map((country) => {
          const countryStops = country.stopIds
            .map((id) => stops.find((s) => s.id === id))
            .filter(Boolean) as AtlasStop[];
          if (countryStops.length === 0) return null;

          return (
            <div key={country.name} className="mb-10">
              <h3 className="font-serif text-[28px] text-ink mb-4">
                {country.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {countryStops.map((stop, i) => (
                  <StopCard
                    key={stop.id}
                    stop={stop}
                    index={i}
                    isActive={timelineStopId === stop.id}
                    onClick={() => handleStopClick(stop.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Timeline View */}
      <AnimatePresence>
        {timelineStop && (
          <TimelineView
            key={timelineStop.id}
            stop={timelineStop}
            onPhotoClick={handlePhotoClick}
            onClose={() => setTimelineStopId(null)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxStopId && lightboxPhotos.length > 0 && (
          <Lightbox
            photos={lightboxPhotos}
            index={lightboxIndex}
            onClose={() => setLightboxStopId(null)}
            onPrev={() =>
              setLightboxIndex(
                (i) => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length
              )
            }
            onNext={() =>
              setLightboxIndex((i) => (i + 1) % lightboxPhotos.length)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
