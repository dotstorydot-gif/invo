-- ADVANCED PAYROLL ENGINE MIGRATION
-- 1. Ensure payroll_contracts exists
CREATE TABLE IF NOT EXISTS public.payroll_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    salary_template_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id)
);
-- 2. Enhance payroll_contracts
ALTER TABLE public.payroll_contracts
ADD COLUMN IF NOT EXISTS tasks TEXT,
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE
SET NULL,
    ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full Time',
    ADD COLUMN IF NOT EXISTS yearly_increase_percent NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS salary_history JSONB DEFAULT '[]'::JSONB;
-- 2. Create salary_items (Reusable components: VAT, Insurance, etc.)
CREATE TABLE IF NOT EXISTS public.salary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Addition',
    -- Addition, Deduction
    value_type TEXT NOT NULL DEFAULT 'Fixed',
    -- Fixed, Percentage
    value NUMERIC NOT NULL DEFAULT 0,
    is_recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Create salary_advances (Loans/Advances)
CREATE TABLE IF NOT EXISTS public.salary_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    -- Pending, Approved, Paid, Rejected
    request_date DATE DEFAULT CURRENT_DATE,
    repayment_start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Create salary_slips (Generated monthly breakdowns)
CREATE TABLE IF NOT EXISTS public.salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    register_id UUID NOT NULL REFERENCES public.salary_registers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    base_salary NUMERIC NOT NULL,
    gross_salary NUMERIC NOT NULL,
    net_salary NUMERIC NOT NULL,
    vat_amount NUMERIC DEFAULT 0,
    insurance_amount NUMERIC DEFAULT 0,
    transportation_amount NUMERIC DEFAULT 0,
    advances_deducted NUMERIC DEFAULT 0,
    penalties_deducted NUMERIC DEFAULT 0,
    breakdown JSONB DEFAULT '[]'::JSONB,
    -- Detailed list of all additions/deductions
    month_year TEXT NOT NULL,
    days_served INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE public.payroll_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON public.payroll_contracts;
CREATE POLICY "Allow All" ON public.payroll_contracts FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.salary_items;
CREATE POLICY "Allow All" ON public.salary_items FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.salary_advances;
CREATE POLICY "Allow All" ON public.salary_advances FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.salary_slips;
CREATE POLICY "Allow All" ON public.salary_slips FOR ALL USING (true);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_salary_items_org ON public.salary_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_staff ON public.salary_advances(staff_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_register ON public.salary_slips(register_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_staff ON public.salary_slips(staff_id);