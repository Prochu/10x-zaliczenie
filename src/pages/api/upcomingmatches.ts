import type { APIRoute } from "astro";
import { upcomingMatchesQuerySchema } from "../../lib/validation/matches";
import { getUpcomingMatches } from "../../lib/services/matchesService";
import type { MatchListResponse } from "../../types";

export const prerender = false;

/**
 * GET /api/upcomingmatches
 * Returns paginated list of scheduled or live matches with betting deadlines
 * and the authenticated user's bets (if any).
 */
export const GET: APIRoute = async ({ locals, url }) => {
  const supabase = locals.supabase;

  // 1. Get current user (optional - for including their bets)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Validate query parameters
  const queryParams = {
    page: url.searchParams.get("page") || undefined,
    pageSize: url.searchParams.get("pageSize") || undefined,
    status: url.searchParams.get("status") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    sort: url.searchParams.get("sort") || undefined,
  };

  const parseResult = upcomingMatchesQuerySchema.safeParse(queryParams);

  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
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

  // 3. Call service to fetch matches
  try {
    const result = await getUpcomingMatches(validatedQuery, supabase, user?.id || null);

    const response: MatchListResponse = {
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
    console.error("Error fetching upcoming matches:", error);

    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

