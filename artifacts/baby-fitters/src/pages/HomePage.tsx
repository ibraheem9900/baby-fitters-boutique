import { Link } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart, Tag, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { formatPrice } from "@/lib/categories";
import { useCategoryImages } from "@/lib/category-images";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/hero-baby.jpg";
import { getHeroImage, getPopupConfig, type PopupConfig } from "@/lib/site-settings";

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [heroSrc, setHeroSrc] = useState<string>(heroImg);
  const [popup1, setPopup1] = useState<PopupConfig>({ visible: true, line1: "Loved by parents", line2: "4.9/5 rating" });
  const [popup2, setPopup2] = useState<PopupConfig>({ visible: true, line1: "Free shipping", line2: "Over Rs 3,000" });
  const { categoriesWithImages: CATEGORIES } = useCategoryImages();

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    getHeroImage().then((url) => { if (url) setHeroSrc(url); });
    getPopupConfig(1).then(setPopup1);
    getPopupConfig(2).then(setPopup2);

    const channel = supabase
      .channel("products-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "category_images" }, () => {
        getHeroImage().then((url) => { if (url) setHeroSrc(url); else setHeroSrc(heroImg); });
        getPopupConfig(1).then(setPopup1);
        getPopupConfig(2).then(setPopup2);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const featured    = (products ?? []).filter((p) => p.is_featured).slice(0, 6);
  const discounted  = (products ?? []).filter((p) => (p.discount_percent ?? 0) > 0).slice(0, 6);
  const bestSellers = (products ?? []).filter((p) => p.is_best_seller).slice(0, 6);

  return (
    <PageLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blush blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-sky blur-3xl opacity-50" />
        <div className="relative site-container py-16 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-semibold shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              New Spring Collection
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.02] tracking-tight">
              Tiny moments,<br />
              <span className="italic text-primary">huge cuddles.</span>
            </h1>
            <p className="mt-6 text-[17px] text-muted-foreground max-w-md leading-relaxed">
              Soft pastel essentials for the littlest humans. From newborn snuggles to first steps — we've got every precious moment covered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/category/baby_garments"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background font-bold text-[15px] hover:bg-primary transition-colors shadow-pillow"
              >
                Shop the collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-[14px] font-medium">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary flex-shrink-0" /> Free shipping over Rs 3,000</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" /> Skin-safe materials</div>
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary flex-shrink-0" /> Loved by 10k+ parents</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blush rounded-[3rem] rotate-3" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-pillow">
              <img src={heroSrc} alt="Soft baby essentials" width={1536} height={1152} className="w-full h-auto" />
            </div>

            {popup1.visible && (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 sm:-left-8 bg-card rounded-2xl shadow-pillow p-4 flex items-center gap-3 border border-border"
              >
                <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{popup1.line1}</p>
                  <p className="font-bold text-sm">{popup1.line2}</p>
                </div>
              </motion.div>
            )}

            {popup2.visible && (
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 sm:-right-8 bg-card rounded-2xl shadow-pillow p-4 border border-border"
              >
                <p className="text-xs text-muted-foreground">{popup2.line1}</p>
                <p className="font-bold text-sm">{popup2.line2}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="site-container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Shop by category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/category/${c.slug}`}
                className="group block rounded-3xl overflow-hidden relative aspect-square hover:shadow-pillow transition-all duration-500 hover:-translate-y-1"
              >
                <img
                  src={c.image}
                  alt={c.label}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="font-display text-white text-[15px] font-semibold leading-tight drop-shadow-lg">{c.label}</p>
                  <p className="text-white/80 text-xs mt-1 inline-flex items-center gap-1 group-hover:text-white transition-colors font-medium">
                    Shop now <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: CATEGORIES.length * 0.05 }}
          >
            <Link
              to="/sale"
              className="group block rounded-3xl overflow-hidden relative aspect-square hover:shadow-pillow transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-200"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Tag className="w-7 h-7 text-rose-600" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">%</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent group-hover:from-black/75 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <p className="font-display text-white text-[15px] font-semibold leading-tight drop-shadow-lg">Sale &amp; Deals</p>
                <p className="text-white/80 text-xs mt-1 inline-flex items-center gap-1 group-hover:text-white transition-colors font-medium">
                  Shop now <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <ProductSection title="Featured favorites" subtitle="Picked with love" products={featured} loading={products === null} />
      <ProductSection title="Discounted deals" subtitle="Sweet savings" products={discounted} loading={products === null} />
      <ProductSection title="Best sellers" subtitle="Parent approved" products={bestSellers} loading={products === null} />

      <section className="site-container py-20">
        <div className="text-center mb-12">
          <p className="eyebrow">Reviews</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">Loved by parents</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Aisha M.", text: "The fabric is impossibly soft. My baby has the most sensitive skin and finally — no rashes!" },
            { name: "Hassan R.", text: "Quality is unreal for the price. The little booties are the cutest thing we own." },
            { name: "Sara K.", text: "Fast shipping, beautiful packaging, and my daughter loves the teddy. Will be back!" },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-soft"
            >
              <div className="flex gap-0.5 mb-4 text-primary">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Sparkles key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-[15px] text-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-[14px]">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Verified buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="site-container py-20">
        <div className="relative overflow-hidden rounded-[3rem] gradient-hero p-10 md:p-16 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blush blur-2xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-sky blur-2xl opacity-60" />
          <div className="relative max-w-xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl">Join the cuddle club</h2>
            <p className="mt-3 text-muted-foreground text-[15px]">
              Subscribe for new arrivals, parenting tips, and a sweet 10% off your first order.
            </p>
            <SubscribeForm />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message ?? "Something went wrong");
      setCode((json as { code?: string }).code ?? "BABY10");
      setEmailSent((json as { emailSent?: boolean }).emailSent ?? false);
      setStatus("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 max-w-md mx-auto">
        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-background/60 px-6 py-5 text-center">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">Your 10% off code</p>
          <p className="font-display text-3xl font-bold tracking-widest text-primary">{code}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {emailSent ? "Also sent to your inbox — use at checkout!" : "Copy this code and use it at checkout!"}
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); setEmail(""); setCode(""); setEmailSent(false); }}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Subscribe another email →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={status === "loading"}
        className="flex-1 px-5 py-3 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[15px] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-[14px] hover:bg-primary transition-colors disabled:opacity-60"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
        ) : "Subscribe"}
      </button>
    </form>
  );
}

function ProductSection({ title, subtitle, products, loading }: { title: string; subtitle: string; products: Product[]; loading: boolean }) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="site-container py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">{title}</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.slice(0, 3).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
