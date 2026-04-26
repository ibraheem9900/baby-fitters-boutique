import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const [products, setProducts] = useState<Product[] | null>(null);

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

  const filtered = (products ?? []).filter((p) => p.category === (slug as CategorySlug));

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">{cat.emoji}</div>
          <h1 className="font-display text-5xl sm:text-6xl">{cat.label}</h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Carefully curated {cat.label.toLowerCase()} for the little stars in your life.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🌸</div>
      <h2 className="font-display text-2xl">Nothing here yet</h2>
      <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
        We're hand-picking new pieces for this category. Check back soon — or browse other collections.
      </p>
      <Link to="/" className="mt-6 inline-flex px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors">
        Back to home
      </Link>
    </div>
  );
}
