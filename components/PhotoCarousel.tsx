"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoCarousel() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/atlas")
      .then((res) => res.json())
      .then((data) => setPhotos(data.carouselPhotos ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (photos.length === 0) return null;

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
            src={photos[index]}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
