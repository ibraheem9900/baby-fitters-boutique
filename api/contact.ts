import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, contact, message, email = "", area = "" } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return res.status(422).json({ message: "Name is required." });
  }
  if (!contact || typeof contact !== "string" || contact.trim().length < 7) {
    return res.status(422).json({ message: "A valid phone number is required." });
  }
  if (!message || typeof message !== "string" || message.trim().length < 5) {
    return res.status(422).json({ message: "Message must be at least 5 characters." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY is not set");
    return res.status(503).json({ message: "Server configuration error. Please try again later." });
  }

  let supabaseResponse: Response;
  try {
    supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        name: String(name).trim(),
        contact: String(contact).trim(),
        message: String(message).trim(),
        email: String(email).trim(),
        area: String(area).trim(),
      }),
    });
  } catch (err) {
    console.error("Failed to reach Supabase for contact submission:", err);
    return res.status(502).json({ message: "Could not save your message. Please try again." });
  }

  if (!supabaseResponse.ok) {
    const body = await supabaseResponse.text().catch(() => "");
    console.error(`Supabase rejected contact submission: ${supabaseResponse.status}`, body);
    return res.status(502).json({ message: "Could not save your message. Please try again." });
  }

  return res.json({ ok: true, message: "Message received. We'll get back to you shortly." });
}
