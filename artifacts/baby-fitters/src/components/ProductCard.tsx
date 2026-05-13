import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/categories";
import { discountedPrice, type Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, setOpen } = useCart();
  const finalPrice = discountedPrice(product);
  const hasDiscount = (product.discount_percent ?? 0) > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ id: product.id, name: product.name, price: finalPrice, image_url: product.image_url });
    toast.success(`${product.name} added to cart`, {
      action: { label: "View", onClick: () => setOpen(true) },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block relative"
      >
        <div className="aspect-[4/5] bg-cream overflow-hidden relative rounded-2xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-blush" />
          )}
          {(product.is_new_arrival || product.is_best_seller || hasDiscount) && (
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-foreground text-[10px] font-semibold uppercase tracking-[0.16em]">
                  −{product.discount_percent}%
                </span>
              )}
              {product.is_new_arrival && !hasDiscount && (
                <span className="px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-foreground text-[10px] font-semibold uppercase tracking-[0.16em]">
                  New
                </span>
              )}
              {product.is_best_seller && (
                <span className="px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Bestseller
                </span>
              )}
            </div>
          )}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 left-3 right-3 h-11 rounded-full bg-background/95 backdrop-blur text-foreground text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-foreground hover:text-background shadow-soft"
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4" /> Add to bag
          </button>
        </div>
        <div className="pt-4 px-1">
          <h3 className="text-[15px] font-medium text-foreground line-clamp-1 tracking-tight">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-[14px] text-foreground tracking-tight">{formatPrice(finalPrice)}</p>
            {hasDiscount && (
              <p className="text-[13px] text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] skeleton rounded-2xl" />
      <div className="pt-4 px-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
