-- Personalize Dashboard & Staff Avatars
-- 1. Add avatar_url to staff table
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
-- 2. Add logo_url to organizations table (for future brand customization)
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS logo_url TEXT;