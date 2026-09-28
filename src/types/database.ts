export type MemberStatus = "active" | "inactive" | "alumni";

export type MemberPosition =
  | "president"
  | "vice_president"
  | "general_secretary"
  | "joint_secretary"
  | "events_head"
  | "pr_head"
  | "design_head"
  | "post_processing_head"
  | "faculty_coordinator"
  | "senior_coordinator"
  | "junior_coordinator"
  | "member"
  | string;
export type EventStatus = "draft" | "published" | "archived";
export type ActivityAction =
  | "gallery_published"
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "photos_synced"
  | "team_updated"
  | "core_committee_updated"
  | "cover_changed";

export type Member = {
  id: string;
  auth_user_id: string | null;
  name: string;
  profile_photo_url: string | null;
  department: string | null;
  year: string | null;
  email: string | null;
  phone: string | null;
  joined_club: string | null;
  status: MemberStatus;
  skills: string[];
  position: MemberPosition;
  is_core_committee: boolean;
  created_at: string;
  updated_at: string;
}

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  department: string | null;
  venue: string | null;
  organizing_club: string | null;
  academic_year: string | null;
  event_date: string | null;
  timings?: string | null;
  /** Generated column (extract(month from event_date)); 1-12, null if event_date is null. */
  event_month: number | null;
  cover_photo_url: string | null;
  status: EventStatus;
  drive_folder_id: string | null;
  drive_last_synced_at: string | null;
  storage_bytes: number;
  photo_count: number;
  subfolders?: string[];
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type Photo = {
  id: string;
  event_id: string;
  drive_file_id: string;
  subfolder?: string | null;
  filename: string;
  thumbnail_url: string | null;
  full_url: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  camera_make: string | null;
  camera_model: string | null;
  lens: string | null;
  taken_at: string | null;
  exif: Record<string, unknown> | null;
  uploaded_by: string | null;
  edited_by: string | null;
  is_published: boolean;
  is_cover: boolean;
  is_group_photo?: boolean;
  is_chief_guest?: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type EventTeamRole =
  | "photography_team"
  | "post_processing_team"
  | "photography_core_committee"
  | "post_processing_core_committee";

/** Row shape returned by the `get_event_team_public` RPC (see migration 0006). */
export type PublicEventTeamMember = {
  role: EventTeamRole;
  member_id: string;
  name: string;
  profile_photo_url: string | null;
  position: MemberPosition;
}

export type Tag = {
  id: string;
  name: string;
  usage_count: number;
  created_at: string;
}

export type ActivityLog = {
  id: string;
  action: ActivityAction;
  member_id: string | null;
  event_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Minimal Database type for @supabase/supabase-js generics.
 * Replace with `supabase gen types typescript` output once the project
 * is linked, for full type-safety on every query builder call.
 */
export type Database = any;

export type Face = {
  id: string;
  name: string | null;
  is_hidden: boolean;
  cover_face_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PhotoFace = {
  id: string;
  photo_id: string;
  face_id: string;
  embedding: number[];
  bounding_box: { x: number; y: number; width: number; height: number } | null;
  confidence: number | null;
  created_at: string;
}
