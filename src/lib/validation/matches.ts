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

/**
 * Validation schema for PUT /api/matches/[matchId]/bet path parameter
 * Validates that matchId is a valid UUID string
 */
export const matchIdParamSchema = z.object({
  matchId: z.string().uuid({ message: "matchId must be a valid UUID" }),
});

export type MatchIdParam = z.infer<typeof matchIdParamSchema>;

/**
 * Validation schema for PUT /api/matches/[matchId]/bet request body
 * Validates homeScore and awayScore as non-negative integers
 */
export const betUpsertCommandSchema = z.object({
  homeScore: z
    .number({ required_error: "homeScore is required" })
    .int({ message: "homeScore must be an integer" })
    .min(0, { message: "homeScore must be non-negative" }),
  awayScore: z
    .number({ required_error: "awayScore is required" })
    .int({ message: "awayScore must be an integer" })
    .min(0, { message: "awayScore must be non-negative" }),
});

export type BetUpsertCommandValidated = z.infer<typeof betUpsertCommandSchema>;

/**
 * Validation schema for GET /api/matches/history query parameters
 * Validates pagination, sorting, and date range filtering for match history
 */
export const matchHistoryQuerySchema = z
  .object({
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

    // Sorting (fixed to kickoff_time) with order
    sort: z.literal("kickoff_time"),
    order: z.enum(["desc", "asc"]).optional().default("desc"),

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
  })
  .refine(
    (data) => {
      // Ensure from <= to when both are provided
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    {
      message: "'from' date must be before or equal to 'to' date",
      path: ["from"], // Attach error to 'from' field
    }
  );

export type MatchHistoryQuery = z.infer<typeof matchHistoryQuerySchema>;
