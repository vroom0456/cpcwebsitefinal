-- ============================================================================
-- Migration 0008: Supabase Linter Fixes
-- Addresses warnings and errors from the Supabase Database Linter
-- ============================================================================

-- 1. Security Definer Views
-- Views by default execute with the permissions of the view creator.
-- Switching them to security_invoker = true makes them use the querying user's permissions,
-- which makes them respect our RLS policies properly.
alter view club_analytics set (security_invoker = true);
alter view event_analytics set (security_invoker = true);

-- 2. Function Search Path Mutable
-- Supabase warns against functions without a fixed search_path to prevent malicious path hijacking.
alter function set_updated_at() set search_path = '';
alter function increment_event_views(uuid) set search_path = '';
alter function increment_event_downloads(uuid, int) set search_path = '';
alter function increment_photo_views(uuid) set search_path = '';
alter function increment_photo_downloads(uuid, int) set search_path = '';
alter function increment_tag_usage(uuid) set search_path = '';
alter function is_core_committee_member() set search_path = '';
alter function is_active_member() set search_path = '';
-- (get_event_team_public already has set search_path = public)

-- 3. Public Can Execute SECURITY DEFINER Function (Internal Helpers)
-- By default, Postgres grants EXECUTE on new functions to PUBLIC.
-- We revoke this for internal helpers so they aren't exposed via the auto-generated REST API (/rest/v1/rpc/...).
revoke execute on function set_updated_at() from public;
revoke execute on function is_core_committee_member() from public;
revoke execute on function is_active_member() from public;
revoke execute on function rls_auto_enable() from public;

-- NOTE: The increment_* functions and get_event_team_public are INTENTIONALLY left accessible.
-- The Next.js app calls them via RPC (Supabase client). They MUST be SECURITY DEFINER
-- so that viewers can increment view counts without needing full UPDATE permissions on the tables.
-- The warnings for those specific functions can be safely ignored.
