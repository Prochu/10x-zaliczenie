import type { SupabaseClient } from "../../db/supabase.client";
import type { MatchListItemDto, UserBetInlineDto, MatchStatus } from "../../types";
import type { UpcomingMatchesQuery } from "../validation/matches";

export interface MatchesServiceResult {
  items: MatchListItemDto[];
  total: number;
}

/**
 * Retrieves upcoming matches (scheduled or live) with user's bets if any.
 * Supports pagination, status filtering, kickoff time range, and sorting.
 * If userId is null, no bets will be included (public access).
 */
export async function getUpcomingMatches(
  query: UpcomingMatchesQuery,
  supabase: SupabaseClient,
  userId: string | null
): Promise<MatchesServiceResult> {
  const { page, pageSize, status, from, to, sort } = query;

  // Calculate pagination offset
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  // Determine status filter: if not provided, include both scheduled and live
  const statuses: MatchStatus[] = status ? [status] : ["scheduled", "live"];

  // Build the query with left join on bets filtered by user_id
  // Using the foreign key relationship and filtering on the joined table
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
    .in("status", statuses);

  // Apply kickoff_time range filters
  if (from) {
    matchQuery = matchQuery.gte("kickoff_time", from);
  }
  if (to) {
    matchQuery = matchQuery.lte("kickoff_time", to);
  }

  // Apply sorting
  const [sortField, sortOrder] = sort.split(".");
  matchQuery = matchQuery.order(sortField, { ascending: sortOrder === "asc" });

  // Apply pagination
  matchQuery = matchQuery.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await matchQuery;

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }

  if (!data) {
    return { items: [], total: 0 };
  }

  // Map database results to DTOs
  const items: MatchListItemDto[] = data.map((match) => {
    // Compute betting deadline: kickoff time - 5 minutes
    const kickoffTime = new Date(match.kickoff_time);
    const bettingDeadline = new Date(kickoffTime.getTime() - 5 * 60 * 1000);

    // Extract user bet if present - filter for current user's bet (only if userId provided)
    let userBet: UserBetInlineDto | undefined;
    if (userId && match.bets && Array.isArray(match.bets) && match.bets.length > 0) {
      // Find the bet for the current user (there should be at most one)
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
      userBet,
    };
  });

  return { items, total: count ?? 0 };
}
