import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const safe = images.length ? images : [];
  const current = safe[idx];

  const go = (n: number) => {
    if (!safe.length) return;
    setIdx((idx + n + safe.length) % safe.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-cream shadow-pillow">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.img
              key={current}
              src={current}
              alt={alt}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blush" />
          )}
        </AnimatePresence>

        {safe.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur hover:bg-background shadow-soft flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur hover:bg-background shadow-soft flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {safe.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {safe.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIdx(i)}
              className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                i === idx ? "border-foreground scale-[1.03]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
