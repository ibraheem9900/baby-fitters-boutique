import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact & Ask Questions — Baby Fitters" },
      { name: "description", content: "Get in touch with the Baby Fitters team. Ask product questions, request advice, or share feedback." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  contact: z.string().trim().min(7, "Enter a valid number").max(20),
  area: z.string().trim().min(1, "Area is required").max(100),
  message: z.string().trim().min(5, "Message too short").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", contact: "", area: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        contact: parsed.data.contact,
        area: parsed.data.area,
        message: parsed.data.message,
      });
      if (error) throw error;

      const text = encodeURIComponent(
        `New inquiry from Baby Fitters\n\nName: ${parsed.data.name}\nEmail: ${parsed.data.email}\nContact: ${parsed.data.contact}\nArea: ${parsed.data.area}\n\nMessage:\n${parsed.data.message}`,
      );
      window.open(`https://wa.me/923334844845?text=${text}`, "_blank");
      toast.success("Thanks! Your message has been saved and WhatsApp is opening.");
      setForm({ name: "", email: "", contact: "", area: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or message us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout>
      <section className="gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Get in touch</p>
            <h1 className="font-display text-5xl sm:text-6xl mt-2">Ask Questions</h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We're here to help — reach out about products, sizing, or anything else.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft">
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid sm:grid-cols-2 gap-4"
                noValidate
              >
                <Field label="Name" error={errors.name}>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} className="cf-input" placeholder="Your name" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="cf-input" placeholder="you@example.com" />
                </Field>
                <Field label="Contact Number" error={errors.contact}>
                  <input value={form.contact} onChange={(e) => update("contact", e.target.value)} className="cf-input" placeholder="+92 ..." />
                </Field>
                <Field label="Area" error={errors.area}>
                  <input value={form.area} onChange={(e) => update("area", e.target.value)} className="cf-input" placeholder="City / area" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message" error={errors.message}>
                    <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={5} className="cf-input" placeholder="How can we help?" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send message"}
                  </button>
                </div>
              </motion.form>
            </div>

            <div className="space-y-3">
              <InfoCard icon={<Phone className="w-5 h-5" />} title="WhatsApp" lines={["+92 333 4844845"]} />
              <InfoCard icon={<Mail className="w-5 h-5" />} title="Email" lines={["hello@babyfitters.pk"]} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} title="Location" lines={["Pakistan"]} />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .cf-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.875rem;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          font-size: 0.95rem;
          font-family: inherit;
          color: var(--color-foreground);
        }
        .cf-input:focus { outline: none; box-shadow: 0 0 0 2px var(--color-ring); }
      `}</style>
    </PageLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-destructive mt-1">{error}</span>}
    </label>
  );
}

function InfoCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-primary flex-shrink-0">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
      </div>
    </div>
  );
}
