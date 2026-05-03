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
  const toggle = <K extends "age" | "gender" | "discount">(key: K, item: FilterState[K][number]) => {
    const arr = value[key] as Array<FilterState[K][number]>;
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    onChange({ ...value, [key]: next });
  };

  return (
    <aside className="bg-card border border-border rounded-3xl p-5 sticky top-24 space-y-6">
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
    </aside>
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

export function applyFilters(items: Array<{
  price: number;
  discount_percent: number;
  gender: string | null;
  age_group: string | null;
}>, f: FilterState) {
  return items.filter((p) => {
    if (f.age.length && (!p.age_group || !f.age.includes(p.age_group))) return false;
    if (f.gender.length && (!p.gender || !f.gender.includes(p.gender))) return false;
    if (f.discount.length && !f.discount.some((d) => (p.discount_percent ?? 0) >= d)) return false;
    const finalP = p.price * (1 - (p.discount_percent ?? 0) / 100);
    if (finalP < f.minPrice || finalP > f.maxPrice) return false;
    return true;
  });
}
