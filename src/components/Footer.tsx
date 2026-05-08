import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Instagram, Facebook, Twitter } from "lucide-react";
import brandMark from "@/assets/brand-mark.png";
import { SizeChartModal } from "./SizeChartModal";

export function Footer() {
  const [sizeOpen, setSizeOpen] = useState(false);
  return (
    <footer className="mt-32 border-t border-border/60 bg-background">
      <SizeChartModal open={sizeOpen} onClose={() => setSizeOpen(false)} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-2xl bg-blush flex items-center justify-center overflow-hidden">
              <img src={brandMark} alt="Baby Fitters" width={32} height={32} className="w-7 h-7 object-contain" />
            </div>
            <span className="font-display text-[22px] font-medium tracking-tight">Baby Fitters</span>
          </div>
          <p className="text-muted-foreground max-w-md leading-relaxed text-[15px]">
            Thoughtfully curated baby essentials — soft fabrics, gentle care, and toys that spark joy. Made for the
            tiniest humans, designed for the parents who love them.
          </p>
          <div className="flex gap-2 mt-8">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <h4 className="eyebrow mb-5">Shop</h4>
          <ul className="space-y-3">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="text-[14px] link-underline hover:text-primary transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow mb-5">Help</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-[14px] link-underline hover:text-primary transition-colors">Shipping</a></li>
            <li><a href="#" className="text-[14px] link-underline hover:text-primary transition-colors">Returns</a></li>
            <li><button type="button" onClick={() => setSizeOpen(true)} className="text-[14px] link-underline hover:text-primary transition-colors">Size Chart</button></li>
            <li><Link to="/contact" className="text-[14px] link-underline hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[12px] tracking-wide text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Baby Fitters. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">Soft · Safe · Sweet</p>
        </div>
      </div>
    </footer>
  );
}
