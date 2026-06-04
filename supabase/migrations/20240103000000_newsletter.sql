-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their email)
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Super admins can view all subscribers
DROP POLICY IF EXISTS "Super admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Super admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'officialscolara@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Super admins can update (deactivate) subscribers
DROP POLICY IF EXISTS "Super admins can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Super admins can update subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'officialscolara@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Super admins can delete subscribers
DROP POLICY IF EXISTS "Super admins can delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Super admins can delete subscribers"
  ON public.newsletter_subscribers FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'officialscolara@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );
