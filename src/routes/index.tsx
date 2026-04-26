import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CATEGORIES, formatPrice } from "@/lib/categories";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/hero-baby.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel("products-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featured = (products ?? []).filter((p) => p.is_featured).slice(0, 8);
  const newArrivals = (products ?? []).filter((p) => p.is_new_arrival).slice(0, 4);
  const bestSellers = (products ?? []).filter((p) => p.is_best_seller).slice(0, 4);

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blush blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-sky blur-3xl opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-semibold shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              New Spring Collection
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
              Tiny moments,<br />
              <span className="italic text-primary">huge cuddles.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Soft pastel essentials for the littlest humans. From newborn snuggles to first steps — we've got every
              precious moment covered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/category/$slug"
                params={{ slug: "baby_garments" }}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow"
              >
                Shop the collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "baby_toys" }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-card border border-border font-semibold hover:bg-muted transition-colors"
              >
                Browse toys 🧸
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Free shipping over Rs 3,000</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Skin-safe materials</div>
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Loved by 10k+ parents</div>
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
              <img
                src={heroImg}
                alt="Soft baby essentials"
                width={1536}
                height={1152}
                className="w-full h-auto"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 sm:-left-8 bg-card rounded-2xl shadow-pillow p-4 flex items-center gap-3 border border-border"
            >
              <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-xl">⭐</div>
              <div>
                <p className="text-xs text-muted-foreground">Loved by parents</p>
                <p className="font-semibold text-sm">4.9/5 rating</p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 sm:-right-8 bg-card rounded-2xl shadow-pillow p-4 border border-border"
            >
              <p className="text-xs text-muted-foreground">Free shipping</p>
              <p className="font-semibold text-sm">Over {formatPrice(3000)}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Browse</p>
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
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={`${c.tint} group block rounded-3xl p-5 aspect-square flex flex-col justify-between hover:shadow-pillow transition-all duration-500 hover:-translate-y-1 border border-border overflow-hidden relative`}
              >
                <div className="relative w-full aspect-square -mt-2 -mx-2 mb-2 rounded-2xl overflow-hidden bg-background/40 max-h-[60%]">
                  <img
                    src={c.image}
                    alt={c.label}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div>
                  <p className="font-display text-base font-semibold leading-tight">{c.label}</p>
                  <p className="text-xs mt-1 inline-flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                    Shop now <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <ProductSection title="Featured favorites" subtitle="Picked with love" products={featured} loading={products === null} />

      {/* NEW ARRIVALS */}
      <ProductSection title="New arrivals" subtitle="Fresh & adorable" products={newArrivals} loading={products === null} />

      {/* BEST SELLERS */}
      <ProductSection title="Best sellers" subtitle="Parent approved" products={bestSellers} loading={products === null} />

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Reviews</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">Loved by parents</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Aisha M.", text: "The fabric is impossibly soft. My baby has the most sensitive skin and finally — no rashes!", emoji: "💕" },
            { name: "Hassan R.", text: "Quality is unreal for the price. The little booties are the cutest thing we own.", emoji: "👶" },
            { name: "Sara K.", text: "Fast shipping, beautiful packaging, and my daughter LOVES the teddy. Will be back!", emoji: "🧸" },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-soft"
            >
              <div className="text-3xl mb-4">{t.emoji}</div>
              <p className="text-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center font-semibold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Verified buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-[3rem] gradient-hero p-10 md:p-16 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blush blur-2xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-sky blur-2xl opacity-60" />
          <div className="relative max-w-xl mx-auto">
            <div className="text-4xl mb-3">💌</div>
            <h2 className="font-display text-3xl sm:text-4xl">Join the cuddle club</h2>
            <p className="mt-3 text-muted-foreground">
              Subscribe for new arrivals, parenting tips, and a sweet 10% off your first order.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Welcome to the cuddle club! 💕", { description: "Check your inbox for your 10% off code." });
                (e.target as HTMLFormElement).reset();
              }}
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  loading,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">{subtitle}</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">{title}</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
