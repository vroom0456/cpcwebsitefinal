import { createClient } from "@/lib/supabase/server";
import type { Member, Event } from "@/types/database";

export type CoverageEvent = Pick<Event, "id" | "title" | "slug" | "event_date" | "status">;

export interface MemberEventCoverage {
  photography: CoverageEvent[];
  postProcessing: CoverageEvent[];
}

const DEFAULT_MEMBERS: Member[] = [
  // Faculty Coordinator - Top Separate Hierarchy
  {
    id: "00000000-0000-0000-0000-000000000001",
    auth_user_id: null,
    name: "Mr. K. Gurubrahmam",
    email: "gurubrahmam_ece@cbit.ac.in",
    phone: "",
    department: "ECE",
    year: "Faculty Coordinator",
    joined_club: "2020-01-01",
    status: "active",
    position: "faculty_coordinator",
    is_core_committee: true,
    skills: ["Faculty Advisor", "Department Representative"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 12th Generation (Current Active CC 2026-27) - Roles with customizable name slots
  {
    id: "00000000-0000-0000-0000-000000000010",
    auth_user_id: null,
    name: "President (12th Gen)",
    email: "president@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "president",
    is_core_committee: true,
    skills: ["Executive Leadership", "Photography"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    auth_user_id: null,
    name: "Vice President (12th Gen)",
    email: "vp@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "vice_president",
    is_core_committee: true,
    skills: ["Operations & Management"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    auth_user_id: null,
    name: "General Secretary (12th Gen)",
    email: "gensec@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "general_secretary",
    is_core_committee: true,
    skills: ["Administration"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    auth_user_id: null,
    name: "Joint Secretary (12th Gen)",
    email: "jointsec@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "joint_secretary",
    is_core_committee: true,
    skills: ["Event Coordination"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    auth_user_id: null,
    name: "Head of Events & Doc (12th Gen)",
    email: "events@cbitphotoclub.in",
    phone: "",
    department: "Events",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "events_head",
    is_core_committee: true,
    skills: ["Event Management"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    auth_user_id: null,
    name: "Head of Social Media & PR (12th Gen)",
    email: "pr@cbitphotoclub.in",
    phone: "",
    department: "PR",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "pr_head",
    is_core_committee: true,
    skills: ["Public Relations", "Social Media"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    auth_user_id: null,
    name: "Head of Design (12th Gen)",
    email: "design@cbitphotoclub.in",
    phone: "",
    department: "Design",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "design_head",
    is_core_committee: true,
    skills: ["Graphics & Branding"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000017",
    auth_user_id: null,
    name: "Head of Post Processing (12th Gen)",
    email: "editing@cbitphotoclub.in",
    phone: "",
    department: "Post Processing",
    year: "12th Gen",
    joined_club: "2023-08-01",
    status: "active",
    position: "post_processing_head",
    is_core_committee: true,
    skills: ["Lightroom", "Color Grading"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 11th Generation (2025-26 under Adarsh) - Roles and Names
  {
    id: "00000000-0000-0000-0000-000000000020",
    auth_user_id: null,
    name: "Adarsh",
    email: "adarsh@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "11th Gen",
    joined_club: "2022-08-01",
    status: "alumni",
    position: "president",
    is_core_committee: true,
    skills: ["11th Gen President"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 10th Generation Core Committee (2024-25)
  {
    id: "00000000-0000-0000-0000-000000000030",
    auth_user_id: null,
    name: "Adithya Gella",
    email: "adithya@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "president",
    is_core_committee: true,
    skills: ["10th Gen President"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000031",
    auth_user_id: null,
    name: "Vishnu Vardhan",
    email: "vishnu@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "vice_president",
    is_core_committee: true,
    skills: ["Vice President"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    auth_user_id: null,
    name: "Dedeepya Nethi",
    email: "dedeepya@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "general_secretary",
    is_core_committee: true,
    skills: ["General Secretary"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000033",
    auth_user_id: null,
    name: "Haroon Fazal Vajrala",
    email: "haroon@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "general_secretary",
    is_core_committee: true,
    skills: ["General Secretary"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000034",
    auth_user_id: null,
    name: "Marthu Meghaj",
    email: "meghaj@cbitphotoclub.in",
    phone: "",
    department: "Design",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "design_head",
    is_core_committee: true,
    skills: ["Design Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000035",
    auth_user_id: null,
    name: "Veerendharnath",
    email: "veeru@cbitphotoclub.in",
    phone: "",
    department: "Design",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "design_head",
    is_core_committee: true,
    skills: ["Creative Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000036",
    auth_user_id: null,
    name: "Sameera Kethini",
    email: "sameera@cbitphotoclub.in",
    phone: "",
    department: "Events",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "events_head",
    is_core_committee: true,
    skills: ["Events Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000037",
    auth_user_id: null,
    name: "Prasuna Gollapudi",
    email: "prasuna@cbitphotoclub.in",
    phone: "",
    department: "PR",
    year: "10th Gen",
    joined_club: "2021-08-01",
    status: "alumni",
    position: "pr_head",
    is_core_committee: true,
    skills: ["Social Media Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 9th Generation Core Committee (2023-24)
  {
    id: "00000000-0000-0000-0000-000000000040",
    auth_user_id: null,
    name: "CVN Praneeth",
    email: "praneeth@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "9th Gen",
    joined_club: "2020-08-01",
    status: "alumni",
    position: "president",
    is_core_committee: true,
    skills: ["9th Gen President"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000041",
    auth_user_id: null,
    name: "Abhishek Samuel",
    email: "abhishek@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "9th Gen",
    joined_club: "2020-08-01",
    status: "alumni",
    position: "vice_president",
    is_core_committee: true,
    skills: ["Vice President"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000042",
    auth_user_id: null,
    name: "Avinash Reddy",
    email: "avinash@cbitphotoclub.in",
    phone: "",
    department: "CPC",
    year: "9th Gen",
    joined_club: "2020-08-01",
    status: "alumni",
    position: "general_secretary",
    is_core_committee: true,
    skills: ["General Secretary"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000044",
    auth_user_id: null,
    name: "Adnan Siddique",
    email: "adnan@cbitphotoclub.in",
    phone: "",
    department: "PR",
    year: "9th Gen",
    joined_club: "2020-08-01",
    status: "alumni",
    position: "pr_head",
    is_core_committee: true,
    skills: ["Social Media Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000045",
    auth_user_id: null,
    name: "Sreena Reddy",
    email: "sreena@cbitphotoclub.in",
    phone: "",
    department: "Events",
    year: "9th Gen",
    joined_club: "2020-08-01",
    status: "alumni",
    position: "events_head",
    is_core_committee: true,
    skills: ["Events Head"],
    profile_photo_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getMembers(): Promise<Member[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("members").select("*").order("name");
    if (error || !data || data.length === 0) {
      return DEFAULT_MEMBERS;
    }
    return data;
  } catch (err) {
    return DEFAULT_MEMBERS;
  }
}

export async function getMemberById(id: string): Promise<Member | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("members").select("*").eq("id", id).single();
    if (error || !data) {
      return DEFAULT_MEMBERS.find(m => m.id === id) ?? null;
    }
    return data;
  } catch (err) {
    return DEFAULT_MEMBERS.find(m => m.id === id) ?? null;
  }
}

/** Events a member belongs to, split by Photography Team vs. Post Processing Team. */
export async function getMemberEventCoverage(memberId: string): Promise<MemberEventCoverage> {
  try {
    const supabase = await createClient();
    const eventFields = "id, title, slug, event_date, status";

    const [photography, postProcessing] = await Promise.all([
      supabase
        .from("event_photography_team")
        .select(`events(${eventFields})`)
        .eq("member_id", memberId)
        .then((r: any) => r, () => ({ data: null, error: null })),
      supabase
        .from("event_post_processing_team")
        .select(`events(${eventFields})`)
        .eq("member_id", memberId)
        .then((r: any) => r, () => ({ data: null, error: null })),
    ]);

    const toEvents = (rows: { events: CoverageEvent | CoverageEvent[] | null }[] | null) =>
      (rows ?? [])
        .flatMap((r) => (Array.isArray(r.events) ? r.events : r.events ? [r.events] : []))
        .sort((a, b) => (b.event_date ?? "").localeCompare(a.event_date ?? ""));

    return {
      photography: toEvents(photography.data as never),
      postProcessing: toEvents(postProcessing.data as never),
    };
  } catch (err) {
    return { photography: [], postProcessing: [] };
  }
}

/** Members currently assigned across an event's four team/CC roles. */
export async function getEventTeamAssignments(eventId: string) {
  try {
    const supabase = await createClient();

    const [photographyTeam, ppTeam, photographyCC, ppCC] = await Promise.all([
      supabase.from("event_photography_team").select("member_id").eq("event_id", eventId).then((r: any) => r, () => ({ data: [] })),
      supabase.from("event_post_processing_team").select("member_id").eq("event_id", eventId).then((r: any) => r, () => ({ data: [] })),
      supabase.from("event_photography_core_committee").select("member_id").eq("event_id", eventId).then((r: any) => r, () => ({ data: [] })),
      supabase.from("event_post_processing_core_committee").select("member_id").eq("event_id", eventId).then((r: any) => r, () => ({ data: [] })),
    ]);

    return {
      photographyTeam: (photographyTeam.data ?? []).map((r: any) => r.member_id),
      postProcessingTeam: (ppTeam.data ?? []).map((r: any) => r.member_id),
      photographyCoreCommittee: (photographyCC.data ?? []).map((r: any) => r.member_id),
      postProcessingCoreCommittee: (ppCC.data ?? []).map((r: any) => r.member_id),
    };
  } catch (err) {
    return {
      photographyTeam: [],
      postProcessingTeam: [],
      photographyCoreCommittee: [],
      postProcessingCoreCommittee: [],
    };
  }
}
