import type { SupabaseClient } from "../../db/supabase.client";
import type { BetDto, BetUpsertCommand } from "../../types";

/**
 * Custom error classes for bet service operations
 */
export class MatchNotFoundError extends Error {
  constructor(matchId: string) {
    super(`Match with ID ${matchId} not found`);
    this.name = "MatchNotFoundError";
  }
}

export class BetLockedError extends Error {
  constructor(reason: string) {
    super(`Betting is locked: ${reason}`);
    this.name = "BetLockedError";
  }
}

/**
 * Upserts a user's bet for a given match.
 * Validates that betting is still open (match status and deadline) before allowing the upsert.
 *
 * @param params - Parameters for the bet upsert operation
 * @param params.supabase - Supabase client instance
 * @param params.userId - Authenticated user ID
 * @param params.matchId - UUID of the match to bet on
 * @param params.homeScore - Predicted home team score
 * @param params.awayScore - Predicted away team score
 * @param params.now - Current timestamp (for testing purposes, defaults to new Date())
 * @returns Promise<BetDto> - The upserted bet record
 * @throws MatchNotFoundError if match doesn't exist
 * @throws BetLockedError if betting is no longer allowed
 */
export async function upsertUserBet({
  supabase,
  userId,
  matchId,
  homeScore,
  awayScore,
  now = new Date(),
}: {
  supabase: SupabaseClient;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  now?: Date;
}): Promise<BetDto> {
  // 1. Fetch match by ID
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, kickoff_time, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    throw new MatchNotFoundError(matchId);
  }

  // 2. Validate match status - must be 'scheduled' or 'live'
  if (match.status !== "scheduled" && match.status !== "live") {
    throw new BetLockedError(`Match status is ${match.status}, betting is closed`);
  }

  // 3. Validate betting deadline - must be before kickoff_time - 5 minutes
  const kickoffTime = new Date(match.kickoff_time);
  const bettingDeadline = new Date(kickoffTime.getTime() - 5 * 60 * 1000); // 5 minutes before kickoff

  if (now >= bettingDeadline) {
    throw new BetLockedError(`Betting deadline has passed (${bettingDeadline.toISOString()})`);
  }

  // 4. Upsert bet using unique constraint on (user_id, match_id)
  const { data: bet, error: betError } = await supabase
    .from("bets")
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        updated_at: now.toISOString(),
      },
      {
        onConflict: "user_id,match_id",
        ignoreDuplicates: false,
      }
    )
    .select(`
      id,
      match_id,
      home_score,
      away_score,
      points_awarded,
      created_at,
      updated_at
    `)
    .single();

  if (betError) {
    throw new Error(`Failed to upsert bet: ${betError.message}`);
  }

  if (!bet) {
    throw new Error("Bet upsert succeeded but no data returned");
  }

  // 5. Map to DTO and return
  return {
    id: bet.id,
    matchId: bet.match_id,
    homeScore: bet.home_score,
    awayScore: bet.away_score,
    pointsAwarded: bet.points_awarded,
    createdAt: bet.created_at,
    updatedAt: bet.updated_at,
  };
}
