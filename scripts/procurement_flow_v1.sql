-- COMPREHENSIVE PROCUREMENT FLOW (PHASE 3)
-- 1. Purchase Requests (Early stage requests for materials/office items)
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES auth.users(id),
    -- Admin/Staff who requested
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    -- Low, Medium, High
    status TEXT DEFAULT 'Draft',
    -- Draft, Submitted, Approved, Rejected, Fulfilled
    items JSONB DEFAULT '[]'::JSONB,
    -- [{name, qty, unit, estimated_price}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. RFQs (Request for Quotations - Compare multiple suppliers)
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.purchase_requests(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        deadline DATE,
        status TEXT DEFAULT 'Sent',
        -- Sent, Comparing, Closed
        suppliers_invited UUID [] DEFAULT '{}'::UUID [],
        -- Array of supplier IDs
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Purchase Quotations (Actual quotes received from suppliers)
CREATE TABLE IF NOT EXISTS public.purchase_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    status TEXT DEFAULT 'Pending',
    -- Pending, Accepted, Rejected
    quote_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    items JSONB DEFAULT '[]'::JSONB,
    -- [{name, qty, unit, unit_price}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Enhance Purchase Orders to link with Quotations
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'purchase_orders'
        AND column_name = 'quotation_id'
) THEN
ALTER TABLE public.purchase_orders
ADD COLUMN quotation_id UUID REFERENCES public.purchase_quotations(id) ON DELETE
SET NULL;
END IF;
END $$;
-- 5. Purchase Invoices (Bill from supplier after PO approval/delivery)
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    invoice_no TEXT,
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Unpaid',
    -- Unpaid, Partially Paid, Paid, Overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 6. Purchase Returns (Returning materials to supplier)
CREATE TABLE IF NOT EXISTS public.purchase_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.purchase_invoices(id) ON DELETE
    SET NULL,
        supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
        reason TEXT,
        return_date DATE DEFAULT CURRENT_DATE,
        amount_to_refund NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        -- Pending, Completed, Refunded
        items JSONB DEFAULT '[]'::JSONB,
        -- [{inventory_id, name, qty, reason}]
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. RLS Enablement
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;
-- 8. Policies
CREATE POLICY "Purchase Requests Isolation" ON public.purchase_requests FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "RFQs Isolation" ON public.rfqs FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "Purchase Quotations Isolation" ON public.purchase_quotations FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "Purchase Invoices Isolation" ON public.purchase_invoices FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
CREATE POLICY "Purchase Returns Isolation" ON public.purchase_returns FOR ALL USING (organization_id = (auth.jwt()->>'orgId')::uuid);
-- 9. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_pr_org ON public.purchase_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfq_org ON public.rfqs(organization_id);
CREATE INDEX IF NOT EXISTS idx_pq_org ON public.purchase_quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_pi_org ON public.purchase_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_pret_org ON public.purchase_returns(organization_id);