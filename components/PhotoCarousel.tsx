"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { carouselPhotos } from "@/data/photo-data";

export default function PhotoCarousel() {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % carouselPhotos.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 8000);
    return () => clearInterval(timer);
  }, [advance]);

  if (carouselPhotos.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={encodeURI(carouselPhotos[index])}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
