import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { GENDERS } from "@/lib/taxonomy";
import { formatPrice } from "@/lib/categories";
import { defaultFilters, type FilterState } from "@/lib/filter-utils";

const AGE_STOPS = [
  { months: 0,   label: "0m" },
  { months: 3,   label: "3m" },
  { months: 6,   label: "6m" },
  { months: 12,  label: "1yr" },
  { months: 24,  label: "2yr" },
  { months: 36,  label: "3yr" },
  { months: 60,  label: "5yr" },
  { months: 84,  label: "7yr" },
  { months: 120, label: "10yr" },
  { months: 168, label: "14yr+" },
];

function monthsToLabel(m: number): string {
  if (m < 12) return `${m}m`;
  const y = Math.round(m / 12);
  return `${y}yr`;
}

const AGE_VALUE_MAP = [0, 3, 6, 12, 24, 36, 60, 84, 120, 168];

function sliderToMonths(v: number): number {
  const clamped = Math.max(0, Math.min(v, AGE_VALUE_MAP.length - 1));
  return AGE_VALUE_MAP[Math.round(clamped)] ?? 0;
}

function monthsToSlider(m: number): number {
  const idx = AGE_VALUE_MAP.findIndex((x) => x >= m);
  return idx >= 0 ? idx : AGE_VALUE_MAP.length - 1;
}

const DISCOUNT_STOPS = [0, 10, 25, 50, 70, 99];

function discountToIdx(d: number): number {
  let best = 0;
  for (let i = 0; i < DISCOUNT_STOPS.length; i++) {
    if ((DISCOUNT_STOPS[i] ?? 0) <= d) best = i;
  }
  return best;
}

