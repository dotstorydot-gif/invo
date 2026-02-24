ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.cheques ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_url TEXT;
