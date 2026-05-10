import { supabase } from "@/integrations/supabase/client";
import type { CategorySlug } from "./categories";

export type ProductVariant = {
  size?: string;
  sizes?: string[];        // multi-size variant (admin checkbox group)
  color?: string;
  colorHex?: string;
  label?: string;          // custom attribute name (e.g. "Material")
  value?: string;          // custom attribute value
  values?: string[];       // multiple custom values
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: CategorySlug;
  image_url: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  stock: number;
  created_at: string;
  subcategory: string | null;
  discount_percent: number;
  gender: string | null;
  age_group: string | null;
  images: string[];
  variants: ProductVariant[];
};

export function productImages(p: Pick<Product, "images" | "image_url">): string[] {
  const arr = (p.images ?? []).filter(Boolean);
  if (arr.length) return arr;
  return p.image_url ? [p.image_url] : [];
}

export function discountedPrice(p: Pick<Product, "price" | "discount_percent">) {
  const d = p.discount_percent ?? 0;
  if (!d) return p.price;
  return Math.round(p.price * (1 - d / 100));
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    images: (r.images ?? []) as string[],
    variants: (Array.isArray(r.variants) ? r.variants : []) as ProductVariant[],
  })) as Product[];
}
