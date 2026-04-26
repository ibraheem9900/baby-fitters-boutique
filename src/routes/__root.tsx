import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-4">🍼</div>
        <h1 className="font-display text-5xl font-semibold text-foreground">404</h1>
        <h2 className="mt-3 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Baby Fitters — Soft, Safe & Sweet Baby Essentials" },
      { name: "description", content: "Premium baby garments, accessories, cosmetics, shoes and toys. Thoughtfully curated for your little one." },
      { property: "og:title", content: "Baby Fitters — Soft, Safe & Sweet Baby Essentials" },
      { property: "og:description", content: "Premium baby products. Soft fabrics, gentle care, and toys that spark joy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <CartProvider>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </CartProvider>
  );
}
