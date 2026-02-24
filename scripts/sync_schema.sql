-- INVOICA SCHEMA SYNCHRONIZATION
-- Run this in the Supabase SQL Editor
-- 1. Create missing Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    cost_price NUMERIC DEFAULT 0,
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    stock_threshold NUMERIC DEFAULT 10,
    status TEXT DEFAULT 'In Stock',
    supplier TEXT,
    last_restocked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Enhance Expenses table
-- Add missing columns if they don't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'expenses'
        AND column_name = 'category'
) THEN
ALTER TABLE public.expenses
ADD COLUMN category TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'expenses'
        AND column_name = 'type'
) THEN
ALTER TABLE public.expenses
ADD COLUMN type TEXT DEFAULT 'Variable';
END IF;
-- Make organization_id optional if it exists and is NOT NULL
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'expenses'
        AND column_name = 'organization_id'
) THEN
ALTER TABLE public.expenses
ALTER COLUMN organization_id DROP NOT NULL;
END IF;
END $$;
-- 3. Enable RLS and set public access (for MVP/Dev)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.inventory FOR
SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.inventory FOR
INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.inventory FOR
UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.inventory FOR DELETE USING (true);