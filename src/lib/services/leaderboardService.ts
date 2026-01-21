import type { SupabaseClient } from "../../db/supabase.client";
import type { LeaderboardEntryDto } from "../../types";

export interface LeaderboardQuery {
  page: number;
  pageSize: number;
  sort: "points_desc";
  groupId: string;
}

export interface LeaderboardServiceResult {
  items: LeaderboardEntryDto[];
  total: number;
}

/**
 * Retrieves the leaderboard with user rankings based on total points awarded.
 * Uses SQL aggregation with window functions to efficiently compute ranks and totals.
 */
export async function getLeaderboard(
  query: LeaderboardQuery,
  supabase: SupabaseClient
): Promise<LeaderboardServiceResult> {
  const { page, pageSize, groupId } = query;
  const offset = (page - 1) * pageSize;

  // Execute SQL query with window functions for ranking and pagination
  // Uses DENSE_RANK to handle ties properly (users with same points get same rank)
  const { data, error } = await supabase.rpc("get_leaderboard_paginated", {
    p_group_id: groupId,
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  if (!data) {
    return { items: [], total: 0 };
  }

  // Extract total from first row (same for all rows due to window function)
  const total = data.length > 0 ? data[0].total_count : 0;

  // Map database results to DTOs
  const items: LeaderboardEntryDto[] = data.map((row) => ({
    rank: row.rank,
    userId: row.user_id,
    nickname: row.nickname,
    totalPoints: row.total_points,
    matchesBet: row.matches_bet,
  }));

  return { items, total };
}
