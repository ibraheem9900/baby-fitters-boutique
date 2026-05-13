import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, ChevronDown, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { NAV_GROUPS, slugifySub } from "@/lib/taxonomy";
import { BrandLogo } from "./BrandLogo";

export function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobile]);

  const isActive = (href: string) => location === href;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b transition-shadow ${scrolled ? "border-border/60 shadow-soft" : "border-transparent"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center group" aria-label="Baby Fitters home">
            <BrandLogo className="h-12 md:h-14 w-auto aspect-[16/9] group-hover:scale-[1.03] transition-transform" rounded="rounded-xl" />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" onMouseLeave={() => setOpenMenu(null)}>
            <Link
              to="/"
              className={`px-4 py-2 text-[13px] font-medium tracking-wide hover:text-primary transition-colors ${isActive("/") ? "text-primary" : ""}`}
            >
              Home
            </Link>

            {NAV_GROUPS.map((group) => {
              const isSale = group.slug === "sale";
              const href = isSale ? "/sale" : `/category/${group.slug}`;
              return (
                <div key={group.label} className="relative" onMouseEnter={() => setOpenMenu(group.label)}>
                  <Link
                    to={href}
                    className={`px-4 py-2 text-[13px] font-medium tracking-wide hover:text-primary transition-colors inline-flex items-center gap-1 ${isSale ? "text-primary" : ""}`}
                  >
                    {isSale && <Tag className="w-3.5 h-3.5" />}
                    {group.label}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Link>
                  <AnimatePresence>
                    {openMenu === group.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2 z-50"
                      >
                        <div
                          className="bg-card border border-border shadow-pillow rounded-2xl p-5 grid gap-4 min-w-[260px]"
                          style={{ gridTemplateColumns: `repeat(${group.columns.length}, minmax(160px, 1fr))` }}
                        >
                          {group.columns.map((col, ci) => (
                            <div key={ci}>
                              {col.heading && (
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{col.heading}</p>
                              )}
                              <ul className="space-y-1">
                                {col.items.map((item) => (
                                  <li key={item}>
                                    {isSale ? (
                                      <Link
                                        to={`/sale?sub=${encodeURIComponent(item)}`}
                                        onClick={() => setOpenMenu(null)}
                                        className="block px-2 py-1.5 rounded-lg text-sm hover:bg-blush hover:text-primary transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    ) : (
                                      <Link
                                        to={`/category/${group.slug}/${slugifySub(item)}`}
                                        onClick={() => setOpenMenu(null)}
                                        className="block px-2 py-1.5 rounded-lg text-sm hover:bg-blush hover:text-primary transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <Link
              to="/contact"
              className={`px-4 py-2 text-[13px] font-medium tracking-wide hover:text-primary transition-colors ${isActive("/contact") ? "text-primary" : ""}`}
            >
              Contact
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

        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {mobile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMobile(false)}
                  className="fixed inset-0 bg-foreground/50 backdrop-blur-md z-[100] lg:hidden"
                />
                <motion.nav
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed top-0 right-0 bottom-0 w-[86%] max-w-sm bg-background z-[101] lg:hidden shadow-pillow flex flex-col"
                >
                  <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                    <span className="font-display text-lg">Menu</span>
                    <button
                      onClick={() => setMobile(false)}
                      className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-3 px-3">
                    <Link to="/" onClick={() => setMobile(false)} className="block px-3 py-3 rounded-xl hover:bg-muted font-semibold">Home</Link>
                    {NAV_GROUPS.map((group) => (
                      <details key={group.label} className="group">
                        <summary className="px-3 py-3 rounded-xl hover:bg-muted font-semibold cursor-pointer flex items-center justify-between list-none">
                          <span className="flex items-center gap-2">
                            {group.slug === "sale" && <Tag className="w-4 h-4 text-primary" />}
                            {group.label}
                          </span>
                          <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="pl-4 pb-2 flex flex-col gap-0.5">
                          {group.columns.map((col, ci) => (
                            <div key={ci} className="mt-1">
                              {col.heading && <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{col.heading}</p>}
                              {col.items.map((item) => (
                                group.slug === "sale" ? (
                                  <Link
                                    key={item}
                                    to={`/sale?sub=${encodeURIComponent(item)}`}
                                    onClick={() => setMobile(false)}
                                    className="block px-3 py-2 rounded-lg text-sm hover:bg-muted"
                                  >
                                    {item}
                                  </Link>
                                ) : (
                                  <Link
                                    key={item}
                                    to={`/category/${group.slug}/${slugifySub(item)}`}
                                    onClick={() => setMobile(false)}
                                    className="block px-3 py-2 rounded-lg text-sm hover:bg-muted"
                                  >
                                    {item}
                                  </Link>
                                )
                              ))}
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                    <Link to="/contact" onClick={() => setMobile(false)} className="block px-3 py-3 rounded-xl hover:bg-muted font-semibold">Contact</Link>
                    <Link to="/search" onClick={() => setMobile(false)} className="block px-3 py-3 rounded-xl hover:bg-muted font-semibold">Search</Link>
                  </div>
                </motion.nav>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>
    </header>
  );
}
