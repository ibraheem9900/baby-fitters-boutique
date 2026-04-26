export type CategorySlug =
  | "baby_garments"
  | "newborn_accessories"
  | "baby_cosmetics"
  | "baby_shoes"
  | "baby_toys";

export const CATEGORIES: { slug: CategorySlug; label: string; emoji: string; tint: string }[] = [
  { slug: "baby_garments", label: "Baby Garments", emoji: "👶", tint: "bg-blush" },
  { slug: "newborn_accessories", label: "Newborn Accessories", emoji: "🍼", tint: "bg-sky" },
  { slug: "baby_cosmetics", label: "Cosmetics & Hair Care", emoji: "🧴", tint: "bg-mint" },
  { slug: "baby_shoes", label: "Baby Shoes", emoji: "👟", tint: "bg-butter" },
  { slug: "baby_toys", label: "Toys & Costumes", emoji: "🧸", tint: "bg-cream" },
];

export const categoryLabel = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
