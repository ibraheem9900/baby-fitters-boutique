import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Upload, X, Lock, LogOut, Image as ImageIcon, MessageSquare, Table2, RotateCcw, Inbox, Phone, Mail, MapPin, Search, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CATEGORIES, categoryLabel, formatPrice, type CategorySlug } from "@/lib/categories";
import { fetchProducts, type Product, type ProductVariant } from "@/lib/products";
import { subcategoriesFor, subcategoriesByGender, SIZE_PRESETS, COLOR_PRESETS, BABY_SIZES } from "@/lib/taxonomy";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { CategoryImagesManager } from "@/components/CategoryImagesManager";
import {
  getHeroImage, setHeroImage, resetHeroImage,
  getPopupConfig, setPopupConfig,
  getSizeChart, saveSizeChart,
  getProductSizeChart, saveProductSizeChart, deleteProductSizeChart,
  getAdminPasswordHash, setAdminPasswordHash,
  DEFAULT_SIZE_CHART, DEFAULT_POPUP_1, DEFAULT_POPUP_2,
  type PopupConfig, type SizeChartRow,
} from "@/lib/site-settings";

const ADMIN_ACCESS_CODE = "babyfitters2026";
const AUTH_KEY = "baby-fitters-admin-auth";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyAdminPassword(entered: string): Promise<boolean> {
  try {
    const storedHash = await getAdminPasswordHash();
    if (storedHash) {
      const hash = await sha256(entered);
      return hash === storedHash;
    }
    return entered === ADMIN_ACCESS_CODE;
  } catch {
    return entered === ADMIN_ACCESS_CODE;
  }
}

export function SecretPortalPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  if (authed === null) return null;
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} />;
}

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const valid = await verifyAdminPassword(code);
    if (valid) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError("Invalid access code.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 gradient-soft">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-pillow p-8"
      >
        <div className="flex justify-center mb-6">
          <BrandLogo className="w-20 h-20 ring-1 ring-border shadow-soft" />
        </div>
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" /> Restricted Access
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">Enter your admin access code to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-[15px]"
          />
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code}
            className="w-full py-3 rounded-full bg-foreground text-background font-bold text-[15px] hover:bg-primary transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary mt-6">
          ← Back to store
        </Link>
      </motion.div>
    </div>
  );
}

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: CategorySlug;
  image_url: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  subcategory: string;
  discount_percent: string;
  gender: string;
  age_group: string;
  images: string[];
  variants: ProductVariant[];
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: "baby_garments",
  image_url: "",
  is_featured: false,
  is_new_arrival: true,
  is_best_seller: false,
  subcategory: "",
  discount_percent: "0",
  gender: "",
  age_group: "",
  images: [],
  variants: [],
};

