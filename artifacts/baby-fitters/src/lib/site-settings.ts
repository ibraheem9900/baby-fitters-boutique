import { supabase } from "@/integrations/supabase/client";

const HERO_SLUG      = "__hero__";
const POPUP_1_SLUG   = "__popup1__";
const POPUP_2_SLUG   = "__popup2__";
const SIZE_CHART_SLUG = "__sizechart__";

export type PopupConfig = {
  visible: boolean;
  line1: string;
  line2: string;
};

export type SizeChartRow = {
  size: string;
  chest: string;
  length: string;
  weight: string;
};

export const DEFAULT_POPUP_1: PopupConfig = {
  visible: true,
  line1: "Loved by parents",
  line2: "4.9/5 rating",
};

export const DEFAULT_POPUP_2: PopupConfig = {
  visible: true,
  line1: "Free shipping",
  line2: "Over Rs 3,000",
};

export const DEFAULT_SIZE_CHART: SizeChartRow[] = [
  { size: "0–3 M",  chest: '16"', length: '14"', weight: "3–6 kg" },
  { size: "3–6 M",  chest: '17"', length: '15"', weight: "6–8 kg" },
  { size: "6–12 M", chest: '18"', length: '16"', weight: "8–10 kg" },
  { size: "1–2 Y",  chest: '19"', length: '17"', weight: "10–12 kg" },
  { size: "2–3 Y",  chest: '20"', length: '18"', weight: "12–14 kg" },
  { size: "3–4 Y",  chest: '21"', length: '19"', weight: "14–16 kg" },
  { size: "5–6 Y",  chest: '23"', length: '21"', weight: "16–20 kg" },
  { size: "7–8 Y",  chest: '25"', length: '23"', weight: "20–25 kg" },
  { size: "9–10 Y", chest: '27"', length: '25"', weight: "25–32 kg" },
];

async function getSetting(slug: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("category_images")
      .select("image_url")
      .eq("slug", slug)
      .maybeSingle();
    return data?.image_url ?? null;
  } catch {
    return null;
  }
}

async function setSetting(slug: string, value: string): Promise<void> {
  await supabase
    .from("category_images")
    .upsert({ slug, image_url: value }, { onConflict: "slug" });
}

async function deleteSetting(slug: string): Promise<void> {
  await supabase.from("category_images").delete().eq("slug", slug);
}

export async function getHeroImage(): Promise<string | null> {
  return getSetting(HERO_SLUG);
}
export async function setHeroImage(url: string): Promise<void> {
  return setSetting(HERO_SLUG, url);
}
export async function resetHeroImage(): Promise<void> {
  return deleteSetting(HERO_SLUG);
}

export async function getPopupConfig(which: 1 | 2): Promise<PopupConfig> {
  const slug = which === 1 ? POPUP_1_SLUG : POPUP_2_SLUG;
  const raw = await getSetting(slug);
  if (!raw) return which === 1 ? { ...DEFAULT_POPUP_1 } : { ...DEFAULT_POPUP_2 };
  try { return JSON.parse(raw) as PopupConfig; } catch { return which === 1 ? { ...DEFAULT_POPUP_1 } : { ...DEFAULT_POPUP_2 }; }
}
export async function setPopupConfig(which: 1 | 2, config: PopupConfig): Promise<void> {
  const slug = which === 1 ? POPUP_1_SLUG : POPUP_2_SLUG;
  return setSetting(slug, JSON.stringify(config));
}

export async function getSizeChart(): Promise<SizeChartRow[]> {
  const raw = await getSetting(SIZE_CHART_SLUG);
  if (!raw) return DEFAULT_SIZE_CHART.map((r) => ({ ...r }));
  try { return JSON.parse(raw) as SizeChartRow[]; } catch { return DEFAULT_SIZE_CHART.map((r) => ({ ...r })); }
}
export async function saveSizeChart(rows: SizeChartRow[]): Promise<void> {
  return setSetting(SIZE_CHART_SLUG, JSON.stringify(rows));
}

export function useHeroPopups() {
  return { POPUP_1_SLUG, POPUP_2_SLUG, HERO_SLUG };
}

function productChartSlug(productId: string) {
  return `__chart_${productId}__`;
}

export async function getProductSizeChart(productId: string): Promise<SizeChartRow[] | null> {
  const raw = await getSetting(productChartSlug(productId));
  if (!raw) return null;
  try { return JSON.parse(raw) as SizeChartRow[]; } catch { return null; }
}

export async function saveProductSizeChart(productId: string, rows: SizeChartRow[]): Promise<void> {
  return setSetting(productChartSlug(productId), JSON.stringify(rows));
}

export async function deleteProductSizeChart(productId: string): Promise<void> {
  return deleteSetting(productChartSlug(productId));
}
