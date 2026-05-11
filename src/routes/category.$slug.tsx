import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { FiltersPanel, applyFilters, defaultFilters, type FilterState } from "@/components/FiltersPanel";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { useCategoryImages } from "@/lib/category-images";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

type Search = { sub?: string };

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    sub: typeof s.sub === "string" ? s.sub : undefined,
  }),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { sub } = Route.useSearch();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const { getImage } = useCategoryImages();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel(`products-cat-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const inCategory = useMemo(
    () => (products ?? []).filter((p) => p.category === (slug as CategorySlug) && (!sub || p.subcategory === sub)),
    [products, slug, sub],
  );

  const priceBounds = useMemo(() => {
    if (!inCategory.length) return { min: 0, max: 50000 };
    const prices = inCategory.map((p) => p.price);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 1000) };
  }, [inCategory]);

  useEffect(() => {
    setFilters((f) => ({ ...f, maxPrice: priceBounds.max }));
  }, [priceBounds.max]);

  const filtered = applyFilters(inCategory, filters);

  if (!cat) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Category not found</h1>
          <Link to="/" className="text-primary mt-4 inline-block">← Go home</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className={`${cat.tint} relative overflow-hidden`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl">{cat.label}</h1>
            {sub && <p className="mt-2 text-sm uppercase tracking-widest text-primary font-bold">{sub}</p>}
            <p className="mt-3 text-muted-foreground max-w-md">
              Carefully curated {cat.label.toLowerCase()} for the little stars in your life.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-pillow aspect-[4/3] bg-card">
            <img src={cat.image} alt={cat.label} width={768} height={576} className="w-full h-full object-cover" />
          </div>
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
            <EmptyState />
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

function EmptyState() {
  return (
    <div className="text-center py-20 bg-card border border-border rounded-3xl">
      <h2 className="font-display text-3xl">Nothing matches your filters</h2>
      <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
        Try adjusting filters or browse other collections.
      </p>
      <Link to="/" className="mt-6 inline-flex px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors">
        Back to home
      </Link>
    </div>
  );
}
