import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  const { name, contact, message, email = "", area = "" } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    res.status(422).json({ message: "Name is required." });
    return;
  }
  if (!contact || typeof contact !== "string" || contact.trim().length < 7) {
    res.status(422).json({ message: "A valid phone number is required." });
    return;
  }
  if (!message || typeof message !== "string" || message.trim().length < 5) {
    res.status(422).json({ message: "Message must be at least 5 characters." });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
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
    } catch {
    }
  }

  res.json({ ok: true, message: "Message received. We'll get back to you shortly." });
});

export default router;
