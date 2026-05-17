import { useEffect, useState } from "react";
import { Upload, RotateCcw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { fetchCategoryImageOverrides } from "@/lib/category-images";

export function CategoryImagesManager() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryImageOverrides().then(setOverrides);
    const channel = supabase
      .channel("category-images-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "category_images" }, () => {
        fetchCategoryImageOverrides().then(setOverrides);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleUpload(slug: string, file: File) {
    setBusy(slug);
    try {
      const ext = file.name.split(".").pop();
      const path = `categories/${slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const url = data.publicUrl;
      const { error } = await supabase
        .from("category_images")
        .upsert({ slug, image_url: url }, { onConflict: "slug" });
      if (error) throw error;
      toast.success("Category image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleReset(slug: string) {
    if (!confirm("Reset to the default image?")) return;
    setBusy(slug);
    try {
      const { error } = await supabase.from("category_images").delete().eq("slug", slug);
      if (error) throw error;
      toast.success("Reverted to default");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-10 shadow-soft">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Category banners</h2>
          <p className="text-sm text-muted-foreground">Replace the image shown on the homepage and category pages.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map((c) => {
          const current = overrides[c.slug] ?? c.image;
          const isCustom = !!overrides[c.slug];
          const loading = busy === c.slug;
          return (
            <div key={c.slug} className="rounded-2xl border border-border overflow-hidden bg-background flex flex-col">
              <div className="relative aspect-square bg-muted">
                <img src={current} alt={c.label} className="w-full h-full object-cover" />
                {isCustom && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                    Custom
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                <p className="font-semibold text-sm truncate">{c.label}</p>
                <div className="flex items-center gap-2">
                  <label
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-muted hover:bg-blush text-xs font-semibold cursor-pointer transition-colors ${loading ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {loading ? "..." : "Replace"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) handleUpload(c.slug, f);
                      }}
                    />
                  </label>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleReset(c.slug)}
                      disabled={loading}
                      title="Reset to default"
                      className="w-9 h-9 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
