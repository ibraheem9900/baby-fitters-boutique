import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { FiltersPanel, applyFilters, defaultFilters, type FilterState } from "@/components/FiltersPanel";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { fetchProducts, type Product } from "@/lib/products";
import { subFromSlug } from "@/lib/taxonomy";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/category/$slug/$sub")({
  component: SubcategoryPage,
});

function SubcategoryPage() {
  const { slug, sub } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const subLabel = subFromSlug(slug, sub);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel(`products-sub-${slug}-${sub}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [slug, sub]);

  const inSub = useMemo(
    () => (products ?? []).filter((p) => p.category === (slug as CategorySlug) && p.subcategory === subLabel),
    [products, slug, subLabel],
  );

  const priceBounds = useMemo(() => {
    if (!inSub.length) return { min: 0, max: 50000 };
    const prices = inSub.map((p) => p.price);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 1000) };
  }, [inSub]);

  useEffect(() => { setFilters((f) => ({ ...f, maxPrice: priceBounds.max })); }, [priceBounds.max]);

  const filtered = applyFilters(inSub, filters);

  if (!cat || !subLabel) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Page not found</h1>
          <Link to="/" className="text-primary mt-4 inline-block">← Go home</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className={`${cat.tint} relative overflow-hidden`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex gap-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/category/$slug" params={{ slug }} className="hover:text-primary">{cat.label}</Link>
            <span>/</span>
            <span className="text-foreground">{subLabel}</span>
          </nav>
          <h1 className="font-display text-5xl sm:text-6xl">{subLabel}</h1>
          <p className="mt-3 text-muted-foreground max-w-md">
            {subLabel} in {cat.label.toLowerCase()} — handpicked for your little one.
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
              <h2 className="font-display text-3xl">Nothing here yet</h2>
              <p className="text-muted-foreground mt-3 max-w-sm mx-auto">Check back soon — new pieces are landing.</p>
              <Link to="/category/$slug" params={{ slug }} className="mt-6 inline-flex px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors">
                Back to {cat.label}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
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
