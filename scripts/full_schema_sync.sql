-- INVOICA ERP SUPABASE SCHEMA
-- 1. Projects & Units
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    -- Residential, Commercial, etc.
    price NUMERIC NOT NULL,
    price_per_meter NUMERIC,
    rooms INTEGER,
    is_finished BOOLEAN DEFAULT false,
    facilities TEXT [],
    status TEXT DEFAULT 'Available',
    -- Available, Sold, Installments
    consumer_name TEXT,
    paid_amount NUMERIC DEFAULT 0,
    project_id UUID REFERENCES projects(id),
    salesperson_id UUID,
    -- References staff/users
    commission_amount NUMERIC DEFAULT 0,
    photos TEXT [],
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Suppliers & Purchasing
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id),
    type TEXT NOT NULL,
    -- Request, RFQ, Order, Invoice, Return
    status TEXT DEFAULT 'Pending',
    total_amount NUMERIC NOT NULL,
    items JSONB,
    -- List of items with quantity/price
    unit_id UUID REFERENCES units(id),
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Staff & Payroll
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    base_salary NUMERIC NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS payroll_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id),
    start_date DATE,
    end_date DATE,
    salary_template_id UUID,
    is_active BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS salary_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id),
    month_year TEXT NOT NULL,
    -- e.g., "02-2026"
    base_pay NUMERIC NOT NULL,
    commissions NUMERIC DEFAULT 0,
    advances_deductions NUMERIC DEFAULT 0,
    net_pay NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    -- Pending, Transferred
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Customers & Sales
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    unit_id UUID REFERENCES units(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    -- Pending, Paid, Draft
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. Cheques
CREATE TABLE IF NOT EXISTS cheques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheque_number TEXT NOT NULL,
    bank_name TEXT,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    direction TEXT NOT NULL,
    -- Incoming, Outgoing
    status TEXT DEFAULT 'Pending',
    -- Pending, Cashed, Bounced
    entity_name TEXT,
    -- Customer or Supplier name
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 6. Payment Plans & Installments
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    interest_rate NUMERIC NOT NULL,
    installments_count INTEGER NOT NULL,
    down_payment_percentage NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id),
    customer_id UUID REFERENCES customers(id),
    plan_id UUID REFERENCES payment_plans(id),
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    next_due_date DATE,
    status TEXT DEFAULT 'Pending',
    -- Pending, Collected, Overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. Cash Stash
CREATE TABLE IF NOT EXISTS stash_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL DEFAULT 'In',
    -- 'In' or 'Out'
    source TEXT NOT NULL,
    -- e.g., 'Manual Deposit', 'Gift', 'Expense', etc.
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 8. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    type TEXT,
    -- Fixed, Variable, Asset
    unit_id UUID REFERENCES units(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 9. Storage Buckets (Execute via Supabase Dashboard or API)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', true);
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
-- POLICIES SECTION

ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert" ON public.projects;
DROP POLICY IF EXISTS "Allow public update" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete" ON public.projects;

CREATE POLICY "Allow public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.projects FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.units;
DROP POLICY IF EXISTS "Allow public insert" ON public.units;
DROP POLICY IF EXISTS "Allow public update" ON public.units;
DROP POLICY IF EXISTS "Allow public delete" ON public.units;

CREATE POLICY "Allow public read" ON public.units FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.units FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public insert" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public update" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public delete" ON public.suppliers;

CREATE POLICY "Allow public read" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.suppliers FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.purchases;
DROP POLICY IF EXISTS "Allow public insert" ON public.purchases;
DROP POLICY IF EXISTS "Allow public update" ON public.purchases;
DROP POLICY IF EXISTS "Allow public delete" ON public.purchases;

CREATE POLICY "Allow public read" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.purchases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.purchases FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.staff;
DROP POLICY IF EXISTS "Allow public insert" ON public.staff;
DROP POLICY IF EXISTS "Allow public update" ON public.staff;
DROP POLICY IF EXISTS "Allow public delete" ON public.staff;

CREATE POLICY "Allow public read" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.staff FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.staff FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.payroll_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.payroll_contracts;
DROP POLICY IF EXISTS "Allow public insert" ON public.payroll_contracts;
DROP POLICY IF EXISTS "Allow public update" ON public.payroll_contracts;
DROP POLICY IF EXISTS "Allow public delete" ON public.payroll_contracts;

CREATE POLICY "Allow public read" ON public.payroll_contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.payroll_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.payroll_contracts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.payroll_contracts FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.salary_registers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.salary_registers;
DROP POLICY IF EXISTS "Allow public insert" ON public.salary_registers;
DROP POLICY IF EXISTS "Allow public update" ON public.salary_registers;
DROP POLICY IF EXISTS "Allow public delete" ON public.salary_registers;

CREATE POLICY "Allow public read" ON public.salary_registers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.salary_registers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.salary_registers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.salary_registers FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert" ON public.customers;
DROP POLICY IF EXISTS "Allow public update" ON public.customers;
DROP POLICY IF EXISTS "Allow public delete" ON public.customers;

CREATE POLICY "Allow public read" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.customers FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.sales_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.sales_invoices;
DROP POLICY IF EXISTS "Allow public insert" ON public.sales_invoices;
DROP POLICY IF EXISTS "Allow public update" ON public.sales_invoices;
DROP POLICY IF EXISTS "Allow public delete" ON public.sales_invoices;

CREATE POLICY "Allow public read" ON public.sales_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.sales_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.sales_invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.sales_invoices FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.cheques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.cheques;
DROP POLICY IF EXISTS "Allow public insert" ON public.cheques;
DROP POLICY IF EXISTS "Allow public update" ON public.cheques;
DROP POLICY IF EXISTS "Allow public delete" ON public.cheques;

CREATE POLICY "Allow public read" ON public.cheques FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.cheques FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.cheques FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.cheques FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.payment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.payment_plans;
DROP POLICY IF EXISTS "Allow public insert" ON public.payment_plans;
DROP POLICY IF EXISTS "Allow public update" ON public.payment_plans;
DROP POLICY IF EXISTS "Allow public delete" ON public.payment_plans;

CREATE POLICY "Allow public read" ON public.payment_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.payment_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.payment_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.payment_plans FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.installments;
DROP POLICY IF EXISTS "Allow public insert" ON public.installments;
DROP POLICY IF EXISTS "Allow public update" ON public.installments;
DROP POLICY IF EXISTS "Allow public delete" ON public.installments;

CREATE POLICY "Allow public read" ON public.installments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.installments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.installments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.installments FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.stash_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.stash_transactions;
DROP POLICY IF EXISTS "Allow public insert" ON public.stash_transactions;
DROP POLICY IF EXISTS "Allow public update" ON public.stash_transactions;
DROP POLICY IF EXISTS "Allow public delete" ON public.stash_transactions;

CREATE POLICY "Allow public read" ON public.stash_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.stash_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.stash_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.stash_transactions FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.expenses;
DROP POLICY IF EXISTS "Allow public insert" ON public.expenses;
DROP POLICY IF EXISTS "Allow public update" ON public.expenses;
DROP POLICY IF EXISTS "Allow public delete" ON public.expenses;

CREATE POLICY "Allow public read" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.expenses FOR DELETE USING (true);

ALTER TABLE IF EXISTS public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON public.inventory;
DROP POLICY IF EXISTS "Allow public insert" ON public.inventory;
DROP POLICY IF EXISTS "Allow public update" ON public.inventory;
DROP POLICY IF EXISTS "Allow public delete" ON public.inventory;

CREATE POLICY "Allow public read" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.inventory FOR DELETE USING (true);
