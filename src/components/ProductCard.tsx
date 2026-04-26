import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/categories";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, setOpen } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
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
        to="/product/$id"
        params={{ id: product.id }}
        className="group block relative bg-card rounded-3xl overflow-hidden border border-border hover:shadow-pillow transition-all duration-500 hover:-translate-y-1"
      >
        <div className="aspect-square bg-cream overflow-hidden relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-blush" />
          )}
          {(product.is_new_arrival || product.is_best_seller) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_new_arrival && (
                <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  New
                </span>
              )}
              {product.is_best_seller && (
                <span className="px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                  Bestseller
                </span>
              )}
            </div>
          )}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-pillow opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {product.description ?? "Soft, safe and sweet."}
          </p>
          <p className="font-display text-lg font-semibold mt-2">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-border">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded mt-2" />
      </div>
    </div>
  );
}
