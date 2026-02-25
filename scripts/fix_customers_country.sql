-- Fix missing country column in customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS country TEXT;
-- Ensure RLS is permissive for customers if not already
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON public.customers;
CREATE POLICY "Allow All" ON public.customers FOR ALL USING (true);