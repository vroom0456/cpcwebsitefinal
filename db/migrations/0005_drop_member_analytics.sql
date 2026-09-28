-- ============================================================================
-- Migration 0005: Drop obsolete member analytics view
-- Member profiles no longer display analytics (photos uploaded, downloads,
-- views, rankings, etc). They now show plain event coverage lists
-- (Photography Coverage / Post Processing Coverage), which are read directly
-- from event_photography_team / event_post_processing_team — no view needed.
-- club_analytics and event_analytics are still used (dashboard + event edit
-- page) and are left untouched.
-- ============================================================================

drop view if exists member_analytics;
