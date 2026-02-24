-- 1. Create a table for task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Could be a Staff member or an Admin User
    user_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Note: The `tasks` table's status is already just a TEXT column with a default of 'Todo'. 
-- We can enforce 'Pending' through the frontend without needing a DB migration.
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON public.task_comments;
CREATE POLICY "Allow All" ON public.task_comments FOR ALL USING (true);