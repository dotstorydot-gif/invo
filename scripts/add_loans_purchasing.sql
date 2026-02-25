-- 1. Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    borrower_name VARCHAR(255) NOT NULL,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) DEFAULT 0,
    term_months INTEGER,
    start_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    -- Active, Paid Off, Defaulted
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- RLS for loans
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their organization's loans" ON loans FOR
-- SELECT USING (
--         organization_id IN (
--             SELECT organization_id
--             FROM users
--             WHERE users.id = auth.uid()
--         )
--     );
-- CREATE POLICY "Users can manage their organization's loans" ON loans FOR ALL USING (
--     organization_id IN (
--         SELECT organization_id
--         FROM users
--         WHERE users.id = auth.uid()
--     )
-- );
-- 2. Extend stash_transactions for linking
ALTER TABLE stash_transactions
ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50),
    -- 'Project', 'Loan', 'Salary', 'General'
ADD COLUMN IF NOT EXISTS reference_id UUID;
-- ID of the corresponding record
-- 3. Extend or create purchase_orders for Advanced Purchasing
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    order_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS request_type VARCHAR(100),
    -- e.g., 'Inventory', 'Office Supplies', 'Items'
ADD COLUMN IF NOT EXISTS quotation_style VARCHAR(100),
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS items JSONB;
-- Store JSON array of items {name, quantity, price, etc.}
-- Since `purchase_orders` is mostly used for advanced purchasing now, we make sure it has robust RLS
-- (Assuming RLS is already basically enabled from before, but reinforcing it)
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
-- Note: We assume that the `expenses` table already exists and is robust. 
-- When a purchase order is marked paid, the application will handle the logic to insert a row into `expenses`.
-- Create missing enum values if necessary (PostgreSQL requires a bit more work for enums, 
-- but since we're using VARCHAR for types/statuses, the above is sufficient and flexible.)