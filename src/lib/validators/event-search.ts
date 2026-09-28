import { z } from "zod";

/**
 * Shared shape for the events search/filter bar. Keeping this as a Zod
 * schema (rather than loosely-typed searchParams) means the future
 * semantic-search seam (SemanticSearchService in lib/ai) can validate
 * against the exact same contract the keyword search uses today.
 */
export const eventSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  department: z.string().max(100).optional(),
  venue: z.string().max(100).optional(),
  year: z.string().max(20).optional(),
  category: z.string().max(100).optional(),
  club: z.string().max(100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export type EventSearchParams = z.infer<typeof eventSearchSchema>;
