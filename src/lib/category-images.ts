import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, type CategorySlug } from "./categories";

export type CategoryImageOverride = { slug: string; image_url: string };

export async function fetchCategoryImageOverrides(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("category_images").select("slug, image_url");
  if (error) return {};
  const map: Record<string, string> = {};
  (data ?? []).forEach((row) => { map[row.slug] = row.image_url; });
  return map;
}

export function useCategoryImages() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategoryImageOverrides().then(setOverrides);
    const channel = supabase
      .channel("category-images")
      .on("postgres_changes", { event: "*", schema: "public", table: "category_images" }, () => {
        fetchCategoryImageOverrides().then(setOverrides);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getImage = (slug: CategorySlug | string) => {
    if (overrides[slug]) return overrides[slug];
    return CATEGORIES.find((c) => c.slug === slug)?.image ?? "";
  };

  const categoriesWithImages = CATEGORIES.map((c) => ({
    ...c,
    image: overrides[c.slug] ?? c.image,
  }));

  return { overrides, getImage, categoriesWithImages };
}
