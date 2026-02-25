-- Fix RLS for customers table to allow upsert correctly
DROP POLICY IF EXISTS "Allow public read" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert" ON public.customers;
DROP POLICY IF EXISTS "Allow public update" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete" ON public.customers;
-- Create an ALL policy like the one used for other tables
CREATE POLICY "Allow all public" ON public.customers FOR ALL USING (true) WITH CHECK (true);