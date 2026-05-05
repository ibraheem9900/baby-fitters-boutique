import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Heart, Ruler } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { ImageGallery } from "@/components/ImageGallery";
import { SizeChartModal } from "@/components/SizeChartModal";
import { categoryLabel, formatPrice } from "@/lib/categories";
import { fetchProducts, discountedPrice, productImages, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const { add, setOpen } = useCart();

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const product = products?.find((p) => p.id === id);
  const related = (products ?? []).filter((p) => p.category === product?.category && p.id !== id).slice(0, 4);

  if (products === null) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <Link to="/" className="text-primary mt-4 inline-block">← Go home</Link>
        </div>
      </PageLayout>
    );
  }

  const finalPrice = discountedPrice(product);
  const hasDiscount = (product.discount_percent ?? 0) > 0;

  const handleAdd = () => {
    add({ id: product.id, name: product.name, price: finalPrice, image_url: product.image_url }, qty);
    toast.success(`${product.name} added to cart`, {
      action: { label: "View cart", onClick: () => setOpen(true) },
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blush rounded-[3rem] rotate-2" />
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-cream shadow-pillow">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blush" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              to="/category/$slug"
              params={{ slug: product.category }}
              className="inline-block text-xs uppercase tracking-widest text-primary font-bold mb-3"
            >
              {categoryLabel(product.category)}
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <p className="font-display text-3xl">{formatPrice(finalPrice)}</p>
              {hasDiscount && (
                <>
                  <p className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</p>
                  <span className="px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                    -{product.discount_percent}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description ?? "A soft, safe and sweet addition to your little one's collection. Made with care from premium materials."}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to cart — {formatPrice(finalPrice * qty)}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col items-center text-center gap-1 p-4 rounded-2xl bg-muted">
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-semibold">Fast shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-4 rounded-2xl bg-muted">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-semibold">Skin-safe</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-4 rounded-2xl bg-muted">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-semibold">Made with love</span>
              </div>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl sm:text-4xl mb-8">You may also love</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
