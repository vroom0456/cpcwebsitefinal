-- ============================================================================
-- Migration 0002: Analytics views
-- These power the admin Analytics tab. Kept as views (not materialized) for
-- simplicity at club scale (dozens of events, thousands of photos); revisit
-- as materialized views if the dataset grows large.
-- ============================================================================

-- Per-member contribution analytics
create or replace view member_analytics as
select
  m.id as member_id,
  m.name,
  m.position,
  m.is_core_committee,
  count(distinct ept.event_id) as events_assigned_photography,
  count(distinct eppt.event_id) as events_assigned_post_processing,
  count(distinct p_up.event_id) as events_covered,
  count(distinct p_up.id) as photos_uploaded,
  count(distinct p_up.id) filter (where p_up.is_published) as photos_published,
  count(distinct p_ed.event_id) as events_edited,
  coalesce(sum(p_up.download_count), 0) as downloads,
  coalesce(sum(p_up.view_count), 0) as views,
  m.joined_club,
  m.updated_at as last_active,
  count(distinct epcc.event_id) as events_managed_photography,
  count(distinct eppcc.event_id) as events_managed_post_processing
from members m
left join event_photography_team ept on ept.member_id = m.id
left join event_post_processing_team eppt on eppt.member_id = m.id
left join event_photography_core_committee epcc on epcc.member_id = m.id
left join event_post_processing_core_committee eppcc on eppcc.member_id = m.id
left join photos p_up on p_up.uploaded_by = m.id
left join photos p_ed on p_ed.edited_by = m.id
group by m.id;

-- Club-wide aggregate stats (single row)
create or replace view club_analytics as
select
  (select count(*) from events) as total_events,
  (select count(*) from photos) as total_photos,
  (select coalesce(sum(download_count), 0) from photos) as total_downloads,
  (select coalesce(sum(view_count), 0) from photos) as total_views,
  (select coalesce(sum(storage_bytes), 0) from events) as storage_used_bytes,
  (select count(*) from members where status = 'active') as active_members,
  (select count(*) from members where status = 'active' and is_core_committee) as active_core_committee;

-- Per-event analytics (mostly a passthrough + team rollups)
create or replace view event_analytics as
select
  e.id as event_id,
  e.title,
  e.photo_count as total_photos,
  e.view_count as total_views,
  e.download_count as total_downloads,
  e.storage_bytes,
  e.drive_last_synced_at as last_sync,
  e.created_at as upload_date,
  (select count(*) from event_photography_core_committee where event_id = e.id) as photography_cc_count,
  (select count(*) from event_photography_team where event_id = e.id) as photography_team_count,
  (select count(*) from event_post_processing_core_committee where event_id = e.id) as pp_cc_count,
  (select count(*) from event_post_processing_team where event_id = e.id) as pp_team_count
from events e;
