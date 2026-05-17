import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface ContactBody {
  name?: string;
  email?: string;
  contact?: string;
  area?: string;
  message?: string;
}

function validate(body: ContactBody): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = body.name?.trim() ?? "";
  const contact = body.contact?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "Name is too long";

  if (!contact) {
    errors.contact = "Phone number is required";
  } else if (!/^\+?[\d\s\-()]{7,20}$/.test(contact)) {
    errors.contact = "Enter a valid phone number";
  }

  if (!message) {
    errors.message = "Message is required";
  } else if (message.length < 5) {
    errors.message = "Message is too short (min 5 characters)";
  } else if (message.length > 1000) {
    errors.message = "Message is too long (max 1000 characters)";
  }

  return errors;
}

async function saveToSupabase(data: Required<ContactBody>): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  const res = await fetch(`${url}/rest/v1/contact_submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email || "",
      contact: data.contact,
      area: data.area || "",
      message: data.message,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${text}`);
  }
}

async function sendWhatsAppNotification(data: Required<ContactBody>): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient =
    process.env.WHATSAPP_RECIPIENT_NUMBER ?? "923044844845";

  if (!phoneNumberId || !accessToken) return false;

  const lines = [
    `🌸 *New Baby Fitters Inquiry*`,
    ``,
    `*Name:* ${data.name}`,
    `*Phone:* ${data.contact}`,
    data.email ? `*Email:* ${data.email}` : null,
    data.area ? `*Area:* ${data.area}` : null,
    ``,
    `*Message:*`,
    data.message,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: lines },
      }),
    },
  );

  return res.ok;
}

router.post("/contact", async (req, res) => {
  const body = req.body as ContactBody;
  const errors = validate(body);

  if (Object.keys(errors).length > 0) {
    res.status(422).json({ success: false, errors });
    return;
  }

  const data: Required<ContactBody> = {
    name: body.name!.trim(),
    email: body.email?.trim() ?? "",
    contact: body.contact!.trim(),
    area: body.area?.trim() ?? "",
    message: body.message!.trim(),
  };

  try {
    await saveToSupabase(data);
  } catch (err) {
    req.log.error({ err }, "Failed to save contact submission to Supabase");
    res.status(500).json({ success: false, message: "Failed to save your message. Please try again." });
    return;
  }

  let whatsappSent = false;
  try {
    whatsappSent = await sendWhatsAppNotification(data);
  } catch (err) {
    req.log.warn({ err }, "WhatsApp notification failed — submission still saved");
  }

  res.json({ success: true, whatsappSent });
});

export default router;
