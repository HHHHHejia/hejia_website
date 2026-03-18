"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { atlasStops } from "@/data/photo-data";
import StopCard from "@/components/StopCard";
import Lightbox from "@/components/Lightbox";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function PhotoPage() {
  const [activeStopId, setActiveStopId] = useState<string>(
    atlasStops[0]?.id ?? ""
  );
  const [lightboxStopId, setLightboxStopId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const regionCount = new Set(atlasStops.map((s) => s.region)).size;
  const photoCount = atlasStops.reduce(
    (t, s) => t + s.photos.length,
    0
  );

  const handleStopClick = useCallback((id: string) => {
    setActiveStopId(id);
    setLightboxStopId(id);
    setLightboxIndex(0);
  }, []);

  const lightboxPhotos =
    atlasStops.find((s) => s.id === lightboxStopId)?.photos ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
      {/* Hero */}
      <section className="max-w-4xl mb-16">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermillion mb-5">
          03 / Photo Atlas
        </p>
        <h1 className="font-serif font-semibold text-[clamp(56px,10vw,120px)] leading-[0.88] tracking-[-0.04em] text-ink">
          Photo Atlas
        </h1>
        <p className="mt-5 text-stone text-[clamp(16px,2vw,22px)] leading-relaxed max-w-3xl">
          Pin a place, open a memory. A living archive of travel photography.
        </p>
      </section>

      {/* Globe */}
      <section className="border-t border-line pt-6 mb-14">
        <div className="flex justify-between items-end gap-6 mb-6 flex-wrap">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
            Travel Globe
          </p>
          <p className="text-stone text-[15px] max-w-xl leading-relaxed">
            Click a marker on the globe to open a destination.
          </p>
        </div>

        <Globe
          stops={atlasStops}
          activeStopId={activeStopId}
          onStopClick={handleStopClick}
        />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { value: atlasStops.length, label: "stops" },
            { value: regionCount, label: "regions" },
            { value: photoCount, label: "images" },
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

      {/* Destinations */}
      <section className="border-t border-line pt-6">
        <div className="flex justify-between items-end gap-6 mb-6 flex-wrap">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-vermillion">
            Destinations
          </p>
          <p className="text-stone text-[15px] max-w-xl leading-relaxed">
            Click a card to browse photos from that stop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {atlasStops.map((stop, i) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={i}
              isActive={activeStopId === stop.id}
              onClick={() => handleStopClick(stop.id)}
            />
          ))}
        </div>
      </section>

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
