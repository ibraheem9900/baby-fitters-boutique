import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { AGE_GROUPS, GENDERS, DISCOUNT_TIERS } from "@/lib/taxonomy";
import { formatPrice } from "@/lib/categories";

export type FilterState = {
  age: string[];
  gender: string[];
  discount: number[];
  minPrice: number;
  maxPrice: number;
};

export const defaultFilters: FilterState = {
  age: [],
  gender: [],
  discount: [],
  minPrice: 0,
  maxPrice: 50000,
};

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
  const toggle = <K extends "age" | "gender" | "discount">(key: K, item: FilterState[K][number]) => {
    const arr = value[key] as Array<FilterState[K][number]>;
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    onChange({ ...value, [key]: next });
  };

  const activeCount =
    value.age.length + value.gender.length + value.discount.length + (value.maxPrice < priceBounds.max ? 1 : 0);

  const body = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Filters</h3>
        <button
          onClick={() => onChange({ ...defaultFilters, maxPrice: priceBounds.max })}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Age / Size">
        {AGE_GROUPS.map((a) => (
          <Chip key={a.value} active={value.age.includes(a.value)} onClick={() => toggle("age", a.value)}>
            {a.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Gender">
        {GENDERS.map((g) => (
          <Chip key={g.value} active={value.gender.includes(g.value)} onClick={() => toggle("gender", g.value)}>
            {g.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Discount">
        {DISCOUNT_TIERS.map((d) => (
          <Chip key={d} active={value.discount.includes(d)} onClick={() => toggle("discount", d)}>
            {d}% +
          </Chip>
        ))}
      </FilterGroup>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Price Range</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{formatPrice(value.minPrice)}</span>
          <span>{formatPrice(value.maxPrice)}</span>
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle bar */}
      <div className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/90 backdrop-blur-md border-b border-border">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-full bg-card border border-border shadow-soft text-sm font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{activeCount}</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileOpen && (
          <div className="mt-2 bg-card border border-border rounded-3xl p-5 shadow-pillow max-h-[70vh] overflow-y-auto">
            {body}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block bg-card border border-border rounded-3xl p-5 sticky top-24 self-start">
        {body}
      </aside>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:bg-blush"
      }`}
    >
      {children}
    </button>
  );
}

type Filterable = {
  price: number;
  discount_percent: number;
  gender: string | null;
  age_group: string | null;
};

export function applyFilters<T extends Filterable>(items: T[], f: FilterState): T[] {
  return items.filter((p) => {
    if (f.age.length && (!p.age_group || !f.age.includes(p.age_group))) return false;
    if (f.gender.length && (!p.gender || !f.gender.includes(p.gender))) return false;
    if (f.discount.length && !f.discount.some((d) => (p.discount_percent ?? 0) >= d)) return false;
    const finalP = p.price * (1 - (p.discount_percent ?? 0) / 100);
    if (finalP < f.minPrice || finalP > f.maxPrice) return false;
    return true;
  });
}
