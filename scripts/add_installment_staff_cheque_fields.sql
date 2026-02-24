-- 0. CREATE MISSING TABLES IF THEY DONT EXIST YET
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    interest_rate NUMERIC DEFAULT 0,
    installments INTEGER NOT NULL,
    down_payment NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE
    SET NULL,
        customer_id UUID REFERENCES public.customers(id) ON DELETE
    SET NULL,
        total_amount NUMERIC NOT NULL,
        paid_amount NUMERIC DEFAULT 0,
        next_due_date DATE,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- We use DO blocks with EXECUTE to defer parsing and prevent "relation does not exist" planning errors in Supabase.
DO $$ BEGIN -- 1. INSTALLMENTS: Add Customer linking
EXECUTE 'ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL';
-- 2. SALES INVOICES: Add Installment Linking & Payment Methods
EXECUTE 'ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL';
EXECUTE 'ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT';
-- ''Cash'', ''Visa'', ''Cheque''
-- 3. CHEQUES: Add Customer & Invoice Linking
EXECUTE 'ALTER TABLE public.cheques ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL';
EXECUTE 'ALTER TABLE public.cheques ADD COLUMN IF NOT EXISTS sales_invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE SET NULL';
-- 4. STAFF: Add Employment Types & Daily Tracking
EXECUTE 'ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT ''Full Time''';
-- ''Full Time'', ''Part Time'', ''Temporary'', ''Daily''
EXECUTE 'ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS daily_rate NUMERIC DEFAULT 0';
END $$;