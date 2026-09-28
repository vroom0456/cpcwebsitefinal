-- ============================================================================
-- CPC Photography Club Management System
-- Migration 0001: Core schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type member_status as enum ('active', 'inactive', 'alumni');
create type member_position as enum ('senior_coordinator', 'junior_coordinator', 'member');
create type event_status as enum ('draft', 'published', 'archived');
create type activity_action as enum (
  'gallery_published', 'event_created', 'event_updated', 'event_deleted',
  'photos_synced', 'team_updated', 'core_committee_updated', 'cover_changed'
);

-- ----------------------------------------------------------------------------
-- MEMBERS
-- ----------------------------------------------------------------------------
create table members (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete set null, -- null until they have dashboard login
  name text not null,
  profile_photo_url text,
  department text,
  year text,
  email text unique,
  phone text,
  joined_club date,
  status member_status not null default 'active',
  skills text[] default '{}',
  "position" member_position not null default 'member',
  is_core_committee boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_members_status on members(status);
create index idx_members_core_committee on members(is_core_committee);

-- ----------------------------------------------------------------------------
-- EVENTS
-- ----------------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  category text,
  department text,
  venue text,
  academic_year text, -- e.g. "2025-26"
  event_date date,
  cover_photo_url text,
  status event_status not null default 'draft',
  drive_folder_id text, -- Google Drive folder id (source of truth for photos)
  drive_last_synced_at timestamptz,
  storage_bytes bigint not null default 0,
  photo_count int not null default 0,
  view_count int not null default 0,
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_status on events(status);
create index idx_events_academic_year on events(academic_year);
create index idx_events_department on events(department);
create index idx_events_slug on events(slug);

-- ----------------------------------------------------------------------------
-- EVENT <-> TEAM ASSIGNMENTS
-- Four distinct, non-overlapping-in-purpose junction tables so that
-- core committee leadership is never mixed with general team members.
-- ----------------------------------------------------------------------------
create table event_photography_team (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create table event_post_processing_team (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create table event_photography_core_committee (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create table event_post_processing_core_committee (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create index idx_ept_member on event_photography_team(member_id);
create index idx_eppt_member on event_post_processing_team(member_id);
create index idx_epcc_member on event_photography_core_committee(member_id);
create index idx_eppcc_member on event_post_processing_core_committee(member_id);

-- ----------------------------------------------------------------------------
-- TAGS
-- ----------------------------------------------------------------------------
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

create table event_tags (
  event_id uuid not null references events(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (event_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- PHOTOS (metadata only — binaries live in Google Drive)
-- ----------------------------------------------------------------------------
create table photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  drive_file_id text not null,
  filename text not null,
  thumbnail_url text,
  full_url text,
  width int,
  height int,
  size_bytes bigint,
  camera_make text,
  camera_model text,
  lens text,
  taken_at timestamptz,
  exif jsonb,
  uploaded_by uuid references members(id) on delete set null,
  edited_by uuid references members(id) on delete set null,
  is_published boolean not null default true,
  is_cover boolean not null default false,
  view_count int not null default 0,
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, drive_file_id)
);

create index idx_photos_event on photos(event_id);
create index idx_photos_published on photos(is_published);
create index idx_photos_uploaded_by on photos(uploaded_by);
create index idx_photos_edited_by on photos(edited_by);

-- ----------------------------------------------------------------------------
-- ACTIVITY LOGS
-- ----------------------------------------------------------------------------
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  action activity_action not null,
  member_id uuid references members(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_activity_logs_event on activity_logs(event_id);
create index idx_activity_logs_created on activity_logs(created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_members_updated_at before update on members
  for each row execute function set_updated_at();
create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();
create trigger trg_photos_updated_at before update on photos
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public (anon) can only read published events/photos.
-- Authenticated core-committee members (via members.auth_user_id) get full access.
-- ----------------------------------------------------------------------------
alter table members enable row level security;
alter table events enable row level security;
alter table event_photography_team enable row level security;
alter table event_post_processing_team enable row level security;
alter table event_photography_core_committee enable row level security;
alter table event_post_processing_core_committee enable row level security;
alter table tags enable row level security;
alter table event_tags enable row level security;
alter table photos enable row level security;
alter table activity_logs enable row level security;

create or replace function is_core_committee_member()
returns boolean as $$
  select exists (
    select 1 from members
    where auth_user_id = auth.uid() and is_core_committee = true and status = 'active'
  );
$$ language sql stable security definer;

-- Public read: only published events / published photos on published events
create policy "public read published events" on events
  for select using (status = 'published' or is_core_committee_member());

create policy "public read published photos" on photos
  for select using (
    is_published = true
      and exists (select 1 from events e where e.id = event_id and e.status = 'published')
    or is_core_committee_member()
  );

create policy "public read tags" on tags for select using (true);
create policy "public read event_tags" on event_tags for select using (true);

-- Everything else (members, team assignments, core committee, logs) is admin-only
create policy "admin only members" on members
  for all using (is_core_committee_member()) with check (is_core_committee_member());
create policy "admin write events" on events
  for insert with check (is_core_committee_member());
create policy "admin update events" on events
  for update using (is_core_committee_member());
create policy "admin delete events" on events
  for delete using (is_core_committee_member());
create policy "admin only photography team" on event_photography_team
  for all using (is_core_committee_member()) with check (is_core_committee_member());
create policy "admin only pp team" on event_post_processing_team
  for all using (is_core_committee_member()) with check (is_core_committee_member());
create policy "admin only photography cc" on event_photography_core_committee
  for all using (is_core_committee_member()) with check (is_core_committee_member());
create policy "admin only pp cc" on event_post_processing_core_committee
  for all using (is_core_committee_member()) with check (is_core_committee_member());
create policy "admin write photos" on photos
  for insert with check (is_core_committee_member());
create policy "admin update photos" on photos
  for update using (is_core_committee_member());
create policy "admin delete photos" on photos
  for delete using (is_core_committee_member());
create policy "admin only activity logs" on activity_logs
  for all using (is_core_committee_member()) with check (is_core_committee_member());
