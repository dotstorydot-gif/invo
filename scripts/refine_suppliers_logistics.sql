-- SUPPPLIERS, LOGISTICS & DEBIT NOTES REFINEMENT
-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Link Inventory to Suppliers
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'supplier_id'
) THEN
ALTER TABLE public.inventory
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE
SET NULL;
END IF;
END $$;
-- 3. Supplier Payments Table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT,
    -- Cash, Bank, Cheque
    reference_no TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Debit Notes (Installments Support)
CREATE TABLE IF NOT EXISTS public.debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    num_installments INTEGER DEFAULT 1,
    description TEXT,
    status TEXT DEFAULT 'Active',
    -- Active, Completed, Cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.debit_note_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debit_note_id UUID REFERENCES public.debit_notes(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    -- Pending, Paid
    paid_at TIMESTAMPTZ,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. Staff Visibility Cleanup (Optional check for hidden data)
-- This logic ensures organization_id is always respected in queries, 
-- but we might want to see if there's any seed data for organization_id = NULL
-- that shows up for everyone.
-- DELETE FROM public.staff WHERE organization_id IS NULL; -- Uncomment if you suspect global leak
-- 6. Enable RLS for new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_note_installments ENABLE ROW LEVEL SECURITY;
-- 7. Policies
CREATE POLICY "Suppliers Org Isolation" ON public.suppliers FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "Supplier Payments Org Isolation" ON public.supplier_payments FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "Debit Notes Org Isolation" ON public.debit_notes FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
-- For installments, we link through debit_note_id which already check org isolation if we use proper JOINs or just add organization_id to installments too.
-- Adding organization_id to installments for easier RLS.
ALTER TABLE public.debit_note_installments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
CREATE POLICY "Debit Note Installments Org Isolation" ON public.debit_note_installments FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
-- 8. Existing policies check for staff
-- Make sure staff has org isolation
DROP POLICY IF EXISTS "Allow All" ON public.staff;
CREATE POLICY "Staff Org Isolation" ON public.staff FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);