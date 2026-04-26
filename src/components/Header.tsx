import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/categories";

export function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl gradient-hero flex items-center justify-center shadow-soft group-hover:rotate-6 transition-transform">
              <span className="text-lg">🧸</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-xl font-semibold text-foreground">Baby Fitters</div>
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Soft. Safe. Sweet.</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
              Home
            </Link>
            {CATEGORIES.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="text-sm font-semibold hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {c.label}
              </Link>
            ))}
            <Link to="/admin" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setMobile((v) => !v)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {mobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobile && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="flex flex-col py-4 gap-1">
                <Link to="/" onClick={() => setMobile(false)} className="px-3 py-2 rounded-xl hover:bg-muted font-semibold">Home</Link>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setMobile(false)}
                    className="px-3 py-2 rounded-xl hover:bg-muted font-semibold flex items-center gap-2"
                  >
                    <span>{c.emoji}</span> {c.label}
                  </Link>
                ))}
                <Link to="/search" onClick={() => setMobile(false)} className="px-3 py-2 rounded-xl hover:bg-muted font-semibold">Search</Link>
                <Link to="/admin" onClick={() => setMobile(false)} className="px-3 py-2 rounded-xl hover:bg-muted font-semibold text-muted-foreground">Admin</Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
