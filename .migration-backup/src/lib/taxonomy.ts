import type { CategorySlug } from "./categories";

export type NavGroup = {
  label: string;
  slug: CategorySlug | "sale";
  columns: { heading?: string; items: string[] }[];
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
        items: ["Suiting", "Shirts", "Pants", "Shalwar Suits", "Casual Wear"],
      },
      {
        heading: "Girls",
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
  { value: "0-3m", label: "0–3 Months" },
  { value: "3-12m", label: "3–12 Months" },
  { value: "1-4y", label: "1–4 Years" },
  { value: "5-10y", label: "5–10 Years" },
  { value: "10+", label: "10+ Above" },
] as const;

export const GENDERS = [
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
  { value: "newborn", label: "New Born" },
] as const;

export const DISCOUNT_TIERS = [25, 50, 70] as const;

// Flat list of subcategories per top-level category slug (used by admin + filters)
export function subcategoriesFor(slug: string): string[] {
  const group = NAV_GROUPS.find((g) => g.slug === slug);
  if (!group) return [];
  const items: string[] = [];
  group.columns.forEach((c) => c.items.forEach((i) => items.push(i)));
  return Array.from(new Set(items));
}

export function slugifySub(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function subFromSlug(categorySlug: string, sub: string): string | undefined {
  return subcategoriesFor(categorySlug).find((s) => slugifySub(s) === sub);
}

// Common size/color presets used in admin variant builder + product page
export const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"] as const;

// Baby/kids age-based sizes for multi-select size pickers
export const BABY_SIZES = [
  "0-3M", "3-6M", "6-12M",
  "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y",
  "7-8Y", "9-10Y", "11-12Y", "13-14Y",
] as const;
export const COLOR_PRESETS = [
  { name: "Pink", hex: "#f9a8d4" },
  { name: "Blue", hex: "#93c5fd" },
  { name: "Cream", hex: "#fef3c7" },
  { name: "Mint", hex: "#a7f3d0" },
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#0f172a" },
  { name: "Yellow", hex: "#fde68a" },
  { name: "Red", hex: "#fca5a5" },
] as const;

