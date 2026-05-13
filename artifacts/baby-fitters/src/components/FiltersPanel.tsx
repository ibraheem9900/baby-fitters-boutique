import { useState } from "react";
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
        <div className="relative h-5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 bg-muted rounded-full" />
          <div
            className="absolute h-1.5 bg-primary rounded-full"
            style={{
              left: `${(minAgeSlider / (AGE_VALUE_MAP.length - 1)) * 100}%`,
              right: `${100 - (maxAgeSlider / (AGE_VALUE_MAP.length - 1)) * 100}%`,
            }}
          />
          <input
            type="range" min={0} max={AGE_VALUE_MAP.length - 1} step={1} value={minAgeSlider}
            onChange={(e) => { const v = Number(e.target.value); if (v < maxAgeSlider) onChange({ ...value, minAge: sliderToMonths(v) }); }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
            style={{ zIndex: minAgeSlider >= maxAgeSlider - 1 ? 5 : 3 }}
          />
          <input
            type="range" min={0} max={AGE_VALUE_MAP.length - 1} step={1} value={maxAgeSlider}
            onChange={(e) => { const v = Number(e.target.value); if (v > minAgeSlider) onChange({ ...value, maxAge: sliderToMonths(v) }); }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
            style={{ zIndex: 4 }}
          />
        </div>
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
          <span>{value.minDiscount === 0 ? "Any" : `${value.minDiscount}%+ off`}</span>
          <span>70% off</span>
        </div>
        <input
          type="range" min={0} max={70} step={5} value={value.minDiscount}
          onChange={(e) => onChange({ ...value, minDiscount: Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between mt-1">
          {[0, 10, 25, 50, 70].map((d) => (
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