function DualRangeSlider({
  minIdx, maxIdx, total,
  onMin, onMax,
}: {
  minIdx: number; maxIdx: number; total: number;
  onMin: (i: number) => void; onMax: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<"min" | "max" | null>(null);
  const stateRef = useRef({ minIdx, maxIdx, onMin, onMax });
  stateRef.current = { minIdx, maxIdx, onMin, onMax };

  const minPct = (minIdx / total) * 100;
  const maxPct = (maxIdx / total) * 100;

  useEffect(() => {
    const getIdx = (x: number) => {
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return 0;
      return Math.round(Math.max(0, Math.min(1, (x - r.left) / r.width)) * total);
    };
    const move = (x: number) => {
      const a = activeRef.current;
      const { minIdx: mn, maxIdx: mx, onMin, onMax } = stateRef.current;
      if (!a) return;
      const i = getIdx(x);
      if (a === "min" && i < mx) onMin(i);
      if (a === "max" && i > mn) onMax(i);
    };
    const mm = (e: MouseEvent) => move(e.clientX);
    const tm = (e: TouchEvent) => { e.preventDefault(); move(e.touches[0].clientX); };
    const up = () => { activeRef.current = null; };

    window.addEventListener("mousemove", mm);
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [total]);

  const startDrag = (which: "min" | "max") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    activeRef.current = which;
  };

  return (
    <div ref={trackRef} className="relative h-8 flex items-center select-none mx-2.5">
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
      <div
        className="absolute h-1.5 rounded-full bg-primary"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      <div
        role="slider"
        aria-label="Minimum age"
        aria-valuenow={minIdx}
        onMouseDown={startDrag("min")}
        onTouchStart={startDrag("min")}
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary border-2 border-white shadow-md cursor-grab active:cursor-grabbing z-10 touch-none hover:scale-110 transition-transform"
        style={{ left: `${minPct}%` }}
      />
      <div
        role="slider"
        aria-label="Maximum age"
        aria-valuenow={maxIdx}
        onMouseDown={startDrag("max")}
        onTouchStart={startDrag("max")}
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary border-2 border-white shadow-md cursor-grab active:cursor-grabbing z-10 touch-none hover:scale-110 transition-transform"
        style={{ left: `${maxPct}%` }}
      />
    </div>
  );
}

export function FiltersPanel({
  value,
  onChange,
  priceBounds,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  priceBounds: { min: number; max: number };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGender = (g: string) => {
    const next = value.gender.includes(g)
      ? value.gender.filter((x) => x !== g)
      : [...value.gender, g];
    onChange({ ...value, gender: next });
  };

  const activeCount =
    value.gender.length +
    (value.maxPrice < priceBounds.max ? 1 : 0) +
    (value.minAge > 0 ? 1 : 0) +
    (value.maxAge < 168 ? 1 : 0) +
    (value.minDiscount > 0 ? 1 : 0);

  const clearAll = () => onChange({ ...defaultFilters, maxPrice: priceBounds.max });

  const minAgeSlider = monthsToSlider(value.minAge);
  const maxAgeSlider = monthsToSlider(value.maxAge);

  const filterBody = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Filters</h3>
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div>
        <p className="filter-label">Gender</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip key={g.value} active={value.gender.includes(g.value)} onClick={() => toggleGender(g.value)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="filter-label">Age Range</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
          <span>{monthsToLabel(value.minAge)}</span>
          <span>{value.maxAge >= 168 ? "Any age" : monthsToLabel(value.maxAge)}</span>
        </div>
        <DualRangeSlider
          minIdx={minAgeSlider}
          maxIdx={maxAgeSlider}
          total={AGE_VALUE_MAP.length - 1}
          onMin={(i) => onChange({ ...value, minAge: sliderToMonths(i) })}
          onMax={(i) => onChange({ ...value, maxAge: sliderToMonths(i) })}
        />
        <div className="flex flex-wrap gap-1.5 mt-3">
          {AGE_STOPS.filter((_, i) => i % 2 === 0).map((s) => (
            <button
              key={s.months} type="button"
              onClick={() => onChange({ ...value, minAge: s.months, maxAge: Math.min(s.months + 24, 168) })}
              className="px-2 py-1 rounded-full text-[10px] font-semibold border border-border hover:bg-blush hover:text-primary transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="filter-label">Min Discount</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
          <span>{value.minDiscount === 0 ? "Any discount" : `${value.minDiscount}%+ off`}</span>
          <span>Up to 99% off</span>
        </div>
        <input
          type="range"
          min={0}
          max={DISCOUNT_STOPS.length - 1}
          step={1}
          value={discountToIdx(value.minDiscount)}
          onChange={(e) => onChange({ ...value, minDiscount: DISCOUNT_STOPS[Number(e.target.value)] ?? 0 })}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between mt-1.5">
          {DISCOUNT_STOPS.map((d) => (
            <button
              key={d} type="button"
              onClick={() => onChange({ ...value, minDiscount: d })}
              className={`text-[10px] font-semibold transition-colors ${value.minDiscount === d ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {d === 0 ? "Any" : `${d}%`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="filter-label">Max Price</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-medium">
          <span>{formatPrice(priceBounds.min)}</span>
          <span>{formatPrice(value.maxPrice)}</span>
        </div>
        <input
          type="range" min={priceBounds.min} max={priceBounds.max} value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/90 backdrop-blur-md border-b border-border">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-full bg-card border border-border shadow-soft text-sm font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground font-normal">Tap to open ↑</span>
        </button>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 400) {
                    setMobileOpen(false);
                  }
                }}
                transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.8 }}
                className="fixed bottom-0 left-0 right-0 z-[61] bg-card rounded-t-3xl shadow-pillow lg:hidden"
                style={{ maxHeight: "85dvh" }}
              >
                <div className="flex flex-col">
                  <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing">
                    <div className="w-12 h-1.5 rounded-full bg-border" />
                  </div>
                  <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0 border-b border-border">
                    <span className="font-display text-lg font-semibold">Filters</span>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 px-5 pt-5 pb-10">
                    {filterBody}
                  </div>
                  <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-border bg-card">
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3.5 rounded-full bg-foreground text-background font-bold text-[15px] hover:bg-primary transition-colors"
                    >
                      Show results{activeCount > 0 ? ` · ${activeCount} filter${activeCount !== 1 ? "s" : ""}` : ""}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <aside className="hidden lg:block bg-card border border-border rounded-3xl p-6 sticky top-24 self-start">
        {filterBody}
      </aside>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
        active ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:bg-blush"
      }`}
    >
      {children}
    </button>
  );
}
