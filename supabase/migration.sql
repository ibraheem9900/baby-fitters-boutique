-- ============================================================
-- Baby Fitters — Complete Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Project: wpqpgkbjsvrpqrlvmwoi
-- ============================================================

-- 1. ENUM TYPE
DO $$ BEGIN
  CREATE TYPE product_category AS ENUM (
    'baby_garments',
    'newborn_accessories',
    'baby_cosmetics',
    'baby_shoes',
    'baby_toys'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  category product_category NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  stock integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subcategory text,
  discount_percent integer DEFAULT 0,
  gender text,
  age_group text,
  images text[] DEFAULT '{}',
  variants jsonb DEFAULT '[]'
);

-- 3. CONTACT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  contact text NOT NULL,
  area text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. CATEGORY IMAGES TABLE
CREATE TABLE IF NOT EXISTS category_images (
  slug text PRIMARY KEY,
  image_url text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 5. ENABLE RLS ON ALL TABLES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_images ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES — products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  TO anon, authenticated
  USING (true);

-- 7. RLS POLICIES — contact_submissions
CREATE POLICY "Anyone can view contact submissions"
  ON contact_submissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 8. RLS POLICIES — category_images
CREATE POLICY "Anyone can view category images"
  ON category_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert category images"
  ON category_images FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update category images"
  ON category_images FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete category images"
  ON category_images FOR DELETE
  TO anon, authenticated
  USING (true);

-- 9. STORAGE BUCKET for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 10. STORAGE POLICIES — allow public read/write for product-images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Public can upload product images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public can update product images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Public can delete product images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- 11. UPDATED_AT trigger for products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 12. UPDATED_AT trigger for category_images
CREATE TRIGGER category_images_updated_at
  BEFORE UPDATE ON category_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
