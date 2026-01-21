import type { SupabaseClient } from "../../db/supabase.client";
import type { MatchHistoryItemDto, UserBetInlineDto } from "../../types";
import type { MatchHistoryQuery } from "../validation/matches";

export interface MatchHistoryServiceResult {
  items: MatchHistoryItemDto[];
  total: number;
}

/**
 * Retrieves finished matches history with user's bets and awarded points if any.
 * Supports pagination, kickoff time range filtering, and sorting by kickoff time.
 * Requires userId for bet information (authentication required).
 */
export async function getHistory(
  query: MatchHistoryQuery,
  supabase: SupabaseClient,
  userId: string
): Promise<MatchHistoryServiceResult> {
  const { page, pageSize, from, to, order } = query;

  // Calculate pagination offset
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  // Build the query for finished matches with left join on bets filtered by user_id
  let matchQuery = supabase
    .from("matches")
    .select(
      `
      id,
      api_match_id,
      home_team_name,
      away_team_name,
      home_team_logo,
      away_team_logo,
      home_team_score,
      away_team_score,
      kickoff_time,
      status,
      bets!bets_match_id_fkey (
        id,
        match_id,
        home_score,
        away_score,
        points_awarded,
        updated_at,
        user_id
      )
    `,
      { count: "exact" }
    )
    .eq("status", "finished");

  // Apply kickoff_time range filters
  if (from) {
    matchQuery = matchQuery.gte("kickoff_time", from);
  }
  if (to) {
    matchQuery = matchQuery.lte("kickoff_time", to);
  }

  // Apply sorting by kickoff_time (default desc)
  const ascending = order === "asc";
  matchQuery = matchQuery.order("kickoff_time", { ascending });

  // Apply pagination
  matchQuery = matchQuery.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await matchQuery;

  if (error) {
    throw new Error(`Failed to fetch match history: ${error.message}`);
  }

  if (!data) {
    return { items: [], total: 0 };
  }

  // Map database results to DTOs
  const items: MatchHistoryItemDto[] = data.map((match) => {
    // Compute betting deadline: kickoff time - 5 minutes
    const kickoffTime = new Date(match.kickoff_time);
    const bettingDeadline = new Date(kickoffTime.getTime() - 5 * 60 * 1000);

    // Extract user bet if present - filter for current user's bet (should be at most one)
    let userBet: UserBetInlineDto | undefined;
    if (match.bets && Array.isArray(match.bets) && match.bets.length > 0) {
      // Find the bet for the current user
      const bet = match.bets.find((b) => b.user_id === userId);
      if (bet) {
        userBet = {
          id: bet.id,
          matchId: bet.match_id,
          homeScore: bet.home_score,
          awayScore: bet.away_score,
          pointsAwarded: bet.points_awarded,
          updatedAt: bet.updated_at,
        };
      }
    }

    return {
      match: {
        id: match.id,
        apiMatchId: match.api_match_id,
        homeTeamName: match.home_team_name,
        awayTeamName: match.away_team_name,
        homeTeamLogo: match.home_team_logo,
        awayTeamLogo: match.away_team_logo,
        homeTeamScore: match.home_team_score,
        awayTeamScore: match.away_team_score,
        kickoffTime: match.kickoff_time,
        status: match.status,
        bettingDeadline: bettingDeadline.toISOString(),
      },
      bet: userBet,
      pointsAwarded: userBet?.pointsAwarded,
    };
  });

  return { items, total: count ?? 0 };
}
