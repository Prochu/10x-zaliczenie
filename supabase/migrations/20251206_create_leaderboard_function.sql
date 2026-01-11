-- Create SQL function for leaderboard with pagination and ranking
-- This function efficiently computes user rankings based on total points awarded from bets
-- Uses window functions to calculate ranks and total count in a single query

CREATE OR REPLACE FUNCTION get_leaderboard_paginated(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  nickname TEXT,
  total_points BIGINT,
  matches_bet BIGINT,
  total_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  WITH user_stats AS (
    SELECT
      p.id AS user_id,
      p.nickname,
      COALESCE(SUM(b.points_awarded), 0) AS total_points,
      COUNT(b.id) FILTER (WHERE b.points_awarded IS NOT NULL) AS matches_bet
    FROM profiles p
    LEFT JOIN bets b ON p.id = b.user_id
    GROUP BY p.id, p.nickname
  ),
  ranked_users AS (
    SELECT
      DENSE_RANK() OVER (ORDER BY total_points DESC, nickname ASC) AS rank,
      user_id,
      nickname,
      total_points,
      matches_bet,
      COUNT(*) OVER () AS total_count
    FROM user_stats
  )
  SELECT
    rank,
    user_id,
    nickname,
    total_points,
    matches_bet,
    total_count
  FROM ranked_users
  ORDER BY rank ASC, nickname ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_leaderboard_paginated IS 
  'Returns paginated leaderboard with user rankings based on total points awarded from bets. Uses DENSE_RANK to handle ties properly.';

