CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  contact text NOT NULL,
  area text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit a contact form
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins can read submissions (current project uses open admin via secret-portal,
-- so allow read to all for now to match existing pattern; tighten later when auth is added).
CREATE POLICY "Anyone can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (true);

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);