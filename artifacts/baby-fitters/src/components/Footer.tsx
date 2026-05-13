import { Link } from "wouter";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SizeChartModal } from "./SizeChartModal";
import { WHATSAPP_DISPLAY, SUPPORT_EMAIL, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export function Footer() {
  const [sizeOpen, setSizeOpen] = useState(false);
  return (
    <footer className="mt-32 border-t border-border/60 bg-background">
      <SizeChartModal open={sizeOpen} onClose={() => setSizeOpen(false)} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="mb-6">
            <BrandLogo className="h-14 w-auto aspect-[16/9]" rounded="rounded-xl" />
          </div>
          <p className="text-muted-foreground max-w-md leading-relaxed text-[15px]">
            Thoughtfully curated baby essentials — soft fabrics, gentle care, and toys that spark joy. Made for the
            tiniest humans, designed for the parents who love them.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="link-underline hover:text-primary">
                WhatsApp · {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <a href={`mailto:${SUPPORT_EMAIL}`} className="link-underline hover:text-primary">{SUPPORT_EMAIL}</a>
            </li>
          </ul>
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
                <Link to={`/category/${c.slug}`} className="text-[14px] link-underline hover:text-primary transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow mb-5">Help</h4>
          <ul className="space-y-3">
            <li><Link to="/shipping" className="text-[14px] link-underline hover:text-primary transition-colors">Shipping Policy</Link></li>
            <li><Link to="/returns" className="text-[14px] link-underline hover:text-primary transition-colors">Return & Exchange</Link></li>
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
