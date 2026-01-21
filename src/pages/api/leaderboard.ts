import type { APIRoute } from "astro";
import { z } from "zod";
import { getLeaderboard } from "../../lib/services/leaderboardService";
import type { LeaderboardResponse } from "../../types";

export const prerender = false;

// Validation schema for query parameters
const leaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .default("50")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
  sort: z.enum(["points_desc"]).optional().default("points_desc"),
  groupId: z.string().uuid().optional(),
});

export const GET: APIRoute = async ({ locals, url }) => {
  const supabase = locals.supabase;

  // Parse and validate query parameters
  const queryParams = {
    page: url.searchParams.get("page") || undefined,
    pageSize: url.searchParams.get("pageSize") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    groupId: url.searchParams.get("groupId") || undefined,
  };

  const parseResult = leaderboardQuerySchema.safeParse(queryParams);

  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Invalid query parameters",
        details: parseResult.error.format(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validatedQuery = parseResult.data;

  // If groupId is not provided, fetch the default group
  let groupId = validatedQuery.groupId;
  if (!groupId) {
    const { data: defaultGroup, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("is_default", true)
      .single();

    if (groupError || !defaultGroup) {
      console.error("Error fetching default group:", groupError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "No default group found",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    groupId = defaultGroup.id;
  }

  // Call service to get leaderboard data
  try {
    const result = await getLeaderboard(
      {
        ...validatedQuery,
        groupId,
      },
      supabase
    );

    const response: LeaderboardResponse = {
      items: result.items,
      page: validatedQuery.page,
      pageSize: validatedQuery.pageSize,
      total: result.total,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching the leaderboard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
