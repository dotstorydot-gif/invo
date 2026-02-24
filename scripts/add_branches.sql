-- Script to add Branches feature
-- Adds branches table and links it to expenses and invoices.
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS for branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
-- Delete policy for branches
DROP POLICY IF EXISTS "Enable read access for all users" ON public.branches;
CREATE POLICY "Enable read access for all users" ON public.branches FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.branches;
CREATE POLICY "Enable insert access for all users" ON public.branches FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON public.branches;
CREATE POLICY "Enable update access for all users" ON public.branches FOR
UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.branches;
CREATE POLICY "Enable delete access for all users" ON public.branches FOR DELETE USING (true);
-- Add branch_id to expenses and invoices
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE
SET NULL;
ALTER TABLE public.sales_invoices
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE
SET NULL;