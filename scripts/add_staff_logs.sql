-- STAFF LOGGING SYSTEM
-- 1. Create staff_penalties table
CREATE TABLE IF NOT EXISTS public.staff_penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    reason TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Create staff_vacations table
CREATE TABLE IF NOT EXISTS public.staff_vacations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Enable RLS and public access
ALTER TABLE public.staff_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_vacations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all public" ON public.staff_penalties;
CREATE POLICY "Allow all public" ON public.staff_penalties FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all public" ON public.staff_vacations;
CREATE POLICY "Allow all public" ON public.staff_vacations FOR ALL USING (true) WITH CHECK (true);