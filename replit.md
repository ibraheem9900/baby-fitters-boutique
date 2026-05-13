# Baby Fitters

A soft-pastel baby products e-commerce store for Pakistan, selling garments, accessories, footwear, cosmetics, and toys. Ported from Vercel/v0 (TanStack Start) to Replit pnpm monorepo (Vite + React + wouter).

## Run & Operate

- `pnpm --filter @workspace/baby-fitters run dev` — run the storefront (port from `$PORT`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, wouter (routing), Tailwind v4, framer-motion, sonner (toasts)
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Validation: Zod
- Build: Vite (dev + prod)

## Where things live

- `artifacts/baby-fitters/` — the entire storefront
  - `src/pages/` — all route-level page components (one file per route)
  - `src/components/` — shared UI components (Header, Footer, ProductCard, CartDrawer, etc.)
  - `src/lib/` — utilities: `categories.ts` (category config + formatPrice), `category-images.ts` (Supabase image overrides)
  - `src/integrations/supabase/` — Supabase client + auto-generated types
  - `src/context/CartContext.tsx` — global cart state
  - `src/assets/` — static images (hero, category thumbnails)
  - `index.html` — Google Fonts loaded here (Fraunces, Inter, Nunito)
  - `src/index.css` — Tailwind v4 theme, design tokens, animations

## Architecture decisions

- **wouter over TanStack Router** — lightweight (~2 KB), no file-based routing complexity, simpler `Link` API for a store of this size.
- **Supabase proxy pattern** — `supabase` export is a `Proxy` object; if env vars are missing it returns empty data instead of throwing, so the UI renders gracefully without credentials.
- **Google Fonts in `index.html`** — Tailwind v4 processes CSS before the browser can fetch `@import` URLs, so fonts must be in `<head>` not in CSS.
- **No API server** — all data fetching goes direct from the browser to Supabase using the anon key. The `api-server` artifact exists but is unused by the storefront.
- **Admin portal** — accessible at `/secret-portal`, password `babyfitters2026`, uses `sessionStorage` key `baby-fitters-admin-auth`.

## Product

- Home page with hero, featured products, category grid, testimonials
- Category / Subcategory browsing with filters (size, color, price)
- Product detail page with image gallery, size chart, add-to-cart
- Cart drawer (slide-out) with quantity management
- Search page with real-time filtering
- Sale / Deals page
- Contact form (submissions stored in Supabase `contact_submissions`)
- Shipping & Returns policy pages
- Secret admin portal for category image management

## User preferences

- Currency: Pakistani Rupees (Rs), formatted with `formatPrice(n)`
- Categories: `baby_garments`, `newborn_accessories`, `baby_cosmetics`, `baby_shoes`, `baby_toys`
- Design: soft pastel palette — blush, sky, mint, butter, cream; display font Fraunces

## Gotchas

- Always keep Google Fonts `<link>` tags in `index.html` — never `@import` them in CSS with Tailwind v4.
- Supabase client is a `Proxy` — safe to call even without env vars, returns empty data.
- wouter `Link` takes a plain string `to` prop, not an object with `params`. Build hrefs manually: `` `/category/${slug}` ``.
- `useParams<{slug: string}>()` from wouter for dynamic route segments.
- `VITE_` prefix required on all env vars used in browser code.

## Pointers

- Supabase tables: `products`, `category_images`, `contact_submissions`
- See `src/integrations/supabase/types.ts` for full DB schema types
- See the `pnpm-workspace` skill for workspace structure details
