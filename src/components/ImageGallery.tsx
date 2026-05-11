import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const safe = images.length ? images : [];
  const current = safe[idx];

  const go = (n: number) => {
    if (!safe.length) return;
    setIdx((idx + n + safe.length) % safe.length);
  };

  // Keyboard nav in fullscreen
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, idx, safe.length]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-cream shadow-pillow group">
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
              className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
              onClick={() => setZoom(true)}
            />
          ) : (
            <div className="w-full h-full bg-blush" />
          )}
        </AnimatePresence>

        {current && (
          <button
            onClick={() => setZoom(true)}
            aria-label="View fullscreen"
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/85 backdrop-blur hover:bg-background shadow-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}

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

      {/* FULLSCREEN VIEWER */}
      <AnimatePresence>
        {zoom && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setZoom(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(false); }}
              aria-label="Close"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
            >
              <X className="w-5 h-5" />
            </button>

            {safe.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); go(-1); }}
                  aria-label="Previous"
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); go(1); }}
                  aria-label="Next"
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="relative w-full h-full flex items-center justify-center px-4 py-16"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" custom={idx}>
                <motion.img
                  key={current}
                  src={current}
                  alt={alt}
                  drag={safe.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  initial={{ opacity: 0, scale: 0.96, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98, x: -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl select-none cursor-grab active:cursor-grabbing"
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {safe.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {safe.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
