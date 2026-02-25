-- ENHANCE MARKETING DATA RELATIONSHIPS
-- 1. Add project_id to services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE
SET NULL;
-- 2. Add project_id and service_id to tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE
SET NULL,
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE
SET NULL;
-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_services_project_id ON public.services(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_service_id ON public.tasks(service_id);
-- 4. Enable RLS or update policies if necessary (assuming "Allow All" is already in place as per system setup)
-- If we were using fine-grained RLS, we'd add checks here.