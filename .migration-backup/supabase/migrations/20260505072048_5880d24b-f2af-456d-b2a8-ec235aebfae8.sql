-- Add multi-image gallery + variants support to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: copy single image_url into images[] when images is empty
UPDATE public.products
SET images = ARRAY[image_url]
WHERE (images IS NULL OR array_length(images, 1) IS NULL)
  AND image_url IS NOT NULL;