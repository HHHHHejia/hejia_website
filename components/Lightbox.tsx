"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/data/photo-data";

interface LightboxProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function isVideo(src: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

export default function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const photo = photos[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/80 hover:text-white text-3xl bg-transparent border-none cursor-pointer z-10 leading-none p-2"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Prev */}
      <button
        onClick={onPrev}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 text-xl flex items-center justify-center cursor-pointer"
        aria-label="Previous"
      >
        &lsaquo;
      </button>

      {/* Content */}
      <div className="flex flex-col items-center gap-4 max-w-[90vw] max-h-[90vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {isVideo(photo.src) ? (
              <video
                src={encodeURI(photo.src)}
                controls
                className="max-w-[90vw] max-h-[75vh] rounded-lg"
              />
            ) : (
              <img
                src={encodeURI(photo.src)}
                alt={photo.alt}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg select-none"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <p className="text-white/70 text-sm text-center">{photo.caption}</p>
        <p className="text-white/50 font-mono text-xs tracking-wider">
          {index + 1} / {photos.length}
        </p>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 text-xl flex items-center justify-center cursor-pointer"
        aria-label="Next"
      >
        &rsaquo;
      </button>
    </motion.div>
  );
}
