-- 1. Add module_type to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS module_type TEXT DEFAULT 'Real Estate';
-- 2. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC DEFAULT 0,
    pricing_type TEXT DEFAULT 'Fixed',
    status TEXT DEFAULT 'Active',
    category TEXT,
    -- Digital Development, Marketing, Design, Media, Subscriptions
    sub_category TEXT,
    -- e.g. Ecommerce, SEO, Flyer
    platforms JSONB DEFAULT '[]'::jsonb,
    -- ['Meta', 'TikTok']
    providers JSONB DEFAULT '[]'::jsonb,
    -- ['Hosting:Hostinger', 'Domain:GoDaddy']
    features JSONB DEFAULT '[]'::jsonb,
    -- ['10 Pages', 'Payment Gateway']
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serial_number TEXT,
    description TEXT,
    value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'In Use',
    -- In Use, Maintenance, Retired
    assigned_to_employee UUID REFERENCES public.staff(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.staff(id) ON DELETE
    SET NULL,
        status TEXT DEFAULT 'Todo',
        -- Todo, In Progress, Pending, Done
        due_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
-- 5. Task Comments
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Could be a Staff member or an Admin User
    user_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
-- Disable strict policies for MVP and rely on app-level isolation
DROP POLICY IF EXISTS "Allow All" ON public.services;
CREATE POLICY "Allow All" ON public.services FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.assets;
CREATE POLICY "Allow All" ON public.assets FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.tasks;
CREATE POLICY "Allow All" ON public.tasks FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow All" ON public.task_comments;
CREATE POLICY "Allow All" ON public.task_comments FOR ALL USING (true);