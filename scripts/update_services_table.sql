-- Adds new columns for the extended services module
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'Fixed';
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS providers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;