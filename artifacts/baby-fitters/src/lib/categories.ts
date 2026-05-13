import garments from "@/assets/cat-garments.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import general from "@/assets/cat-general.jpg";
import shoes from "@/assets/cat-shoes.jpg";
import toys from "@/assets/cat-toys.jpg";

export type CategorySlug =
  | "baby_garments"
  | "newborn_accessories"
  | "baby_cosmetics"
  | "baby_shoes"
  | "baby_toys";

export const CATEGORIES: { slug: CategorySlug; label: string; image: string; tint: string }[] = [
  { slug: "newborn_accessories", label: "New Born Accessories", image: accessories, tint: "bg-sky" },
  { slug: "baby_garments", label: "Garments", image: garments, tint: "bg-blush" },
  { slug: "baby_shoes", label: "Footwear", image: shoes, tint: "bg-butter" },
  { slug: "baby_cosmetics", label: "General", image: general, tint: "bg-mint" },
  { slug: "baby_toys", label: "Toys & Costumes", image: toys, tint: "bg-cream" },
];

export const categoryLabel = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export const categoryImage = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)?.image ?? "";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
