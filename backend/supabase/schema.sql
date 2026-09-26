CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Remote',
    work_model TEXT NOT NULL CHECK (work_model IN ('remote', 'hybrid', 'onsite')) DEFAULT 'remote',
    salary_min INTEGER,
    salary_max INTEGER,
    job_url TEXT,
    application_deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'ghosted', 'withdrawn')) DEFAULT 'saved',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_deadline ON public.jobs (user_id, application_deadline ASC);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Denormalised from jobs.user_id so RLS can filter without joining jobs.
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Resume', 'Cover_Letter', 'Coding_Challenge', 'System_Design', 'Behavioral', 'Take_Home', 'Background_Check', 'Negotiation', 'Other')),
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'done')) DEFAULT 'not_started',
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_job ON public.tasks (job_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks (user_id, status);

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    role TEXT,
    relationship TEXT,
    email TEXT,
    linkedin_url TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts (user_id);

CREATE TABLE IF NOT EXISTS public.contact_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Denormalised from jobs.user_id so RLS can filter without joining jobs.
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_asked', 'asked', 'referred', 'confirmed')) DEFAULT 'not_asked',
    notes TEXT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- One referral record per contact/job pair; the API upserts against this constraint.
    CONSTRAINT unique_contact_job UNIQUE (contact_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_links_contact ON public.contact_links (contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_links_job ON public.contact_links (job_id);

-- RLS guards direct client access only. The API connects with the service-role key, which
-- bypasses these policies, so it must scope every query by user_id itself.
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.jobs
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contact links" ON public.contact_links
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contact links" ON public.contact_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contact links" ON public.contact_links
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contact links" ON public.contact_links
    FOR DELETE USING (auth.uid() = user_id);

-- Two functions rather than one: tasks track `updated_at`, contact_links track `last_updated`.
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION update_contact_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_contact_links_updated_at
BEFORE UPDATE ON public.contact_links
FOR EACH ROW EXECUTE FUNCTION update_contact_link_timestamp();
