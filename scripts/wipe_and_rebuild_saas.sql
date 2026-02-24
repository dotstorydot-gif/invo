-- ==========================================
-- SaaS INVOICA ERP: FULL WIPE & REBUILD
-- ==========================================
-- WARNING: THIS SCRIPT DROPS ALL EXISTING TABLES AND DATA.
-- 1. DROP ALL EXISTING TABLES
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.stash_transactions CASCADE;
DROP TABLE IF EXISTS public.installments CASCADE;
DROP TABLE IF EXISTS public.payment_plans CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.cheques CASCADE;
DROP TABLE IF EXISTS public.sales_invoices CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.salary_registers CASCADE;
DROP TABLE IF EXISTS public.payroll_contracts CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.rental_contracts CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
-- ==========================================
-- 2. CORE SaaS TABLES
-- ==========================================
-- Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    -- Optional: for custom tenant URLs
    subscription_status TEXT DEFAULT 'Trial',
    -- Trial, Active, Suspended
    subscription_plan TEXT DEFAULT 'Platinum',
    -- Platinum, Gold, Silver
    module_type TEXT DEFAULT 'Real Estate',
    -- Real Estate, Service & Marketing
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Users (Custom Auth linked to Organizations)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Or references auth.uid() if using Supabase Auth later, but user wants custom (Org + User + Pass)
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    -- Will be handled by application hash logic
    role TEXT DEFAULT 'Staff',
    -- Superadmin, Admin, Staff
    full_name TEXT,
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, username)
);
-- ==========================================
-- 3. ERP MODULE TABLES (Multi-Tenant enabled)
-- ==========================================
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        type TEXT,
        -- Residential, Commercial, Rental Storage
        price NUMERIC NOT NULL,
        -- Could be monthly rate for rentals
        is_rental BOOLEAN DEFAULT false,
        -- New field for Rentals feature
        monthly_rent NUMERIC DEFAULT 0,
        daily_rent NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Available',
        -- Available, Rented, Sold, Maintenance
        consumer_name TEXT,
        photos TEXT [],
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Active Rental Leases
CREATE TABLE public.rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount NUMERIC NOT NULL,
    payment_frequency TEXT DEFAULT 'Monthly',
    deposit_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    -- Active, Expired, Terminated
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        unit TEXT,
        cost_price NUMERIC DEFAULT 0,
        quantity NUMERIC DEFAULT 0,
        stock_threshold NUMERIC DEFAULT 10,
        status TEXT DEFAULT 'In Stock',
        supplier TEXT,
        last_restocked DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        employment_type TEXT DEFAULT 'Full Time',
        base_salary NUMERIC DEFAULT 0,
        daily_rate NUMERIC DEFAULT 0,
        penalties NUMERIC DEFAULT 0,
        vacations NUMERIC DEFAULT 0,
        email TEXT,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC DEFAULT 0,
    pricing_type TEXT DEFAULT 'Fixed',
    status TEXT DEFAULT 'Active',
    category TEXT,
    sub_category TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    providers JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serial_number TEXT,
    description TEXT,
    value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'In Use',
    assigned_to_employee UUID REFERENCES public.staff(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.staff(id) ON DELETE
    SET NULL,
        status TEXT DEFAULT 'Todo',
        -- Todo, In Progress, Pending, Done
        due_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Tasks Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Could be a Staff member or an Admin User
    user_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        unit_id UUID REFERENCES public.units(id) ON DELETE
    SET NULL,
        branch_id UUID REFERENCES public.branches(id) ON DELETE
    SET NULL,
        category TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        attachment_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    installments_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.installments (
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
CREATE TABLE public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        customer_id UUID REFERENCES public.customers(id) ON DELETE
    SET NULL,
        unit_id UUID REFERENCES public.units(id) ON DELETE
    SET NULL,
        installment_id UUID REFERENCES public.installments(id) ON DELETE
    SET NULL,
        branch_id UUID REFERENCES public.branches(id) ON DELETE
    SET NULL,
        invoice_number TEXT,
        amount NUMERIC NOT NULL,
        status TEXT DEFAULT 'Pending',
        payment_method TEXT,
        due_date DATE,
        attachment_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- Construction Invoice Fields
        boq_reference TEXT,
        work_description TEXT,
        quantity NUMERIC DEFAULT 1,
        unit_price NUMERIC DEFAULT 0,
        vat_percentage NUMERIC DEFAULT 0,
        retention_percentage NUMERIC DEFAULT 0,
        payment_terms TEXT
);
CREATE TABLE public.cheques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        unit_id UUID REFERENCES public.units(id) ON DELETE
    SET NULL,
        customer_id UUID REFERENCES public.customers(id) ON DELETE
    SET NULL,
        sales_invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE
    SET NULL,
        cheque_number TEXT NOT NULL,
        bank_name TEXT,
        amount NUMERIC NOT NULL,
        due_date DATE,
        direction TEXT DEFAULT 'Incoming',
        entity_name TEXT,
        status TEXT DEFAULT 'Pending',
        attachment_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.stash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL DEFAULT 'In',
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
DO $$
DECLARE tbl_name text;
BEGIN FOR tbl_name IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE' LOOP EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;',
        tbl_name
    );
END LOOP;
END $$;
-- Since the user requested a completely custom Auth system bypassing Supabase native Auth (Org ID + Username + Password), 
-- our frontend will need to pass the `organization_id` cleanly.
-- For now, to allow the API to function before custom JWTs are enforced, we will allow 
-- standard access, BUT the backend logic will STRICTLY filter by the passed Org ID.
-- (For production, these would use current_setting('request.jwt.claims')::json->>'org_id')
DO $$
DECLARE tbl_name text;
BEGIN FOR tbl_name IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS "Allow All" ON public.%I;',
        tbl_name
    );
-- For MVP transition, we are relying on application-level filtering. 
-- Real RLS requires Supabase standard Auth tokens, but we are using custom tables.
EXECUTE format(
    'CREATE POLICY "Allow All" ON public.%I FOR ALL USING (true);',
    tbl_name
);
END LOOP;
END $$;
-- ==========================================
-- 5. SEED INITIAL SUPERADMIN & TEST ORG
-- ==========================================
-- Create the overarching Admin Org
INSERT INTO public.organizations (id, name, subscription_plan)
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'Invoica Master Admin',
        'Superadmin'
    );
-- Master Admin User (Password will be handled by front-end hash, placeholder here)
INSERT INTO public.users (
        organization_id,
        username,
        password_hash,
        role,
        full_name
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'superadmin',
        '123456',
        'Superadmin',
        'System Owner'
    );