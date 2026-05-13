import type { CartItem } from "./cart";
import { formatPrice } from "./categories";

// WhatsApp business number (Pakistan): 0304 4844845 -> +92 304 4844845
export const WHATSAPP_NUMBER = "923044844845";
export const WHATSAPP_DISPLAY = "0304-4844845";
export const SUPPORT_EMAIL = "Babyfitters.online@gmail.com";

export function buildWhatsappCheckoutUrl(items: CartItem[], subtotal: number) {
  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`
  );
  const message = [
    "Hi Baby Fitters! I'd like to place an order:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(subtotal)}`,
    "",
    "Please confirm availability and delivery details. Thank you!",
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
