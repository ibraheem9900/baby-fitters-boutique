
-- Categories enum
create type public.product_category as enum (
  'baby_garments',
  'newborn_accessories',
  'baby_cosmetics',
  'baby_shoes',
  'baby_toys'
);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category product_category not null,
  image_url text,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  stock integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products(category);
create index idx_products_created_at on public.products(created_at desc);

alter table public.products enable row level security;

-- Public read
create policy "Anyone can view products"
  on public.products for select
  using (true);

-- For now: allow anyone to insert/update/delete (admin panel is open).
-- TODO: restrict with auth + roles when auth is added.
create policy "Anyone can insert products"
  on public.products for insert
  with check (true);

create policy "Anyone can update products"
  on public.products for update
  using (true);

create policy "Anyone can delete products"
  on public.products for delete
  using (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Realtime
alter publication supabase_realtime add table public.products;

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Anyone can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "Anyone can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images');

create policy "Anyone can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images');
