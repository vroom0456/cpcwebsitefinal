-- ============================================================================
-- CBIT PHOTO CLUB — COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this entire SQL script into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active', 'inactive', 'alumni');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_position AS ENUM (
    'president', 'vice_president', 'general_secretary', 'joint_secretary',
    'events_head', 'pr_head', 'design_head', 'post_processing_head',
    'faculty_coordinator', 'senior_coordinator', 'junior_coordinator', 'member'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  profile_photo_url TEXT,
  department TEXT,
  year TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  joined_club DATE,
  status member_status NOT NULL DEFAULT 'active',
  skills TEXT[] DEFAULT '{}',
  "position" TEXT NOT NULL DEFAULT 'member',
  is_core_committee BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_core_committee ON members(is_core_committee);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  department TEXT,
  venue TEXT,
  academic_year TEXT,
  event_date DATE,
  timings TEXT,
  cover_photo_url TEXT,
  organizing_club TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  drive_folder_id TEXT,
  drive_last_synced_at TIMESTAMPTZ,
  subfolders TEXT[] DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  photo_count INT NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Month column for indexed filtering
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_month smallint
  GENERATED ALWAYS AS (extract(month from event_date)::smallint) STORED;

CREATE INDEX IF NOT EXISTS idx_events_month ON events(event_month);
CREATE INDEX IF NOT EXISTS idx_events_organizing_club ON events(organizing_club);
CREATE INDEX IF NOT EXISTS idx_events_academic_year ON events(academic_year);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- 4. PHOTOS TABLE
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL,
  subfolder TEXT,
  filename TEXT NOT NULL,
  thumbnail_url TEXT,
  full_url TEXT NOT NULL,
  width INT,
  height INT,
  camera_make TEXT,
  camera_model TEXT,
  lens TEXT,
  taken_at TIMESTAMPTZ,
  exif JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES members(id) ON DELETE SET NULL,
  edited_by UUID REFERENCES members(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  is_group_photo BOOLEAN NOT NULL DEFAULT false,
  is_chief_guest BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT photos_event_drive_unique UNIQUE (event_id, drive_file_id)
);

CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_drive_file_id ON photos(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_published ON photos(is_published);
CREATE INDEX IF NOT EXISTS idx_photos_is_cover ON photos(is_cover);

-- 5. TAGS & PHOTO_TAGS
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- 6. BUZZ SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS buzz_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  roll_number TEXT,
  instagram_handle TEXT,
  email TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  drive_file_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EVENT TEAM JUNCTION TABLES
CREATE TABLE IF NOT EXISTS event_photography_team (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_post_processing_team (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_photography_core_committee (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_post_processing_core_committee (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);

-- 9. COUNTER RPC FUNCTIONS
CREATE OR REPLACE FUNCTION increment_event_views(p_event_id UUID)
RETURNS VOID AS $$
  UPDATE events SET view_count = view_count + 1 WHERE id = p_event_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_event_downloads(p_event_id UUID, p_count INT DEFAULT 1)
RETURNS VOID AS $$
  UPDATE events SET download_count = download_count + p_count WHERE id = p_event_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_photo_views(p_photo_id UUID)
RETURNS VOID AS $$
  UPDATE photos SET view_count = view_count + 1 WHERE id = p_photo_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_photo_downloads(p_photo_id UUID, p_count INT DEFAULT 1)
RETURNS VOID AS $$
  UPDATE photos SET download_count = download_count + p_count WHERE id = p_photo_id;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_event_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_event_downloads(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_photo_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_photo_downloads(UUID, INT) TO anon, authenticated;

-- 10. PUBLIC TEAM RPC FUNCTION
CREATE OR REPLACE FUNCTION get_event_team_public(p_event_id UUID)
RETURNS TABLE (
  role TEXT,
  member_id UUID,
  name TEXT,
  profile_photo_url TEXT,
  "position" TEXT
) AS $$
  SELECT 'photography_team'::TEXT, m.id, m.name, m.profile_photo_url, m."position"
  FROM event_photography_team t JOIN members m ON m.id = t.member_id WHERE t.event_id = p_event_id
  UNION ALL
  SELECT 'post_processing_team'::TEXT, m.id, m.name, m.profile_photo_url, m."position"
  FROM event_post_processing_team t JOIN members m ON m.id = t.member_id WHERE t.event_id = p_event_id
  UNION ALL
  SELECT 'photography_core_committee'::TEXT, m.id, m.name, m.profile_photo_url, m."position"
  FROM event_photography_core_committee t JOIN members m ON m.id = t.member_id WHERE t.event_id = p_event_id
  UNION ALL
  SELECT 'post_processing_core_committee'::TEXT, m.id, m.name, m.profile_photo_url, m."position"
  FROM event_post_processing_core_committee t JOIN members m ON m.id = t.member_id WHERE t.event_id = p_event_id;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_event_team_public(UUID) TO anon, authenticated;

-- 11. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE buzz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photography_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_post_processing_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photography_core_committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_post_processing_core_committee ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read members" ON members;
  DROP POLICY IF EXISTS "Public read events" ON events;
  DROP POLICY IF EXISTS "Public read photos" ON photos;
  DROP POLICY IF EXISTS "Public read tags" ON tags;
  DROP POLICY IF EXISTS "Public read photo_tags" ON photo_tags;
  DROP POLICY IF EXISTS "Public insert buzz" ON buzz_submissions;
  DROP POLICY IF EXISTS "Admin full members" ON members;
  DROP POLICY IF EXISTS "Admin full events" ON events;
  DROP POLICY IF EXISTS "Admin full photos" ON photos;
  DROP POLICY IF EXISTS "Admin full tags" ON tags;
  DROP POLICY IF EXISTS "Admin full photo_tags" ON photo_tags;
  DROP POLICY IF EXISTS "Admin full buzz" ON buzz_submissions;
  DROP POLICY IF EXISTS "Admin full activity" ON activity_logs;
  DROP POLICY IF EXISTS "Admin full team1" ON event_photography_team;
  DROP POLICY IF EXISTS "Admin full team2" ON event_post_processing_team;
  DROP POLICY IF EXISTS "Admin full team3" ON event_photography_core_committee;
  DROP POLICY IF EXISTS "Admin full team4" ON event_post_processing_core_committee;
EXCEPTION WHEN undefined_object THEN null;
END $$;

-- Public read policies
CREATE POLICY "Public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read photo_tags" ON photo_tags FOR SELECT USING (true);
CREATE POLICY "Public insert buzz" ON buzz_submissions FOR INSERT WITH CHECK (true);

-- Admin / service_role full access policies
CREATE POLICY "Admin full members" ON members FOR ALL USING (true);
CREATE POLICY "Admin full events" ON events FOR ALL USING (true);
CREATE POLICY "Admin full photos" ON photos FOR ALL USING (true);
CREATE POLICY "Admin full tags" ON tags FOR ALL USING (true);
CREATE POLICY "Admin full photo_tags" ON photo_tags FOR ALL USING (true);
CREATE POLICY "Admin full buzz" ON buzz_submissions FOR ALL USING (true);
CREATE POLICY "Admin full activity" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Admin full team1" ON event_photography_team FOR ALL USING (true);
CREATE POLICY "Admin full team2" ON event_post_processing_team FOR ALL USING (true);
CREATE POLICY "Admin full team3" ON event_photography_core_committee FOR ALL USING (true);
CREATE POLICY "Admin full team4" ON event_post_processing_core_committee FOR ALL USING (true);
