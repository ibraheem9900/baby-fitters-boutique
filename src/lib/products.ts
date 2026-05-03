import { supabase } from "@/integrations/supabase/client";
import type { CategorySlug } from "./categories";

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
};

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
  return (data ?? []) as Product[];
}
