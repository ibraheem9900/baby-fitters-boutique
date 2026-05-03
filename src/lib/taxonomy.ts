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
          "Playpens",
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
