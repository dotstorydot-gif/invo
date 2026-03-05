-- Migration: Add JSONB items column to quotations and sales_invoices for multi-line support (BOQ)
-- This allows professional itemization of work, materials, and services.
-- 1. Add items column to quotations
ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
-- 2. Add items column to sales_invoices
ALTER TABLE public.sales_invoices
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
-- 3. Backfill amount if needed (usually amount is already there, but we ensure consistency later via app logic)
-- No destructive changes.
COMMENT ON COLUMN public.quotations.items IS 'List of line items {name, description, quantity, unit_price, total_price}';
COMMENT ON COLUMN public.sales_invoices.items IS 'List of line items {name, description, quantity, unit_price, total_price}';