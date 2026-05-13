import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RotateCcw, MessageCircle, Clock, Wallet, ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
  head: () => ({
    meta: [
      { title: "Return & Exchange Policy — Baby Fitters" },
      { name: "description", content: "One-month return and exchange policy at Baby Fitters. Easy WhatsApp-based process." },
      { property: "og:title", content: "Return & Exchange Policy — Baby Fitters" },
      { property: "og:description", content: "Hassle-free returns within 30 days." },
    ],
  }),
});

function ReturnsPage() {
  return (
    <PageLayout>
      <section className="gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="eyebrow">Policies</p>
            <h1 className="font-display text-5xl sm:text-6xl mt-2">Return & Exchange</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Baby Fitters offers a One Month return and exchange policy. Request an exchange or refund within a month of receiving your order — no explanation required.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto bg-card border border-border rounded-3xl shadow-pillow p-6 md:p-10 space-y-8"
          >
            <Item icon={<RotateCcw className="w-5 h-5" />} title="30-day return window">
              You can request an exchange or refund within a month of receiving your order without providing any explanation. (Both-side delivery charges will be borne by the customer.)
            </Item>
            <Item icon={<MessageCircle className="w-5 h-5" />} title="How to start a return">
              Contact our customer support team on WhatsApp at <strong>{WHATSAPP_DISPLAY}</strong>. Our team will guide you through a smooth return or exchange process.
            </Item>
            <Item icon={<Clock className="w-5 h-5" />} title="Processing time">
              Exchange or refund processing may take 3–10 business days.
            </Item>
            <Item icon={<Wallet className="w-5 h-5" />} title="Delivery charges">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Each-side delivery charge of <strong>Rs. 300</strong> applies for exchanges.</li>
                <li>If an order qualified for free shipping, the standard delivery charge of Rs. 300 will be deducted from the refund amount.</li>
                <li>In the event of an exchange or refund, Baby Fitters reserves the right to charge delivery fees for one or both sides of shipping.</li>
              </ul>
            </Item>

            <div className="border-t border-border pt-8 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Baby Fitters! I'd like to start a return / exchange.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow"
              >
                <MessageCircle className="w-4 h-4" /> Start a return on WhatsApp
              </a>
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
        <div className="text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
