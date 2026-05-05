import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X, ChevronDown, Tag } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { NAV_GROUPS, slugifySub } from "@/lib/taxonomy";
import brandMark from "@/assets/brand-mark.png";

export function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-blush flex items-center justify-center shadow-soft group-hover:rotate-6 transition-transform overflow-hidden">
              <img src={brandMark} alt="Baby Fitters" width={40} height={40} className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-none">
              <div className="font-display text-xl font-semibold text-foreground">Baby Fitters</div>
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Soft. Safe. Sweet.</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" onMouseLeave={() => setOpenMenu(null)}>
            <Link to="/" className="px-3 py-2 text-sm font-semibold hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
              Home
            </Link>

            {NAV_GROUPS.map((group) => {
              const isSale = group.slug === "sale";
              const to = isSale ? "/sale" : "/category/$slug";
              const params = isSale ? undefined : { slug: group.slug as string };
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(group.label)}
                >
                  <Link
                    to={to}
                    params={params as never}
                    className={`px-3 py-2 text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1 ${isSale ? "text-primary" : ""}`}
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
                        <div className="bg-card border border-border shadow-pillow rounded-2xl p-5 grid gap-4 min-w-[260px]" style={{ gridTemplateColumns: `repeat(${group.columns.length}, minmax(160px, 1fr))` }}>
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
                                        to="/sale"
                                        search={{ sub: item } as never}
                                        onClick={() => setOpenMenu(null)}
                                        className="block px-2 py-1.5 rounded-lg text-sm hover:bg-blush hover:text-primary transition-colors"
                                      >
                                        {item}
                                      </Link>
                                    ) : (
                                      <Link
                                        to="/category/$slug/$sub"
                                        params={{ slug: group.slug as string, sub: slugifySub(item) }}
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

            <Link to="/contact" className="px-3 py-2 text-sm font-semibold hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
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
                {NAV_GROUPS.map((group) => (
                  <details key={group.label} className="group">
                    <summary className="px-3 py-2 rounded-xl hover:bg-muted font-semibold cursor-pointer flex items-center justify-between">
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
                            <Link
                              key={item}
                              to={group.slug === "sale" ? "/sale" : "/category/$slug"}
                              params={group.slug === "sale" ? undefined : { slug: group.slug as string } as never}
                              search={{ sub: item } as never}
                              onClick={() => setMobile(false)}
                              className="block px-3 py-1.5 rounded-lg text-sm hover:bg-muted"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
                <Link to="/contact" onClick={() => setMobile(false)} className="px-3 py-2 rounded-xl hover:bg-muted font-semibold">Contact</Link>
                <Link to="/search" onClick={() => setMobile(false)} className="px-3 py-2 rounded-xl hover:bg-muted font-semibold">Search</Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
