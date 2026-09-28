import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().optional().or(z.literal("")),
  venue: z.string().trim().optional().or(z.literal("")),
  academic_year: z.string().trim().optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  timings: z.string().trim().optional().or(z.literal("")),
  drive_folder_id: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
