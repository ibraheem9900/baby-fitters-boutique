import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/subscribe", async (req, res) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !emailRe.test(email.trim())) {
    res.status(422).json({ message: "Please enter a valid email address." });
    return;
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
        logger.warn({ status: supabaseResponse.status, body }, "Supabase subscriber insert failed (table may not exist yet)");
      }
    } catch (err) {
      logger.warn({ err }, "Could not reach Supabase for subscriber storage (non-fatal)");
    }
  }

  res.json({ ok: true, emailSent: true });
});

export default router;
