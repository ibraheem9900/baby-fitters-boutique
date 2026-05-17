import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { WHATSAPP_DISPLAY, SUPPORT_EMAIL } from "@/lib/whatsapp";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  contact: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^\+?[\d\s\-()+]{7,20}$/, "Enter a valid phone number"),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(1000),
  email: z.string().trim().max(255).optional().or(z.literal("")),
  area: z.string().trim().max(100).optional().or(z.literal("")),
});

type Status = "idle" | "sending" | "success" | "error";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "", email: "", area: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          contact: parsed.data.contact,
          message: parsed.data.message,
          email: parsed.data.email ?? "",
          area: parsed.data.area ?? "",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          setErrors(json.errors);
          setStatus("idle");
          return;
        }
        throw new Error(json.message ?? "Something went wrong");
      }

      setStatus("success");
      setForm({ name: "", contact: "", message: "", email: "", area: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <PageLayout>
      <section className="gradient-soft">
        <div className="site-container py-16">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Get in touch</p>
            <h1 className="font-display text-5xl sm:text-6xl mt-2">Ask Questions</h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We're here to help — reach out about products, sizing, or anything else.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft overflow-hidden">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className="flex flex-col items-center justify-center text-center py-12 gap-5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-mint flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-700" />
                    </motion.div>
                    <div>
                      <h2 className="font-display text-3xl text-foreground">Message sent!</h2>
                      <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-[15px]">
                        We've received your inquiry and will get back to you shortly on WhatsApp or email.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus("idle")}
                      className="px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors text-sm"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="grid sm:grid-cols-2 gap-4"
                    noValidate
                  >
                    <Field label="Full Name *" error={errors.name}>
                      <input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={`cf-input ${errors.name ? "cf-input-error" : ""}`}
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </Field>

                    <Field label="Phone Number *" error={errors.contact}>
                      <input
                        value={form.contact}
                        onChange={(e) => update("contact", e.target.value)}
                        className={`cf-input ${errors.contact ? "cf-input-error" : ""}`}
                        placeholder="+92 300 0000000"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </Field>

                    <Field label="Email" error={errors.email}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={`cf-input ${errors.email ? "cf-input-error" : ""}`}
                        placeholder="you@example.com (optional)"
                        autoComplete="email"
                      />
                    </Field>

                    <Field label="City / Area" error={errors.area}>
                      <input
                        value={form.area}
                        onChange={(e) => update("area", e.target.value)}
                        className={`cf-input ${errors.area ? "cf-input-error" : ""}`}
                        placeholder="Your city or area (optional)"
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Message *" error={errors.message}>
                        <textarea
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                          rows={5}
                          className={`cf-input resize-none ${errors.message ? "cf-input-error" : ""}`}
                          placeholder="How can we help? Ask about products, sizing, availability..."
                        />
                        <div className="flex justify-end mt-1">
                          <span className={`text-[11px] ${form.message.length > 900 ? "text-destructive" : "text-muted-foreground"}`}>
                            {form.message.length}/1000
                          </span>
                        </div>
                      </Field>
                    </div>

                    {status === "error" && (
                      <div className="sm:col-span-2 flex items-start gap-2 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{errorMsg || "Something went wrong. Please try again."}</span>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-foreground text-background font-semibold hover:bg-primary transition-colors shadow-pillow disabled:opacity-60 text-[15px]"
                      >
                        {status === "sending" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send message
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-xs text-muted-foreground">
                        We typically reply within a few hours via WhatsApp or email.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <InfoCard
                icon={<Phone className="w-5 h-5" />}
                title="WhatsApp"
                lines={[WHATSAPP_DISPLAY]}
                sub="Available daily, 9 AM – 9 PM"
              />
              <InfoCard
                icon={<Mail className="w-5 h-5" />}
                title="Email"
                lines={[SUPPORT_EMAIL]}
              />
              <InfoCard
                icon={<MapPin className="w-5 h-5" />}
                title="Location"
                lines={["Pakistan"]}
                sub="Delivering nationwide"
              />
              <div className="bg-blush/40 rounded-2xl p-5 border border-border">
                <p className="text-sm font-semibold mb-1">Response time</p>
                <p className="text-sm text-muted-foreground">
                  We aim to reply to all inquiries within a few hours during business hours.
                </p>
              </div>
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
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .cf-input::placeholder { color: var(--color-muted-foreground); }
        .cf-input:focus { outline: none; box-shadow: 0 0 0 2px var(--color-ring); border-color: transparent; }
        .cf-input-error { border-color: var(--color-destructive); }
        .cf-input-error:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-destructive) 30%, transparent); }
      `}</style>
    </PageLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-destructive mt-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </span>
      )}
    </label>
  );
}

function InfoCard({ icon, title, lines, sub }: { icon: React.ReactNode; title: string; lines: string[]; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
        {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
