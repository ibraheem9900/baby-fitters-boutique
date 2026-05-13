import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const filtered = (products ?? []).filter((p) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return p.name.toLowerCase().includes(s) || (p.description ?? "").toLowerCase().includes(s);
  });

  return (
    <PageLayout>
      <section className="gradient-soft py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl text-center">Find something sweet</h1>
          <div className="mt-8 relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for booties, onesies, teddies..."
              className="w-full pl-14 pr-5 py-4 rounded-full bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl">No results</h2>
            <p className="text-muted-foreground mt-2">Try a different search term.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}{q && ` for "${q}"`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
}
