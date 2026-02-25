ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'Monthly';