-- ============================================================================
-- Migration 0007: Update RLS policies to support the Viewer role
--
-- This migration ensures that any active member (both Admins and Viewers)
-- can view dashboard metadata, events, photos, team assignments, and logs,
-- while write access (insert/update/delete) remains strictly restricted to
-- Core Committee members.
-- ============================================================================

-- Helper to check if the caller is an active club member (Admin or Viewer)
create or replace function is_active_member()
returns boolean as $$
  select exists (
    select 1 from members
    where auth_user_id = auth.uid() and status = 'active'
  );
$$ language sql stable security definer;

-- Drop old select policies
drop policy if exists "public read published events" on events;
drop policy if exists "public read published photos" on photos;
drop policy if exists "admin only members" on members;
drop policy if exists "admin only photography team" on event_photography_team;
drop policy if exists "admin only pp team" on event_post_processing_team;
drop policy if exists "admin only photography cc" on event_photography_core_committee;
drop policy if exists "admin only pp cc" on event_post_processing_core_committee;
drop policy if exists "admin only activity logs" on activity_logs;

-- Re-create select policies with is_active_member() for Viewers

-- EVENTS
create policy "select events" on events
  for select using (status = 'published' or is_active_member());

-- PHOTOS
create policy "select photos" on photos
  for select using (
    is_published = true
      and exists (select 1 from events e where e.id = event_id and e.status = 'published')
    or is_active_member()
  );

-- MEMBERS
create policy "select members" on members
  for select using (is_active_member());
create policy "write members" on members
  for all using (is_core_committee_member()) with check (is_core_committee_member());

-- TEAMS
create policy "select photography team" on event_photography_team
  for select using (is_active_member());
create policy "write photography team" on event_photography_team
  for all using (is_core_committee_member()) with check (is_core_committee_member());

create policy "select pp team" on event_post_processing_team
  for select using (is_active_member());
create policy "write pp team" on event_post_processing_team
  for all using (is_core_committee_member()) with check (is_core_committee_member());

create policy "select photography cc" on event_photography_core_committee
  for select using (is_active_member());
create policy "write photography cc" on event_photography_core_committee
  for all using (is_core_committee_member()) with check (is_core_committee_member());

create policy "select pp cc" on event_post_processing_core_committee
  for select using (is_active_member());
create policy "write pp cc" on event_post_processing_core_committee
  for all using (is_core_committee_member()) with check (is_core_committee_member());

-- ACTIVITY LOGS
create policy "select activity logs" on activity_logs
  for select using (is_active_member());
create policy "write activity logs" on activity_logs
  for all using (is_core_committee_member()) with check (is_core_committee_member());
