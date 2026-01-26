import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Scoring rules (R-010):
 * - 4 points: exact final score.
 * - 2 points: correct winner and goal difference (but not exact score) OR correct draw (but not exact score).
 * - 1 point: correct winner only.
 * - 0 points: otherwise.
 */
export function calculatePoints(
  actualHome: number,
  actualAway: number,
  predictedHome: number,
  predictedAway: number
): number {
  // Exact score
  if (actualHome === predictedHome && actualAway === predictedAway) {
    return 4;
  }

  const actualDiff = actualHome - actualAway;
  const predictedDiff = predictedHome - predictedAway;

  // Correct winner/draw
  const actualWinner = Math.sign(actualDiff); // 1 for home win, -1 for away win, 0 for draw
  const predictedWinner = Math.sign(predictedDiff);

  if (actualWinner === predictedWinner) {
    // Correct goal difference (includes draws where diff is 0)
    if (actualDiff === predictedDiff) {
      return 2;
    }
    // Correct winner but wrong difference
    return 1;
  }

  return 0;
}

/**
 * Recalculates points for all bets on a specific match.
 */
export async function updateMatchBetsPoints(
  supabase: SupabaseClient,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<number> {
  // 1. Fetch all bets for this match
  const { data: bets, error: fetchError } = await supabase
    .from("bets")
    .select("id, home_score, away_score")
    .eq("match_id", matchId);

  if (fetchError) {
    throw new Error(`Failed to fetch bets for recalculation: ${fetchError.message}`);
  }

  if (!bets || bets.length === 0) {
    return 0;
  }

  // 2. Calculate points for each bet
  const updates = bets.map((bet) => ({
    id: bet.id,
    points_awarded: calculatePoints(homeScore, awayScore, bet.home_score, bet.away_score),
  }));

  // 3. Bulk update bets
  // Note: Supabase doesn't have a great bulk update for different values by ID in one call,
  // but we can use upsert if we provide the IDs.
  const { error: updateError } = await supabase
    .from("bets")
    .upsert(updates);

  if (updateError) {
    throw new Error(`Failed to update points for bets: ${updateError.message}`);
  }

  return updates.length;
}
