-- Enable RLS and add policies for loans
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization's loans" ON loans;
CREATE POLICY "Users can view their organization's loans" ON loans FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM users
            WHERE users.id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can manage their organization's loans" ON loans;
CREATE POLICY "Users can manage their organization's loans" ON loans FOR ALL USING (
    organization_id IN (
        SELECT organization_id
        FROM users
        WHERE users.id = auth.uid()
    )
);
-- Enable RLS and add policies for purchase_orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization's purchase_orders" ON purchase_orders;
CREATE POLICY "Users can view their organization's purchase_orders" ON purchase_orders FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM users
            WHERE users.id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can manage their organization's purchase_orders" ON purchase_orders;
CREATE POLICY "Users can manage their organization's purchase_orders" ON purchase_orders FOR ALL USING (
    organization_id IN (
        SELECT organization_id
        FROM users
        WHERE users.id = auth.uid()
    )
);