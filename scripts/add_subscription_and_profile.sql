-- 1. Add profile_picture to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_picture TEXT;
-- 2. Ensure organizations have the correct default plan structure
ALTER TABLE public.organizations
ALTER COLUMN subscription_plan
SET DEFAULT 'Platinum';