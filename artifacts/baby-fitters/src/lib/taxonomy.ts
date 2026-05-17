import type { CategorySlug } from "./categories";

export type NavColumn = {
  heading?: string;
  gender?: "boys" | "girls";
  items: string[];
};

export type NavGroup = {
  label: string;
  slug: CategorySlug | "sale";
  columns: NavColumn[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "New Born Accessories",
    slug: "newborn_accessories",
    columns: [
      {
        items: [
          "Feeders & Sippers",
          "Care Kit",
          "Wrap & Towels",
          "Body Suit & Vests",
          "Socks & Booties",
          "Bedding & Blankets",
          "Playland",
          "Bags & Bibs",
          "Misc",
        ],
      },
    ],
  },
  {
    label: "Garments",
    slug: "baby_garments",
    columns: [
      {
        heading: "Boys",
        gender: "boys",
        items: ["Suiting", "Shirts", "Pants", "Shalwar Suits", "Casual Wear"],
      },
      {
        heading: "Girls",
        gender: "girls",
        items: ["Suiting", "Frocks", "Tops / Blouse", "Pants & Bottoms", "Casual Wear"],
      },
      {
        heading: "Common",
        items: ["Rompers", "Night Suits"],
      },
    ],
  },
  {
    label: "Footwear",
    slug: "baby_shoes",
    columns: [{ items: ["Boys", "Girls"] }],
  },
  {
    label: "General",
    slug: "baby_cosmetics",
    columns: [
      {
        heading: "Inner",
        items: ["Tights", "Round Neck", "High Neck", "Vests", "Underwear"],
      },
      {
        heading: "Casual",
        items: ["Nickers", "Trousers", "Hoodies", "Belts", "Costumes"],
      },
    ],
  },
  {
    label: "Sale / Deals",
    slug: "sale",
    columns: [{ items: ["All Discounted Items", "25% Off", "50% Off", "70% Off"] }],
  },
];

export const AGE_GROUPS = [
  { value: "0-3m",   label: "0–3 Months",  months: [0, 3] },
  { value: "3-6m",   label: "3–6 Months",  months: [3, 6] },
  { value: "6-12m",  label: "6–12 Months", months: [6, 12] },
  { value: "1-2y",   label: "1–2 Years",   months: [12, 24] },
  { value: "2-3y",   label: "2–3 Years",   months: [24, 36] },
  { value: "3-5y",   label: "3–5 Years",   months: [36, 60] },
  { value: "5-10y",  label: "5–10 Years",  months: [60, 120] },
  { value: "10+",    label: "10+ Years",   months: [120, 168] },
] as const;

export const GENDERS = [
  { value: "boys",    label: "Boys" },
  { value: "girls",   label: "Girls" },
  { value: "newborn", label: "New Born" },
] as const;

export const DISCOUNT_TIERS = [10, 25, 50, 70] as const;

export function subcategoriesFor(slug: string): string[] {
  const group = NAV_GROUPS.find((g) => g.slug === slug);
  if (!group) return [];
  const items: string[] = [];
  group.columns.forEach((c) => c.items.forEach((i) => items.push(i)));
  return Array.from(new Set(items));
}

export function subcategoriesByGender(slug: string): { label: string; items: string[]; gender?: "boys" | "girls" }[] {
  const group = NAV_GROUPS.find((g) => g.slug === slug);
  if (!group) return [];
  return group.columns.map((c) => ({
    label: c.heading ?? "General",
    items: c.items,
    gender: c.gender,
  }));
}

export function slugifySub(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function subFromSlug(categorySlug: string, sub: string): string | undefined {
  return subcategoriesFor(categorySlug).find((s) => slugifySub(s) === sub);
}

export function genderForSubItem(categorySlug: string, item: string): "boys" | "girls" | undefined {
  const group = NAV_GROUPS.find((g) => g.slug === categorySlug);
  if (!group) return undefined;
  for (const col of group.columns) {
    if (col.gender && col.items.includes(item)) return col.gender;
  }
  return undefined;
}

export const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const BABY_SIZES = [
  "0-3M", "3-6M", "6-12M",
  "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y",
  "7-8Y", "9-10Y", "11-12Y", "13-14Y",
] as const;

export const COLOR_PRESETS = [
  { name: "Pink",   hex: "#f9a8d4" },
  { name: "Blue",   hex: "#93c5fd" },
  { name: "Cream",  hex: "#fef3c7" },
  { name: "Mint",   hex: "#a7f3d0" },
  { name: "White",  hex: "#ffffff" },
  { name: "Black",  hex: "#0f172a" },
  { name: "Yellow", hex: "#fde68a" },
  { name: "Red",    hex: "#fca5a5" },
] as const;
