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
};

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}
