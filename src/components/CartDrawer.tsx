import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/categories";
import { Link } from "@tanstack/react-router";
import { buildWhatsappCheckoutUrl } from "@/lib/whatsapp";
import brandMark from "@/assets/brand-mark.png";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, clear } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-pillow flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-display text-2xl font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
                  <div className="w-20 h-20 rounded-full bg-blush flex items-center justify-center overflow-hidden">
                    <img src={brandMark} alt="" width={64} height={64} className="w-16 h-16 object-contain" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold">Your cart is empty</p>
                    <p className="text-muted-foreground text-sm mt-1">Add some adorable goodies to get started.</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-4 p-3 rounded-2xl bg-card border border-border">
                      <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        {i.image_url ? (
                          <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <img src={brandMark} alt="" width={48} height={48} className="w-12 h-12 m-auto object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{i.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(i.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-muted rounded-full">
                            <button onClick={() => setQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                            <button onClick={() => setQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">You'll be redirected to WhatsApp to confirm your order.</p>
                <a
                  href={buildWhatsappCheckoutUrl(items, subtotal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="w-full block text-center py-3 rounded-full bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity shadow-pillow"
                >
                  Checkout via WhatsApp — {formatPrice(subtotal)}
                </a>
                <button onClick={clear} className="w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
                  Clear cart
                </button>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm text-muted-foreground hover:text-primary"
                >
                  ← Continue shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
