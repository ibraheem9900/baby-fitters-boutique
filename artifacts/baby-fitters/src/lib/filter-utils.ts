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

function ageGroupToMonths(ageGroup: string | null): number | null {
  if (!ageGroup) return null;
  const map: Record<string, number> = {
    "0-3m": 1.5,   "3-6m": 4.5,   "3-12m": 7,    "6-12m": 9,
    "1-2y": 18,    "1-4y": 30,    "2-3y": 30,    "3-4y": 42,
    "3-5y": 48,    "4-5y": 54,    "5-6y": 66,    "5-10y": 90,
    "7-8y": 90,    "9-10y": 114,  "10+": 132,
  };
  return map[ageGroup.toLowerCase().trim()] ?? null;
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
    const ageMonths = ageGroupToMonths(p.age_group);
    if ((f.minAge > 0 || f.maxAge < 168) && ageMonths !== null) {
      if (ageMonths < f.minAge || ageMonths > f.maxAge) return false;
    }
    const finalP = p.price * (1 - (p.discount_percent ?? 0) / 100);
    if (finalP < f.minPrice || finalP > f.maxPrice) return false;
    return true;
  });
}
