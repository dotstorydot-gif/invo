-- Fix RLS for staff table to allow upsert correctly
-- This solves the "new row violates row-level security policy" error
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.staff;
DROP POLICY IF EXISTS "Allow public insert" ON public.staff;
DROP POLICY IF EXISTS "Allow public update" ON public.staff;
DROP POLICY IF EXISTS "Allow public delete" ON public.staff;
DROP POLICY IF EXISTS "Allow all public" ON public.staff;
-- Create an ALL policy that yields full control to the public/anon role (Dev/MVP mode)
CREATE POLICY "Allow all public" ON public.staff FOR ALL USING (true) WITH CHECK (true);