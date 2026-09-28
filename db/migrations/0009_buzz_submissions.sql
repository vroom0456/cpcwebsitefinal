-- ============================================================================
-- CPC Photography Club Management System
-- Migration 0009: Buzz Submissions Table
-- ============================================================================

create table if not exists buzz_submissions (
  id uuid primary key default uuid_generate_v4(),
  student_name text not null,
  roll_number text,
  instagram_handle text,
  email text,
  image_url text not null,
  caption text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table buzz_submissions enable row level security;

-- Create policies: Anyone can submit (insert), only authenticated admins/CC can view
create policy "Allow public inserts on buzz_submissions" 
  on buzz_submissions 
  for insert 
  with check (true);

create policy "Allow admins select on buzz_submissions"
  on buzz_submissions
  for select
  using (
    auth.role() = 'authenticated'
  );
