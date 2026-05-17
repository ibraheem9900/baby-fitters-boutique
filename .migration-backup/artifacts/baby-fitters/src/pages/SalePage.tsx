import { Link, useSearch } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { FiltersPanel } from "@/components/FiltersPanel";
import { applyFilters, defaultFilters, type FilterState } from "@/lib/filter-utils";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export function SalePage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const sub = params.get("sub") ?? undefined;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel("products-sale")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const onSale = useMemo(() => {
    let list = (products ?? []).filter((p) => (p.discount_percent ?? 0) > 0);
    if (sub === "25% Off") list = list.filter((p) => p.discount_percent >= 25);
    else if (sub === "50% Off") list = list.filter((p) => p.discount_percent >= 50);
    else if (sub === "70% Off") list = list.filter((p) => p.discount_percent >= 70);
    return list;
  }, [products, sub]);

  const priceBounds = useMemo(() => {
    if (!onSale.length) return { min: 0, max: 50000 };
    const prices = onSale.map((p) => p.price);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 1000) };
  }, [onSale]);

  useEffect(() => {
    setFilters((f) => ({ ...f, maxPrice: priceBounds.max }));
  }, [priceBounds.max]);

  const filtered = applyFilters(onSale, filters);

  return (
    <PageLayout>
      <section className="bg-blush relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-semibold shadow-soft">
            <Tag className="w-3.5 h-3.5 text-primary" /> Sale & Deals
          </span>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">Sweet savings</h1>
          {sub && <p className="mt-2 text-sm uppercase tracking-widest text-primary font-bold">{sub}</p>}
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Discounts up to 70% off on hand-picked baby essentials.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[280px_1fr] gap-8">
        <FiltersPanel value={filters} onChange={setFilters} priceBounds={priceBounds} />
        <div>
          {products === null ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl">
              <h2 className="font-display text-3xl">No deals right now</h2>
              <p className="text-muted-foreground mt-3">Check back soon — we're cooking up sweet discounts.</p>
              <Link to="/" className="mt-6 inline-flex px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors">
                Browse store
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filtered.length} deal{filtered.length !== 1 ? "s" : ""}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
