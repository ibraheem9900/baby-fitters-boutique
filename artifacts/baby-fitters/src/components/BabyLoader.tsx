import { motion, AnimatePresence } from "framer-motion";

const DOTS = [
  { bg: "var(--color-blush)" },
  { bg: "var(--color-sky)" },
  { bg: "var(--color-mint)" },
];

function BouncingDots({ size = 12 }: { size?: number }) {
  return (
    <div className="flex items-end gap-2.5">
      {DOTS.map((dot, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -size * 1.1, 0], scale: [1, 1.18, 1] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: i * 0.17,
            ease: [0.4, 0, 0.6, 1],
          }}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: dot.bg,
            display: "block",
          }}
        />
      ))}
    </div>
  );
}

function TeddyFace({ size = 56 }: { size?: number }) {
  const s = size;
  const ear = s * 0.24;
  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: s, height: s + ear * 0.6, position: "relative", display: "inline-block" }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          left: s * 0.08,
          width: ear,
          height: ear,
          borderRadius: "50%",
          background: "var(--color-blush)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 0,
          right: s * 0.08,
          width: ear,
          height: ear,
          borderRadius: "50%",
          background: "var(--color-blush)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: s,
          borderRadius: "50%",
          background: "var(--color-cream)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.09)",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: s * 0.08,
          left: "50%",
          transform: "translateX(-50%)",
          width: s * 0.38,
          height: s * 0.22,
          borderRadius: "50%",
          background: "var(--color-blush)",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: s * 0.32,
          left: s * 0.27,
          width: s * 0.11,
          height: s * 0.11,
          borderRadius: "50%",
          background: "#3d2b1f",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: s * 0.32,
          right: s * 0.27,
          width: s * 0.11,
          height: s * 0.11,
          borderRadius: "50%",
          background: "#3d2b1f",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: s * 0.175,
          left: "50%",
          transform: "translateX(-50%)",
          width: s * 0.1,
          height: s * 0.08,
          borderRadius: "50%",
          background: "#c97b8a",
        }}
      />
    </motion.div>
  );
}

export function BabyLoader({ fullPage = false, label }: { fullPage?: boolean; label?: string }) {
  const inner = (
    <div className="flex flex-col items-center gap-5">
      <TeddyFace size={64} />
      <BouncingDots size={13} />
      {label !== undefined && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-display text-xl text-muted-foreground tracking-tight"
        >
          {label || "Loading…"}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex items-center justify-center"
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {inner}
    </div>
  );
}

export function PageLoader() {
  return (
    <AnimatePresence>
      <BabyLoader fullPage label="Loading…" />
    </AnimatePresence>
  );
}

export function InlineLoader({ rows = 6, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-5`}>
      {Array.from({ length: Math.min(rows, cols * 2) }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] skeleton rounded-2xl" />
          <div className="pt-4 space-y-2.5">
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
