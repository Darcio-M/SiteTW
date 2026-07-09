-- 1. Create the products table
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  "minQuantity" integer DEFAULT 1,
  "wholesalePrice" numeric,
  "wholesaleMinQuantity" integer,
  category text,
  weight numeric,
  "imageUrl" text,
  "imageUrls" jsonb DEFAULT '[]'::jsonb,
  featured boolean DEFAULT false,
  "bestSeller" boolean DEFAULT false,
  "createdAt" bigint NOT NULL,
  sizes jsonb DEFAULT '[]'::jsonb,
  "orderIndex" integer
);

-- 2. Create the categories table
CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL
);

-- 3. Create the admins table
CREATE TABLE public.admins (
  email text PRIMARY KEY
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on admins" ON public.admins FOR SELECT USING (true);

-- Allow authenticated users to perform all actions
CREATE POLICY "Allow auth all on products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on admins" ON public.admins FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage setup
-- Create a public storage bucket named "product-images"
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

