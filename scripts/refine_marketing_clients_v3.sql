-- Add country column to customers table if not exists
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS country TEXT;
-- Ensure RLS is enabled and policies are permissive for MVP as requested earlier
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert" ON public.customers;
DROP POLICY IF EXISTS "Allow public update" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete" ON public.customers;
CREATE POLICY "Allow public read" ON public.customers FOR
SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.customers FOR
INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.customers FOR
UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.customers FOR DELETE USING (true);
-- Also ensure dotstory org is set correctly for testing if needed
-- UPDATE organizations SET module_type = 'Service & Marketing', subscription_plan = 'Platinum' WHERE name ILIKE '%dotstory%';