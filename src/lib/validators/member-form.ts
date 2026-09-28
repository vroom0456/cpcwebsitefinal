import { z } from "zod";

export const memberFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  year: z.string().trim().max(20).optional().or(z.literal("")),
  joined_club: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "alumni"]),
  position: z.string().trim().min(1, "Position is required"),
  is_core_committee: z.boolean(),
  skills: z.string().trim().max(500).optional().or(z.literal("")), // comma-separated in the form
  profile_photo_url: z.string().trim().url().optional().or(z.literal("")),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
