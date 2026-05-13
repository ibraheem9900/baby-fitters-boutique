import { useParams, useLocation } from "wouter";
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
import { supabase } from "@/integrations/supabase/client";

export function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, navigate] = useLocation();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const { add, setOpen } = useCart();

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    const channel = supabase
      .channel(`product-page-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products", filter: `id=eq.${id}` }, () => {
        fetchProducts().then(setProducts).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const product = products?.find((p) => p.id === id);
  const related = (products ?? []).filter((p) => p.category === product?.category && p.id !== id).slice(0, 4);

  const images = useMemo(() => (product ? productImages(product) : []), [product]);
  const variants = product?.variants ?? [];
  const sizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.size) set.add(v.size);
      if (Array.isArray(v.sizes)) v.sizes.forEach((s) => s && set.add(s));
    });
    return Array.from(set);
  }, [variants]);
  const colors = useMemo(() => {
    const map = new Map<string, { color: string; colorHex?: string }>();
    variants.forEach((v) => {
      if (v.color && !map.has(v.color)) map.set(v.color, { color: v.color, colorHex: v.colorHex });
    });
    return Array.from(map.values());
  }, [variants]);

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  }

  if (products === null) {
    return (
      <PageLayout>
        <div className="site-container py-12">
          <div className="w-24 h-5 skeleton rounded mb-6" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square skeleton rounded-3xl" />
            <div className="space-y-5 pt-4">
              <div className="skeleton h-5 w-1/4 rounded" />
              <div className="skeleton h-12 w-4/5 rounded" />
              <div className="skeleton h-8 w-1/3 rounded" />
              <div className="skeleton h-24 w-full rounded" />
              <div className="flex gap-2 mt-6">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-16 rounded-full" />)}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="site-container py-20 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <button onClick={goBack} className="text-primary mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </PageLayout>
    );
  }

  const finalPrice = discountedPrice(product);
  const hasDiscount = (product.discount_percent ?? 0) > 0;

  const handleAdd = () => {
    if (sizes.length && !selectedSize) { toast.error("Please select a size"); return; }
    if (colors.length && !selectedColor) { toast.error("Please select a color"); return; }
    const variantTag = [selectedSize, selectedColor].filter(Boolean).join(" / ");
    const cartId = variantTag ? `${product.id}::${variantTag}` : product.id;
    const cartName = variantTag ? `${product.name} — ${variantTag}` : product.name;
    add({ id: cartId, name: cartName, price: finalPrice, image_url: images[0] ?? product.image_url }, qty);
    toast.success(`${cartName} added to cart`, {
      action: { label: "View cart", onClick: () => setOpen(true) },
    });
  };

  return (
    <PageLayout>
      <SizeChartModal open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} productId={product.id} />
      <div className="site-container py-8">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <ImageGallery images={images} alt={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => navigate(`/category/${product.category}`)}
              className="inline-block text-xs uppercase tracking-widest text-primary font-bold mb-3 hover:underline"
            >
              {categoryLabel(product.category)}
            </button>
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
            <p className="mt-6 text-muted-foreground leading-relaxed text-[15px]">
              {product.description ?? "A soft, safe and sweet addition to your little one's collection. Made with care from premium materials."}
            </p>

            {sizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Size</p>
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        selectedSize === s
                          ? "bg-foreground text-background border-foreground scale-105"
                          : "bg-background border-border hover:bg-blush"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                  Color {selectedColor && <span className="text-foreground normal-case tracking-normal">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      title={c.color}
                      aria-label={c.color}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === c.color ? "border-foreground scale-110 shadow-pillow" : "border-border hover:scale-105"
                      }`}
                      style={{ background: c.colorHex || "#e5e7eb" }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow text-[15px]"
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
