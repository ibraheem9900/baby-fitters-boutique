import type { VercelRequest, VercelResponse } from "@vercel/node";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !emailRe.test(email.trim())) {
    return res.status(422).json({ message: "Please enter a valid email address." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal,resolution=ignore-duplicates",
        },
        body: JSON.stringify({
          email: email.trim(),
          discount_code: "BABY10",
          subscribed_at: new Date().toISOString(),
        }),
      });

      if (!supabaseResponse.ok) {
        const body = await supabaseResponse.text().catch(() => "");
        console.warn(`Supabase subscriber insert failed (${supabaseResponse.status}):`, body);
      }
    } catch (err) {
      console.warn("Could not reach Supabase for subscriber storage:", err);
    }
  }

  return res.json({ ok: true, emailSent: true });
}
