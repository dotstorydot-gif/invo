-- ADVANCED ERP & MARKETING FEATURES (PHASE 2)
-- 1. Staff Enhancement: Add hire_date
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS hire_date DATE;
-- 2. Salary Enhancement: Partial payments and status tracking
CREATE TABLE IF NOT EXISTS public.salary_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL,
    base_pay NUMERIC NOT NULL DEFAULT 0,
    commissions NUMERIC DEFAULT 0,
    advances_deductions NUMERIC DEFAULT 0,
    net_pay NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Ensure paid_amount exists and status is up to date
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'salary_registers'
        AND column_name = 'paid_amount'
) THEN
ALTER TABLE public.salary_registers
ADD COLUMN paid_amount NUMERIC DEFAULT 0;
END IF;
END $$;
-- 3. Project Enhancement: Billing, Terms, and Duration
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS billing_cycle TEXT,
    -- Monthly, Yearly, One-time
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;
-- 4. Quotations System [NEW]
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.customers(id) ON DELETE
    SET NULL,
        project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        -- Draft, Sent, Accepted, Rejected
        is_recurring BOOLEAN DEFAULT false,
        billing_cycle TEXT,
        -- Monthly, Yearly
        payment_terms TEXT,
        valid_until DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS for quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON public.quotations;
CREATE POLICY "Allow All" ON public.quotations FOR ALL USING (true);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotations_org_id ON public.quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON public.quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON public.quotations(project_id);