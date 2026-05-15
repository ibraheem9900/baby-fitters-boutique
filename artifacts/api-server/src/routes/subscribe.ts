import { Router, type IRouter } from "express";

const router: IRouter = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BABY10-${code}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function sendEmail(to: string, code: string): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return false;

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? "587"),
      secure: false,
      auth: { user, pass },
    });

    const from = process.env.SMTP_FROM ?? `Baby Fitters <${user}>`;
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff8f5;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:24px;padding:40px;border:1px solid #f5e6e0;">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:32px;margin:0;">🌸</p>
      <h1 style="font-size:26px;color:#1a1a1a;margin:12px 0 4px;">Welcome to Baby Fitters!</h1>
      <p style="color:#888;font-size:15px;margin:0;">Your exclusive discount code is ready</p>
    </div>
    <div style="background:#fff0f7;border:2px dashed #f9a8d4;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;color:#be185d;font-weight:600;letter-spacing:2px;margin:0 0 8px;">YOUR 10% OFF CODE</p>
      <p style="font-size:32px;font-weight:900;color:#9d174d;letter-spacing:6px;margin:0;">${code}</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;text-align:center;margin-bottom:24px;">
      Use this code at checkout to get <strong>10% off</strong> your first order.<br>
      Valid for <strong>30 days</strong> from today.
    </p>
    <div style="text-align:center;">
      <a href="https://babyfitters.online" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;">Shop Now →</a>
    </div>
    <hr style="border:none;border-top:1px solid #f5e6e0;margin:28px 0;">
    <p style="color:#bbb;font-size:12px;text-align:center;margin:0;">
      © 2026 Baby Fitters · Pakistan · <a href="mailto:Babyfitters.online@gmail.com" style="color:#bbb;">Babyfitters.online@gmail.com</a>
    </p>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from,
      to,
      subject: "Your Baby Fitters 10% discount code 🌸",
      html,
      text: `Welcome to Baby Fitters! Your 10% off code is: ${code}. Use it at checkout. Valid for 30 days.`,
    });
    return true;
  } catch {
    return false;
  }
}

router.post("/subscribe", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || !isValidEmail(email)) {
    res.status(422).json({ success: false, message: "Please enter a valid email address." });
    return;
  }

  const code = generateCode();
  const emailSent = await sendEmail(email.trim().toLowerCase(), code);

  res.json({ success: true, code, emailSent });
});

export default router;
