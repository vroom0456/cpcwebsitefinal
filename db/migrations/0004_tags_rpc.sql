-- ============================================================================
-- Migration 0004: Tag usage RPC
-- ============================================================================

create or replace function increment_tag_usage(p_tag_id uuid)
returns void as $$
  update tags set usage_count = usage_count + 1 where id = p_tag_id;
$$ language sql security definer;

revoke all on function increment_tag_usage(uuid) from public;
grant execute on function increment_tag_usage(uuid) to authenticated;
