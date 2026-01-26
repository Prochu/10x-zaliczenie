import type { APIRoute } from "astro";
import { matchHistoryQuerySchema } from "../../../lib/validation/matches";
import { getHistory } from "../../../lib/services/matchHistoryService";
import type { MatchHistoryResponse } from "../../../types";

export const prerender = false;

/**
 * GET /api/matches/history
 * Returns paginated list of finished matches with the authenticated user's
 * bets and awarded points (if any). Requires authentication.
 *
 * Manual Test Scenarios:
 * 1. Defaults: GET /api/matches/history (should return page 1, 20 items, desc order)
 * 2. Pagination: GET /api/matches/history?page=2&pageSize=10
 * 3. Date filtering: GET /api/matches/history?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z
 * 4. Ordering: GET /api/matches/history?order=asc (should sort by kickoff_time ascending)
 * 5. Empty result: GET /api/matches/history?from=2099-01-01T00:00:00Z (future date)
 * 6. Authentication required: GET /api/matches/history without auth should return 401
 * 7. Invalid params: GET /api/matches/history?page=abc should return 400
 * 8. Date validation: GET /api/matches/history?from=2024-12-31&to=2024-01-01 should return 400
 */
export const GET: APIRoute = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const user = locals.user;

  // 1. Verify authentication
  if (!user) {
    return new Response(
      JSON.stringify({
        error: "unauthenticated",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Validate query parameters
  const queryParams = {
    page: url.searchParams.get("page") || undefined,
    pageSize: url.searchParams.get("pageSize") || undefined,
    sort: "kickoff_time" as const, // Fixed sort field
    order: url.searchParams.get("order") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  };

  const parseResult = matchHistoryQuerySchema.safeParse(queryParams);

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

  // 3. Call service to fetch match history
  try {
    const result = await getHistory(validatedQuery, supabase, user.id);

    const response: MatchHistoryResponse = {
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
    console.error("Error fetching match history:", error);

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