const MAX_IMAGES = 6;
type AdminTab = "products" | "images" | "hero" | "popups" | "sizechart" | "inquiries" | "password";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [useCustomChart, setUseCustomChart] = useState(false);
  const [productSizeChart, setProductSizeChart] = useState<SizeChartRow[]>([]);
  const [adminSearch, setAdminSearch] = useState("");

  const displayProducts = useMemo(() => {
    if (!products) return null;
    const q = adminSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      categoryLabel(p.category).toLowerCase().includes(q) ||
      (p.subcategory ?? "").toLowerCase().includes(q) ||
      (p.gender ?? "").toLowerCase().includes(q) ||
      (p.age_group ?? "").toLowerCase().includes(q)
    );
  }, [products, adminSearch]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel("products-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) { toast.error(`Max ${MAX_IMAGES} images`); return; }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm((f) => {
        const next = [...f.images, ...urls].slice(0, MAX_IMAGES);
        return { ...f, images: next, image_url: f.image_url || next[0] || "" };
      });
      toast.success(`${urls.length} image${urls.length !== 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(idx: number) {
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== idx);
      return { ...f, images, image_url: images[0] ?? "" };
    });
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { label: "", size: "", color: "", colorHex: "" }] }));
  }
  function updateVariant(idx: number, patch: Partial<ProductVariant>) {
    setForm((f) => ({ ...f, variants: f.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)) }));
  }
  function removeVariant(idx: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        image_url: form.images[0] ?? form.image_url ?? null,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_best_seller: form.is_best_seller,
        subcategory: form.subcategory || null,
        discount_percent: parseInt(form.discount_percent || "0", 10) || 0,
        gender: form.gender || null,
        age_group: form.age_group || null,
        images: form.images,
        variants: form.variants.filter((v) => v.size || v.color || v.label) as unknown as ProductVariant[],
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        if (useCustomChart && productSizeChart.length > 0) {
          await saveProductSizeChart(form.id, productSizeChart);
        } else {
          await deleteProductSizeChart(form.id);
        }
        toast.success("Product updated");
      } else {
        const { data: newData, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        if (newData?.id && useCustomChart && productSizeChart.length > 0) {
          await saveProductSizeChart(newData.id, productSizeChart);
        }
        toast.success("Product added");
      }
      setForm(emptyForm);
      setUseCustomChart(false);
      setProductSizeChart([]);
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Product deleted");
  }

  function handleEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category: p.category,
      image_url: p.image_url ?? "",
      is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival,
      is_best_seller: p.is_best_seller,
      subcategory: p.subcategory ?? "",
      discount_percent: String(p.discount_percent ?? 0),
      gender: p.gender ?? "",
      age_group: p.age_group ?? "",
      images: (p.images && p.images.length ? p.images : (p.image_url ? [p.image_url] : [])),
      variants: p.variants ?? [],
    });
    setUseCustomChart(false);
    setProductSizeChart([]);
    getProductSizeChart(p.id).then((rows) => {
      if (rows && rows.length > 0) {
        setUseCustomChart(true);
        setProductSizeChart(rows);
      }
    });
    setShowForm(true);
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "products",  label: "Products",        icon: <Plus className="w-4 h-4" /> },
    { id: "inquiries", label: "Inquiries",       icon: <Inbox className="w-4 h-4" /> },
    { id: "images",    label: "Category Images", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "hero",      label: "Hero Image",      icon: <ImageIcon className="w-4 h-4" /> },
    { id: "popups",    label: "Hero Popups",     icon: <MessageSquare className="w-4 h-4" /> },
    { id: "sizechart", label: "Size Chart",      icon: <Table2 className="w-4 h-4" /> },
    { id: "password",  label: "Change Password", icon: <KeyRound className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="site-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-10 h-10 ring-1 ring-border rounded-xl" />
            <div>
              <p className="font-display font-semibold leading-none text-[16px]">Admin Portal</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Baby Fitters</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              View Store →
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-blush text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="site-container py-8">
        <div className="mb-8">
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">Admin Panel</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">{products?.length ?? "..."} products in catalog</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-8 border-b border-border pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === t.id ? "bg-foreground text-background" : "bg-muted hover:bg-blush"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Manage Products</h2>
              <button
                onClick={() => { setForm(emptyForm); setShowForm((v) => !v); }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow"
              >
                {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add product</>}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {CATEGORIES.map((cat) => {
                const count = products?.filter((p) => p.category === cat.slug).length ?? "—";
                const boyCount = products?.filter((p) => p.category === cat.slug && p.gender === "boys").length;
                const girlCount = products?.filter((p) => p.category === cat.slug && p.gender === "girls").length;
                return (
                  <div key={cat.slug} className={`${cat.tint} rounded-2xl p-4 border border-border/40`}>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/60 leading-tight">{cat.label}</p>
                    <p className="font-display text-3xl mt-1 text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">product{count !== 1 ? "s" : ""}</p>
                    {(boyCount !== undefined || girlCount !== undefined) && (boyCount! > 0 || girlCount! > 0) && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {boyCount! > 0 && `${boyCount} boys`}{boyCount! > 0 && girlCount! > 0 && " · "}{girlCount! > 0 && `${girlCount} girls`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search by name, category, subcategory, gender, age…"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
              />
              {adminSearch && (
                <button
                  type="button"
                  onClick={() => setAdminSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-10 shadow-soft">
                <h2 className="font-display text-2xl mb-6">{form.id ? "Edit product" : "New product"}</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Product name">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Soft Cotton Onesie" />
                  </Field>
                  <Field label="Price (PKR)">
                    <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" placeholder="1500" />
                  </Field>
                  <Field label="Category">
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug, subcategory: "", gender: "" })} className="input">
                      {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Gender">
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value, subcategory: "" })} className="input">
                      <option value="">— Any —</option>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="newborn">New Born</option>
                    </select>
                  </Field>
                  <Field label="Subcategory">
                    <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="input">
                      <option value="">— None —</option>
                      {subcategoriesByGender(form.category).map((group) => {
                        if (form.gender && group.gender && group.gender !== form.gender) return null;
                        return (
                          <optgroup key={group.label} label={group.label}>
                            {group.items.map((s) => <option key={s} value={s}>{s}</option>)}
                          </optgroup>
                        );
                      })}
                    </select>
                  </Field>
                  <Field label="Age / Size">
                    <select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} className="input">
                      <option value="">—</option>
                      <option value="0-3m">0–3 Months</option>
                      <option value="3-6m">3–12 Months</option>
                      <option value="6-12m">6–12 Months</option>
                      <option value="1-2y">1–2 Years</option>
                      <option value="2-3y">2–3 Years</option>
                      <option value="3-5y">3–5 Years</option>
                      <option value="5-10y">5–10 Years</option>
                      <option value="10+">10+ Above</option>
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field label={`Images (up to ${MAX_IMAGES})`}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-blush cursor-pointer text-sm font-semibold transition-colors ${form.images.length >= MAX_IMAGES ? "opacity-50 pointer-events-none" : ""}`}>
                            <Upload className="w-4 h-4" />
                            {uploading ? "Uploading..." : `Upload (${form.images.length}/${MAX_IMAGES})`}
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading || form.images.length >= MAX_IMAGES} />
                          </label>
                          <p className="text-xs text-muted-foreground">First image is the cover.</p>
                        </div>
                        {form.images.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {form.images.map((src, i) => (
                              <div key={src + i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                                <img src={src} alt={`product ${i + 1}`} className="w-full h-full object-cover" />
                                {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-foreground text-background text-[9px] font-bold uppercase tracking-wider">Cover</span>}
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Field>
                  </div>
                  <Field label="Discount %">
                    <input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="input" placeholder="0" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24" placeholder="Soft, breathable cotton..." />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Available sizes">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {BABY_SIZES.map((s) => {
                          const sizesVariant = form.variants.find((v) => Array.isArray(v.sizes));
                          const active = !!sizesVariant?.sizes?.includes(s);
                          return (
                            <button key={s} type="button"
                              onClick={() => {
                                setForm((f) => {
                                  const idx = f.variants.findIndex((v) => Array.isArray(v.sizes));
                                  const current = idx >= 0 ? (f.variants[idx].sizes ?? []) : [];
                                  const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
                                  let variants = [...f.variants];
                                  if (idx >= 0) {
                                    if (next.length === 0) variants.splice(idx, 1);
                                    else variants[idx] = { ...variants[idx], sizes: next };
                                  } else if (next.length) {
                                    variants = [{ label: "Size", sizes: next }, ...variants];
                                  }
                                  return { ...f, variants };
                                });
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-foreground text-background border-foreground shadow-soft" : "bg-background border-border hover:bg-blush"}`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Variants">
                      <div className="space-y-2">
                        {form.variants.map((v, i) => (
                          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center bg-background border border-border rounded-2xl p-2">
                            <input value={v.label ?? ""} onChange={(e) => updateVariant(i, { label: e.target.value })} className="input" placeholder="Attribute" />
                            <input value={v.size ?? ""} onChange={(e) => updateVariant(i, { size: e.target.value })} className="input" placeholder="Size" list={`size-presets-${i}`} />
                            <datalist id={`size-presets-${i}`}>{SIZE_PRESETS.map((s) => <option key={s} value={s} />)}</datalist>
                            <input value={v.color ?? ""} onChange={(e) => { const preset = COLOR_PRESETS.find((c) => c.name.toLowerCase() === e.target.value.toLowerCase()); updateVariant(i, { color: e.target.value, colorHex: preset?.hex ?? v.colorHex ?? "" }); }} className="input" placeholder="Color" list={`color-presets-${i}`} />
                            <datalist id={`color-presets-${i}`}>{COLOR_PRESETS.map((c) => <option key={c.name} value={c.name} />)}</datalist>
                            <input type="color" value={v.colorHex || "#ffffff"} onChange={(e) => updateVariant(i, { colorHex: e.target.value })} className="h-10 w-12 rounded-xl border border-border bg-background cursor-pointer" />
                            <button type="button" onClick={() => removeVariant(i)} className="w-10 h-10 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-blush text-sm font-semibold transition-colors">
                          <Plus className="w-4 h-4" /> Add variant
                        </button>
                      </div>
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <div className="bg-background border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                        <div>
                          <p className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Product Size Chart</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Override the global size chart for this specific product.</p>
                        </div>
                        <Toggle
                          label={useCustomChart ? "Custom" : "Using global"}
                          checked={useCustomChart}
                          onChange={(v) => {
                            setUseCustomChart(v);
                            if (v && productSizeChart.length === 0) {
                              setProductSizeChart(DEFAULT_SIZE_CHART.map((r) => ({ ...r })));
                            }
                          }}
                        />
                      </div>
                      {useCustomChart && (
                        <div className="p-4 space-y-3">
                          <div className="overflow-x-auto rounded-xl border border-border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr className="text-left">
                                  <th className="px-3 py-2 font-bold text-xs">Size</th>
                                  <th className="px-3 py-2 font-bold text-xs">Chest</th>
                                  <th className="px-3 py-2 font-bold text-xs">Length</th>
                                  <th className="px-3 py-2 font-bold text-xs">Weight</th>
                                  <th className="px-3 py-2 w-10" />
                                </tr>
                              </thead>
                              <tbody>
                                {productSizeChart.map((row, i) => (
                                  <tr key={i} className="border-t border-border">
                                    {(["size", "chest", "length", "weight"] as const).map((field) => (
                                      <td key={field} className="px-2 py-1.5">
                                        <input
                                          value={row[field]}
                                          onChange={(e) => setProductSizeChart((prev) => prev.map((r, ri) => ri === i ? { ...r, [field]: e.target.value } : r))}
                                          className="input text-xs py-1.5 px-2 rounded-lg"
                                          placeholder={field}
                                        />
                                      </td>
                                    ))}
                                    <td className="px-2 py-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setProductSizeChart((prev) => prev.filter((_, ri) => ri !== i))}
                                        className="w-7 h-7 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setProductSizeChart((prev) => [...prev, { size: "", chest: "", length: "", weight: "" }])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-blush text-xs font-semibold transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add row
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductSizeChart(DEFAULT_SIZE_CHART.map((r) => ({ ...r })))}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-blush text-xs font-semibold transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Load defaults
                            </button>
                          </div>
                          <p className="text-[11px] text-muted-foreground">This chart will appear on the product page instead of the global size chart. Saved when you click "Save product".</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-wrap gap-4">
                    <Toggle label="Featured" checked={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
                    <Toggle label="New arrival" checked={form.is_new_arrival} onChange={(v) => setForm({ ...form, is_new_arrival: v })} />
                    <Toggle label="Best seller" checked={form.is_best_seller} onChange={(v) => setForm({ ...form, is_best_seller: v })} />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={saving} className="px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : form.id ? "Update product" : "Add product"}
                  </button>
                  <button type="button" onClick={() => { setForm(emptyForm); setUseCustomChart(false); setProductSizeChart([]); setShowForm(false); }} className="px-6 py-3 rounded-full bg-muted font-semibold hover:bg-blush transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {displayProducts === null ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : products!.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border">
                <h2 className="font-display text-2xl">No products yet</h2>
                <p className="text-muted-foreground mt-2">Click "Add product" to get started.</p>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl border border-border">
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <h2 className="font-display text-xl">No results for "{adminSearch}"</h2>
                <p className="text-muted-foreground mt-1 text-sm">Try a different name, category, or keyword.</p>
              </div>
            ) : (
              <div className="bg-card rounded-3xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold">
                    {adminSearch ? `${displayProducts.length} of ${products!.length} products` : `${products!.length} products`}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-bold">Product</th>
                        <th className="px-4 py-3 font-bold">Category</th>
                        <th className="px-4 py-3 font-bold">Subcategory</th>
                        <th className="px-4 py-3 font-bold">Gender</th>
                        <th className="px-4 py-3 font-bold">Price</th>
                        <th className="px-4 py-3 font-bold">Tags</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayProducts.map((p) => (
                        <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3">
                            <Link to={`/product/${p.id}`} className="flex items-center gap-3 hover:text-primary">
                              <div className="w-12 h-12 rounded-xl bg-blush overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <BrandLogo className="w-9 h-9" />}
                              </div>
                              <span className="font-semibold">{p.name}</span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{categoryLabel(p.category)}</td>
                          <td className="px-4 py-3">
                            {p.subcategory ? (
                              <span className="text-foreground font-medium">{p.subcategory}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.gender ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.gender === "boys" ? "bg-sky text-blue-800" : p.gender === "girls" ? "bg-blush text-pink-800" : "bg-mint text-green-800"}`}>
                                {p.gender}
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 font-bold">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.is_featured && <PTag>Featured</PTag>}
                              {p.is_new_arrival && <PTag>New</PTag>}
                              {p.is_best_seller && <PTag>Best</PTag>}
                              {(p.discount_percent ?? 0) > 0 && <PTag>{p.discount_percent}% off</PTag>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "inquiries" && <InquiriesManager />}
        {activeTab === "images" && <CategoryImagesManager />}
        {activeTab === "hero" && <HeroImageManager />}
        {activeTab === "popups" && <PopupsManager />}
        {activeTab === "sizechart" && <SizeChartManager />}
        {activeTab === "password" && <ChangePasswordManager />}
      </div>
    </div>
  );
}

function HeroImageManager() {
  const [current, setCurrent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getHeroImage().then(setCurrent); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero/hero-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      await setHeroImage(data.publicUrl);
      setCurrent(data.publicUrl);
      toast.success("Hero image updated — live on homepage!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset to default hero image?")) return;
    setBusy(true);
    try {
      await resetHeroImage();
      setCurrent(null);
      toast.success("Reverted to default hero image");
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>
        <div>
          <h2 className="font-display text-2xl">Homepage Hero Image</h2>
          <p className="text-sm text-muted-foreground">Replace the main banner image shown on the homepage.</p>
        </div>
      </div>
      <div className="max-w-xl space-y-4">
        <div className="rounded-2xl overflow-hidden border border-border aspect-video bg-muted relative">
          {current ? (
            <>
              <img src={current} alt="Hero" className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">Custom</span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Default image is active
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm cursor-pointer hover:bg-primary transition-colors ${busy ? "opacity-60 pointer-events-none" : ""}`}>
            <Upload className="w-4 h-4" />
            {busy ? "Uploading..." : "Replace hero image"}
            <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={handleUpload} />
          </label>
          {current && (
            <button onClick={handleReset} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground font-semibold text-sm transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Recommended: 1536×1152px, JPG or WebP. Changes take effect instantly.</p>
      </div>
    </section>
  );
}

function PopupsManager() {
  const [p1, setP1] = useState<PopupConfig>({ ...DEFAULT_POPUP_1 });
  const [p2, setP2] = useState<PopupConfig>({ ...DEFAULT_POPUP_2 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPopupConfig(1).then(setP1);
    getPopupConfig(2).then(setP2);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await setPopupConfig(1, p1);
      await setPopupConfig(2, p2);
      toast.success("Popup settings saved — live on homepage!");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-butter flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
        <div>
          <h2 className="font-display text-2xl">Hero Popup Cards</h2>
          <p className="text-sm text-muted-foreground">Edit the two floating cards shown on the homepage hero section.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {([{ cfg: p1, set: setP1, label: "Popup 1 (top-left)" }, { cfg: p2, set: setP2, label: "Popup 2 (bottom-right)" }] as const).map(({ cfg, set, label }, idx) => (
          <div key={idx} className="bg-background rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[15px]">{label}</h3>
              <Toggle label="Visible" checked={cfg.visible} onChange={(v) => set({ ...cfg, visible: v })} />
            </div>
            <Field label="Line 1 (small text)">
              <input value={cfg.line1} onChange={(e) => set({ ...cfg, line1: e.target.value })} className="input" placeholder="Loved by parents" />
            </Field>
            <Field label="Line 2 (bold text)">
              <input value={cfg.line2} onChange={(e) => set({ ...cfg, line2: e.target.value })} className="input" placeholder="4.9/5 rating" />
            </Field>
            <div className="bg-muted rounded-xl p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              {cfg.visible ? (
                <div>
                  <p className="text-xs text-muted-foreground">{cfg.line1 || "–"}</p>
                  <p className="font-bold text-sm">{cfg.line2 || "–"}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Hidden</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors disabled:opacity-50">
        {saving ? "Saving..." : "Save popup settings"}
      </button>
    </section>
  );
}

function SizeChartManager() {
  const [rows, setRows] = useState<SizeChartRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSizeChart().then((r) => { setRows(r); setLoaded(true); });
  }, []);

  function updateRow(idx: number, field: keyof SizeChartRow, val: string) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  }
  function addRow() {
    setRows((prev) => [...prev, { size: "", chest: "", length: "", weight: "" }]);
  }
  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSizeChart(rows);
      toast.success("Size chart saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset to default size chart?")) return;
    setRows(DEFAULT_SIZE_CHART.map((r) => ({ ...r })));
    toast.info("Reset to defaults — click Save to apply");
  }

  if (!loaded) return <p className="text-muted-foreground p-4">Loading...</p>;

  return (
    <section className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-mint flex items-center justify-center"><Table2 className="w-4 h-4" /></div>
        <div>
          <h2 className="font-display text-2xl">Size Chart Editor</h2>
          <p className="text-sm text-muted-foreground">Edit the size chart shown to customers in the footer size guide.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border mb-4">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              <th className="px-3 py-3 font-bold">Size</th>
              <th className="px-3 py-3 font-bold">Chest</th>
              <th className="px-3 py-3 font-bold">Length</th>
              <th className="px-3 py-3 font-bold">Weight</th>
              <th className="px-3 py-3 font-bold w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {(["size", "chest", "length", "weight"] as const).map((field) => (
                  <td key={field} className="px-2 py-2">
                    <input
                      value={row[field]}
                      onChange={(e) => updateRow(i, field, e.target.value)}
                      className="input text-sm py-1.5 px-2 rounded-lg"
                      placeholder={field}
                    />
                  </td>
                ))}
                <td className="px-2 py-2">
                  <button type="button" onClick={() => removeRow(i)} className="w-8 h-8 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-blush text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add row
        </button>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-primary transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save chart"}
        </button>
        <button onClick={handleReset} className="px-5 py-2 rounded-full bg-muted hover:bg-blush font-semibold text-sm transition-colors inline-flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" /> Reset defaults
        </button>
      </div>
    </section>
  );
}

type Inquiry = {
  id: string;
  name: string;
  email: string;
  contact: string;
  area: string;
  message: string;
  created_at: string;
};

function InquiriesManager() {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });
        setInquiries((data as Inquiry[]) ?? []);
      } catch {
        setInquiries([]);
      }
    }
    load();
    const channel = supabase
      .channel("inquiries-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_submissions" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function fmt(iso: string) {
    try {
      return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
    } catch { return iso; }
  }

  return (
    <section className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center">
          <Inbox className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Customer Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            All messages submitted through the contact form.
          </p>
        </div>
        {inquiries !== null && (
          <span className="ml-auto px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {inquiries.length}
          </span>
        )}
      </div>

      {inquiries === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">No inquiries yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Messages submitted through the contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-background border border-border rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                className="w-full flex items-start gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center flex-shrink-0 font-display text-lg font-bold text-primary">
                  {inq.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold">{inq.name}</span>
                    <span className="text-xs text-muted-foreground">{fmt(inq.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{inq.message}</p>
                </div>
                <div className="flex gap-3 items-center flex-shrink-0 ml-2">
                  {inq.contact && (
                    <a
                      href={`https://wa.me/${inq.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors"
                      title="Reply on WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {inq.email && inq.email !== "" && (
                    <a
                      href={`mailto:${inq.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-sky hover:bg-sky/70 text-blue-700 flex items-center justify-center transition-colors"
                      title="Reply by email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className={`text-muted-foreground transition-transform ${expanded === inq.id ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </div>
              </button>

              {expanded === inq.id && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 bg-muted/20">
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{inq.contact || "—"}</span>
                    </div>
                    {inq.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{inq.email}</span>
                      </div>
                    )}
                    {inq.area && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{inq.area}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-background rounded-xl p-3.5 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Message</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                  </div>
                  {inq.contact && (
                    <a
                      href={`https://wa.me/${inq.contact.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${inq.name}! Thanks for reaching out to Baby Fitters. `)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Reply on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function PTag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-blush text-[10px] font-bold uppercase tracking-wider">{children}</span>;
}

function PasswordInput({
  label, value, show, onToggle, onChange, placeholder, autoComplete,
}: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <span className="block text-[13px] font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full px-4 py-3 pr-12 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[15px]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordManager() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [fieldError, setFieldError] = useState("");

  const MIN_LEN = 8;

  const newStrength = newPw.length === 0 ? 0 : newPw.length < MIN_LEN ? 1 : newPw.length < 12 ? 2 : 3;
  const strengthLabel = ["", "Too short", "Good", "Strong"][newStrength];
  const strengthColor = ["", "bg-destructive", "bg-amber-400", "bg-emerald-500"][newStrength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");

    if (newPw.length < MIN_LEN) {
      setFieldError(`New password must be at least ${MIN_LEN} characters.`);
      return;
    }
    if (newPw !== confirmPw) {
      setFieldError("New passwords don't match. Please re-enter.");
      return;
    }
    if (newPw === currentPw) {
      setFieldError("New password must be different from the current password.");
      return;
    }

    setStatus("loading");
    try {
      const valid = await verifyAdminPassword(currentPw);
      if (!valid) {
        setFieldError("Current password is incorrect. Please try again.");
        setStatus("idle");
        return;
      }
      const hash = await sha256(newPw);
      await setAdminPasswordHash(hash);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setStatus("success");
      toast.success("Password updated successfully!");
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-emerald-900 mb-2">Password updated!</h3>
          <p className="text-[14px] text-emerald-700 mb-6 leading-relaxed">
            Your new password is active immediately. Use it next time you sign in.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="px-6 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-primary transition-colors"
          >
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="mb-8">
        <p className="eyebrow">Security</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2">Change Password</h2>
        <p className="text-muted-foreground text-[14px] mt-2">
          Update your admin access code. The new password takes effect immediately.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <PasswordInput
            label="Current password"
            value={currentPw}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            onChange={setCurrentPw}
            placeholder="Your current access code"
            autoComplete="current-password"
          />

          <div className="relative border-t border-border pt-5 space-y-5">
            <PasswordInput
              label="New password"
              value={newPw}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              onChange={setNewPw}
              placeholder={`Minimum ${MIN_LEN} characters`}
              autoComplete="new-password"
            />

            {newPw.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${newStrength >= lvl ? strengthColor : "bg-muted"}`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] font-semibold ${newStrength === 1 ? "text-destructive" : newStrength === 2 ? "text-amber-500" : "text-emerald-600"}`}>
                  {strengthLabel}
                </p>
              </div>
            )}

            <PasswordInput
              label="Confirm new password"
              value={confirmPw}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              onChange={setConfirmPw}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />

            {confirmPw.length > 0 && newPw.length > 0 && (
              <p className={`text-[12px] font-medium flex items-center gap-1.5 ${newPw === confirmPw ? "text-emerald-600" : "text-destructive"}`}>
                {newPw === confirmPw
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                  : "Passwords don't match yet"}
              </p>
            )}
          </div>

          {fieldError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/8 rounded-xl px-4 py-2.5 font-medium"
            >
              {fieldError}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !currentPw || !newPw || !confirmPw}
            className="w-full py-3.5 rounded-full bg-foreground text-background font-bold text-[15px] hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <><span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Updating…</>
            ) : (
              <><KeyRound className="w-4 h-4" /> Update password</>
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground text-center">
        Password is hashed with SHA-256 and stored securely. The old password stops working immediately.
      </p>
    </div>
  );
}
