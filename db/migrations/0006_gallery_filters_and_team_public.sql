-- ============================================================================
-- Migration 0006: Gallery filters & public event-team lookup (Sprint 4)
--
-- Sprint 4 adds two public-facing capabilities that the existing schema
-- can't support yet:
--
--   1. Filtering events by "Organizing Club" and "Month" — `organizing_club`
--      didn't exist as a column, and filtering by calendar month (regardless
--      of year) needs its own indexed column rather than a per-request
--      `extract(month from event_date)` scan.
--
--   2. Showing Photography Team / Post Processing Team / Core Committee
--      names on the public event details page. `members` and all four
--      team/committee junction tables are admin-only under RLS (see
--      migration 0001), so anonymous visitors can't read them directly.
--      Rather than loosening those policies (which would leak email/phone/
--      skills/status to the public), this adds a narrow SECURITY DEFINER
--      function that returns only {role, member_id, name, profile_photo_url,
--      position} for a given event, and only once that event is published
--      (or the caller is a core-committee member) — mirroring the pattern
--      already used for `increment_event_views` etc. in migration 0003.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Organizing Club filter
-- ----------------------------------------------------------------------------
alter table events add column if not exists organizing_club text;
create index if not exists idx_events_organizing_club on events(organizing_club);

comment on column events.organizing_club is
  'The club/department credited as organizer of the event (distinct from the '
  'academic department field and the free-text "category"/event-type field). '
  'Nullable — older events may not have this backfilled.';

-- ----------------------------------------------------------------------------
-- Month filter
-- Generated + stored so it's indexable and doesn't need extract() at query
-- time. Stays in sync automatically whenever event_date changes.
-- ----------------------------------------------------------------------------
alter table events add column if not exists event_month smallint
  generated always as (extract(month from event_date)::smallint) stored;

create index if not exists idx_events_month on events(event_month);

-- ----------------------------------------------------------------------------
-- Public, read-only team roster for the event details page.
-- Returns nothing for draft/archived events unless the caller is a
-- core-committee member (mirrors the "public read published events" policy).
-- ----------------------------------------------------------------------------
create or replace function get_event_team_public(p_event_id uuid)
returns table (
  role text,
  member_id uuid,
  name text,
  profile_photo_url text,
  "position" member_position
)
language sql
stable
security definer
set search_path = public
as $$
  select 'photography_team'::text, m.id, m.name, m.profile_photo_url, m."position"
  from event_photography_team ept
  join members m on m.id = ept.member_id
  where ept.event_id = p_event_id
    and exists (
      select 1 from events e
      where e.id = p_event_id and (e.status = 'published' or is_core_committee_member())
    )

  union all

  select 'post_processing_team'::text, m.id, m.name, m.profile_photo_url, m."position"
  from event_post_processing_team eppt
  join members m on m.id = eppt.member_id
  where eppt.event_id = p_event_id
    and exists (
      select 1 from events e
      where e.id = p_event_id and (e.status = 'published' or is_core_committee_member())
    )

  union all

  select 'photography_core_committee'::text, m.id, m.name, m.profile_photo_url, m."position"
  from event_photography_core_committee epcc
  join members m on m.id = epcc.member_id
  where epcc.event_id = p_event_id
    and exists (
      select 1 from events e
      where e.id = p_event_id and (e.status = 'published' or is_core_committee_member())
    )

  union all

  select 'post_processing_core_committee'::text, m.id, m.name, m.profile_photo_url, m."position"
  from event_post_processing_core_committee eppcc
  join members m on m.id = eppcc.member_id
  where eppcc.event_id = p_event_id
    and exists (
      select 1 from events e
      where e.id = p_event_id and (e.status = 'published' or is_core_committee_member())
    );
$$;

revoke all on function get_event_team_public(uuid) from public;
grant execute on function get_event_team_public(uuid) to anon, authenticated;
