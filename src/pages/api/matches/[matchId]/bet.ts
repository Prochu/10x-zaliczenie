import type { APIRoute } from "astro";
import { matchIdParamSchema, betUpsertCommandSchema } from "../../../../lib/validation/matches";
import { upsertUserBet, MatchNotFoundError, BetLockedError } from "../../../../lib/services/bets";
import type { BetResponse } from "../../../../types";

export const prerender = false;

/**
 * PUT /api/matches/[matchId]/bet
 * Upserts the authenticated user's bet (score prediction) for a given match.
 * Validates that betting is still open before allowing the upsert.
 *
 * Request body: { homeScore: number, awayScore: number }
 * Response: BetDto with persisted bet data
 *
 * Error responses:
 * - 400: Invalid input (validation errors)
 * - 401: Unauthenticated (missing/invalid token)
 * - 403: Betting locked (match status or deadline)
 * - 404: Match not found
 * - 500: Server error
 */
export const PUT: APIRoute = async ({ locals, params, request }) => {
  const supabase = locals.supabase;

  // TEMP: Skip authentication for testing
  // TODO: Re-enable authentication validation
  const user = { id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98" }; // Alice's user ID from seed data

  // 2. Validate path parameter (matchId)
  const paramParseResult = matchIdParamSchema.safeParse(params);

  if (!paramParseResult.success) {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
        message: "Invalid match ID format",
        details: paramParseResult.error.format(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { matchId } = paramParseResult.data;

  // 3. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
        message: "Request body must be valid JSON",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const bodyParseResult = betUpsertCommandSchema.safeParse(body);

  if (!bodyParseResult.success) {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
        message: "Invalid bet data",
        details: bodyParseResult.error.format(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { homeScore, awayScore } = bodyParseResult.data;

  // 4. Call service to upsert bet
  try {
    const bet = await upsertUserBet({
      supabase,
      userId: user.id,
      matchId,
      homeScore,
      awayScore,
    });

    const response: BetResponse = bet;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error upserting bet:", error);

    // Handle domain-specific errors
    if (error instanceof MatchNotFoundError) {
      return new Response(
        JSON.stringify({
          error: "match_not_found",
          message: error.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof BetLockedError) {
      return new Response(
        JSON.stringify({
          error: "betting_locked",
          message: error.message,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "An unexpected error occurred while processing your bet",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
