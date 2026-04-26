import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 gradient-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl gradient-hero flex items-center justify-center shadow-soft">
              <span>🧸</span>
            </div>
            <span className="font-display text-2xl font-semibold">Baby Fitters</span>
          </div>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Thoughtfully curated baby essentials — soft fabrics, gentle care, and toys that spark joy. Made for the
            tiniest humans, designed for the parents who love them.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Shop</h4>
          <ul className="space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Help</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Baby Fitters. Made with love.</p>
          <p>Soft pastel goodness for little ones.</p>
        </div>
      </div>
    </footer>
  );
}
