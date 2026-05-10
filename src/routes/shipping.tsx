import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { WHATSAPP_DISPLAY, SUPPORT_EMAIL, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
  head: () => ({
    meta: [
      { title: "Shipping Policy — Baby Fitters" },
      { name: "description", content: "Free shipping on orders above Rs. 3000 across Pakistan. Same-day dispatch before 11 AM PST." },
      { property: "og:title", content: "Shipping Policy — Baby Fitters" },
      { property: "og:description", content: "Fast, reliable delivery across Pakistan." },
    ],
  }),
});

function ShippingPage() {
  return (
    <PageLayout>
      <section className="gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="eyebrow">Policies</p>
            <h1 className="font-display text-5xl sm:text-6xl mt-2">Shipping Policy</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We aim to get your order to you as quickly and smoothly as possible.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto bg-card border border-border rounded-3xl shadow-pillow p-6 md:p-10 space-y-8"
          >
            <Item icon={<Truck className="w-5 h-5" />} title="Free shipping above Rs. 3,000">
              Orders above Rs. 3,000 qualify for free shipping. For orders below this amount, a minor shipping fee will be applied.
            </Item>
            <Item icon={<Clock className="w-5 h-5" />} title="Same-day dispatch before 11 AM">
              Orders placed before 11:00 AM (Pakistan Standard Time) are usually dispatched the same day. Orders placed after this time are shipped the next working day.
            </Item>
            <Item icon={<MapPin className="w-5 h-5" />} title="3–5 working days nationwide">
              Delivery typically takes 3–5 working days across Pakistan. During busy periods, including sales and holidays, it may take slightly longer.
            </Item>
            <Item icon={<MapPin className="w-5 h-5" />} title="Address accuracy">
              All orders are delivered to the address provided at checkout. Please ensure your details are correct to avoid delays.
            </Item>

            <div className="border-t border-border pt-8">
              <p className="font-semibold mb-3">Need help?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-blush hover:shadow-soft transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">WhatsApp</p>
                    <p className="font-semibold">{WHATSAPP_DISPLAY}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-sky hover:shadow-soft transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email</p>
                    <p className="font-semibold text-sm break-all">{SUPPORT_EMAIL}</p>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}

function Item({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-xl mb-1">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
