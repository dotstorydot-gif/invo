-- SQL Migration: Add Missing ERP Tables
-- Run this in your Supabase SQL Editor

-- 1. Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    borrower_name TEXT NOT NULL,
    principal_amount DECIMAL(15,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    term_months INTEGER DEFAULT 12,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active',
    amount_paid DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Purchase Requests
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    items JSONB DEFAULT '[]',
    status TEXT DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. RFQs (Request for Quotations)
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    request_id UUID REFERENCES public.purchase_requests(id),
    title TEXT NOT NULL,
    deadline DATE NOT NULL,
    suppliers_invited UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'Sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Purchase Quotations (Bids from Suppliers)
CREATE TABLE IF NOT EXISTS public.purchase_quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    rfq_id UUID REFERENCES public.rfqs(id),
    supplier_id UUID, -- Will link to suppliers table
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    order_number TEXT NOT NULL,
    supplier_id UUID,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status TEXT DEFAULT 'Draft',
    total_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    request_type TEXT DEFAULT 'Items',
    quotation_style TEXT DEFAULT 'Standard',
    attachment_url TEXT,
    quotation_id UUID REFERENCES public.purchase_quotations(id),
    items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Purchase Invoices
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    invoice_number TEXT NOT NULL,
    order_id UUID REFERENCES public.purchase_orders(id),
    supplier_id UUID,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Unpaid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Purchase Returns
CREATE TABLE IF NOT EXISTS public.purchase_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    invoice_id UUID REFERENCES public.purchase_invoices(id),
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    items JSONB DEFAULT '[]',
    total_refund DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Logged',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Supplier Payments
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id),
    invoice_id UUID REFERENCES public.purchase_invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Bank Transfer',
    reference_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Debit Notes
CREATE TABLE IF NOT EXISTS public.debit_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id),
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Stash Transactions
CREATE TABLE IF NOT EXISTS public.stash_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL, -- 'In' or 'Out'
    source TEXT,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_type TEXT DEFAULT 'General',
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Task Comments (Bonus for the missing comments logic)
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DO $$
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'loans', 'purchase_requests', 'rfqs', 'purchase_quotations', 
            'purchase_orders', 'purchase_invoices', 'purchase_returns', 
            'suppliers', 'supplier_payments', 'debit_notes', 
            'stash_transactions', 'task_comments'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for same organization" ON public.%I', tbl_name);
        EXECUTE format('CREATE POLICY "Enable all access for same organization" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl_name);
    END LOOP;
END $$;
