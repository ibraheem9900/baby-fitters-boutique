import { Link } from "wouter";
import { useState } from "react";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SizeChartModal } from "./SizeChartModal";
import { WHATSAPP_DISPLAY, SUPPORT_EMAIL, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { NAV_GROUPS, slugifySub } from "@/lib/taxonomy";

export function Footer() {
  const [sizeOpen, setSizeOpen] = useState(false);
  return (
    <footer className="mt-32 border-t border-border/60 bg-background">
      <SizeChartModal open={sizeOpen} onClose={() => setSizeOpen(false)} />
      <div className="site-container py-20 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="mb-6 flex items-center gap-3">
            <BrandLogo className="h-12 w-12" rounded="rounded-xl" />
            <span className="font-display text-xl font-medium">Baby Fitters</span>
          </div>
          <p className="text-muted-foreground max-w-md leading-relaxed text-[15px]">
            Thoughtfully curated baby essentials — soft fabrics, gentle care, and toys that spark joy. Made for the
            tiniest humans, designed for the parents who love them.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="link-underline hover:text-primary">
                WhatsApp · {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
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

        <div className="md:col-span-5 md:col-start-6 grid grid-cols-2 gap-8">
          <div>
            <h4 className="eyebrow mb-5">Shop</h4>
            <ul className="space-y-3">
              {NAV_GROUPS.filter((g) => g.slug !== "sale").map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/category/${g.slug}`}
                    className="text-[14px] font-medium link-underline hover:text-primary transition-colors"
                  >
                    {g.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/sale" className="text-[14px] font-medium link-underline hover:text-primary transition-colors text-primary">
                  Sale / Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5">Help</h4>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-[14px] font-medium link-underline hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-[14px] font-medium link-underline hover:text-primary transition-colors">Return & Exchange</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setSizeOpen(true)}
                  className="text-[14px] font-medium link-underline hover:text-primary transition-colors text-left"
                >
                  Size Chart
                </button>
              </li>
              <li><Link to="/contact" className="text-[14px] font-medium link-underline hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/search" className="text-[14px] font-medium link-underline hover:text-primary transition-colors">Search Products</Link></li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-3 md:col-start-11">
          <h4 className="eyebrow mb-5">Browse</h4>
          <ul className="space-y-2">
            {NAV_GROUPS.filter((g) => g.slug !== "sale").flatMap((g) =>
              g.columns.flatMap((col, ci) =>
                col.items.slice(0, 2).map((item) => {
                  const genderSuffix = col.gender ? `?gender=${col.gender}` : "";
                  return (
                    <li key={`${g.slug}-${ci}-${item}`}>
                      <Link
                        to={`/category/${g.slug}/${slugifySub(item)}${genderSuffix}`}
                        className="text-[13px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  );
                })
              )
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="site-container py-6 text-[12px] tracking-wide text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Baby Fitters. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">Soft · Safe · Sweet</p>
        </div>
      </div>
    </footer>
  );
}
