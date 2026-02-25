-- 1. Ensure 'customers' table exists with all required columns
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Ensure all columns exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customers'
        AND column_name = 'organization_id'
) THEN
ALTER TABLE public.customers
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customers'
        AND column_name = 'email'
) THEN
ALTER TABLE public.customers
ADD COLUMN email TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customers'
        AND column_name = 'address'
) THEN
ALTER TABLE public.customers
ADD COLUMN address TEXT;
END IF;
END $$;
-- 2. Create Client-Project Junction Table for "Multiple Projects" relationship
CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, project_id)
);
-- Enable RLS for client_projects
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON public.client_projects;
CREATE POLICY "Allow All" ON public.client_projects FOR ALL USING (true);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON public.client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_project_id ON public.client_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_org_id ON public.client_projects(organization_id);