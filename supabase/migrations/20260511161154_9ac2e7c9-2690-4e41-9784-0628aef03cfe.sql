
CREATE TABLE public.category_images (
  slug TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.category_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view category images"
  ON public.category_images FOR SELECT USING (true);

CREATE POLICY "Anyone can insert category images"
  ON public.category_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update category images"
  ON public.category_images FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete category images"
  ON public.category_images FOR DELETE USING (true);

CREATE TRIGGER set_category_images_updated_at
  BEFORE UPDATE ON public.category_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.category_images;
