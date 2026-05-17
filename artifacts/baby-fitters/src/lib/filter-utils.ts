export type FilterState = {
  gender: string[];
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
  minDiscount: number;
};

export const defaultFilters: FilterState = {
  gender: [],
  minPrice: 0,
  maxPrice: 50000,
  minAge: 0,
  maxAge: 168,
  minDiscount: 0,
};

function ageGroupToRange(ageGroup: string | null): [number, number] | null {
  if (!ageGroup) return null;
  const s = ageGroup.toLowerCase().trim();
  const map: Record<string, [number, number]> = {
    "0-3m":  [0,   3],
    "3-6m":  [3,   6],
    "3-12m": [3,   12],
    "6-12m": [6,   12],
    "1-2y":  [12,  24],
    "1-4y":  [12,  48],
    "2-3y":  [24,  36],
    "3-4y":  [36,  48],
    "3-5y":  [36,  60],
    "4-5y":  [48,  60],
    "5-6y":  [60,  72],
    "5-10y": [60,  120],
    "7-8y":  [84,  96],
    "9-10y": [108, 120],
    "10+":   [120, 168],
  };
  return map[s] ?? null;
}

type Filterable = {
  price: number;
  discount_percent: number;
  gender: string | null;
  age_group: string | null;
};

export function applyFilters<T extends Filterable>(items: T[], f: FilterState): T[] {
  return items.filter((p) => {
    if (f.gender.length && (!p.gender || !f.gender.includes(p.gender))) return false;
    if (f.minDiscount > 0 && (p.discount_percent ?? 0) < f.minDiscount) return false;

    if (f.minAge > 0 || f.maxAge < 168) {
      const ageRange = ageGroupToRange(p.age_group);
      if (ageRange !== null) {
        if (ageRange[1] <= f.minAge || ageRange[0] >= f.maxAge) return false;
      }
    }

    const finalP = p.price * (1 - (p.discount_percent ?? 0) / 100);
    if (finalP < f.minPrice || finalP > f.maxPrice) return false;
    return true;
  });
}
