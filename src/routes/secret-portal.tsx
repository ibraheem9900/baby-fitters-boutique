import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Upload, X, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CATEGORIES, categoryLabel, formatPrice, type CategorySlug } from "@/lib/categories";
import { fetchProducts, type Product, type ProductVariant } from "@/lib/products";
import { subcategoriesFor, SIZE_PRESETS, COLOR_PRESETS } from "@/lib/taxonomy";
import { supabase } from "@/integrations/supabase/client";
import brandMark from "@/assets/brand-mark.png";

export const Route = createFileRoute("/secret-portal")({
  component: SecretPortal,
  // No-index this route from the user-facing site
  head: () => ({
    meta: [
      { title: "Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// Admin access code. Change this to rotate access.
const ADMIN_ACCESS_CODE = "babyfitters2026";
const AUTH_KEY = "baby-fitters-admin-auth";

function SecretPortal() {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (code === ADMIN_ACCESS_CODE) {
        sessionStorage.setItem(AUTH_KEY, "1");
        onSuccess();
      } else {
        setError("Invalid access code.");
        setLoading(false);
      }
    }, 350);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 gradient-soft">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-pillow p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blush flex items-center justify-center overflow-hidden">
            <img src={brandMark} alt="" width={48} height={48} className="w-12 h-12 object-contain" />
          </div>
        </div>
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" /> Restricted Access
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin access code to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest"
          />
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code}
            className="w-full py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors disabled:opacity-50"
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
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel("products-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
        image_url: form.image_url || null,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_best_seller: form.is_best_seller,
        subcategory: form.subcategory || null,
        discount_percent: parseInt(form.discount_percent || "0", 10) || 0,
        gender: form.gender || null,
        age_group: form.age_group || null,
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added");
      }
      setForm(emptyForm);
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
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blush flex items-center justify-center overflow-hidden">
              <img src={brandMark} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="font-display font-semibold leading-none">Admin Portal</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Baby Fitters</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-blush text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Dashboard</p>
            <h1 className="font-display text-4xl sm:text-5xl mt-2">Manage products</h1>
            <p className="text-muted-foreground mt-2">{products?.length ?? "..."} products in catalog</p>
          </div>
          <button
            onClick={() => {
              setForm(emptyForm);
              setShowForm((v) => !v);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow"
          >
            {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add product</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-10 shadow-soft">
            <h2 className="font-display text-2xl mb-6">{form.id ? "Edit product" : "New product"}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Product name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Soft Cotton Onesie"
                />
              </Field>
              <Field label="Price (PKR)">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input"
                  placeholder="1500"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Image">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-blush cursor-pointer text-sm font-semibold transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-border" />
                  )}
                </div>
              </Field>
              <Field label="Subcategory (optional)">
                <input
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="input"
                  placeholder="e.g. Frocks, Feeders & Sippers"
                />
              </Field>
              <Field label="Discount %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                  className="input"
                  placeholder="0"
                />
              </Field>
              <Field label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input"
                >
                  <option value="">—</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="newborn">New Born</option>
                </select>
              </Field>
              <Field label="Age / Size">
                <select
                  value={form.age_group}
                  onChange={(e) => setForm({ ...form, age_group: e.target.value })}
                  className="input"
                >
                  <option value="">—</option>
                  <option value="0-3m">0–3 Months</option>
                  <option value="3-12m">3–12 Months</option>
                  <option value="1-4y">1–4 Years</option>
                  <option value="5-10y">5–10 Years</option>
                  <option value="10+">10+ Above</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input min-h-24"
                    placeholder="Soft, breathable cotton perfect for sensitive skin..."
                  />
                </Field>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-4">
                <Toggle label="Featured" checked={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
                <Toggle label="New arrival" checked={form.is_new_arrival} onChange={(v) => setForm({ ...form, is_new_arrival: v })} />
                <Toggle label="Best seller" checked={form.is_best_seller} onChange={(v) => setForm({ ...form, is_best_seller: v })} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : form.id ? "Update product" : "Add product"}
              </button>
              <button
                type="button"
                onClick={() => { setForm(emptyForm); setShowForm(false); }}
                className="px-6 py-3 rounded-full bg-muted font-semibold hover:bg-blush transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {products === null ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <h2 className="font-display text-2xl">No products yet</h2>
            <p className="text-muted-foreground mt-2">Click "Add product" to create your first one.</p>
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Tags</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link to="/product/$id" params={{ id: p.id }} className="flex items-center gap-3 hover:text-primary">
                          <div className="w-12 h-12 rounded-xl bg-blush overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <img src={brandMark} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                            )}
                          </div>
                          <span className="font-semibold">{p.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{categoryLabel(p.category)}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.is_featured && <Tag>Featured</Tag>}
                          {p.is_new_arrival && <Tag>New</Tag>}
                          {p.is_best_seller && <Tag>Best</Tag>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center" aria-label="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.875rem;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          font-size: 0.95rem;
          font-family: inherit;
          color: var(--color-foreground);
        }
        .input:focus { outline: none; box-shadow: 0 0 0 2px var(--color-ring); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-blush text-[10px] font-bold uppercase tracking-wider">{children}</span>;
}
