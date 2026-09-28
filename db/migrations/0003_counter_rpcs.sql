-- ============================================================================
-- Migration 0003: Counter RPCs
-- Public visitors need to increment view/download counts without gaining
-- general UPDATE rights on events/photos, so these run as SECURITY DEFINER
-- functions rather than opening up the RLS update policies.
-- ============================================================================

create or replace function increment_event_views(p_event_id uuid)
returns void as $$
  update events set view_count = view_count + 1 where id = p_event_id;
$$ language sql security definer;

create or replace function increment_event_downloads(p_event_id uuid, p_count int default 1)
returns void as $$
  update events set download_count = download_count + p_count where id = p_event_id;
$$ language sql security definer;

create or replace function increment_photo_views(p_photo_id uuid)
returns void as $$
  update photos set view_count = view_count + 1 where id = p_photo_id;
$$ language sql security definer;

create or replace function increment_photo_downloads(p_photo_id uuid, p_count int default 1)
returns void as $$
  update photos set download_count = download_count + p_count where id = p_photo_id;
$$ language sql security definer;

revoke all on function increment_event_views(uuid) from public;
revoke all on function increment_event_downloads(uuid, int) from public;
revoke all on function increment_photo_views(uuid) from public;
revoke all on function increment_photo_downloads(uuid, int) from public;

grant execute on function increment_event_views(uuid) to anon, authenticated;
grant execute on function increment_event_downloads(uuid, int) to anon, authenticated;
grant execute on function increment_photo_views(uuid) to anon, authenticated;
grant execute on function increment_photo_downloads(uuid, int) to anon, authenticated;
