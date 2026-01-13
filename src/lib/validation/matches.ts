import { z } from "zod";

/**
 * Validation schema for GET /api/matches/upcoming query parameters
 * Validates pagination, filtering, and sorting options for upcoming matches
 */
export const upcomingMatchesQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),

  // Status filter: scheduled, live, or both (omitted)
  status: z.enum(["scheduled", "live"]).optional(),

  // Kickoff time range filters (ISO 8601 UTC timestamps)
  from: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const date = new Date(val);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      },
      { message: "Invalid ISO date format for 'from' parameter" }
    ),
  to: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const date = new Date(val);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      },
      { message: "Invalid ISO date format for 'to' parameter" }
    ),

  // Sort order by kickoff time
  sort: z.enum(["kickoff_time.asc", "kickoff_time.desc"]).optional().default("kickoff_time.asc"),
});

export type UpcomingMatchesQuery = z.infer<typeof upcomingMatchesQuerySchema>;

