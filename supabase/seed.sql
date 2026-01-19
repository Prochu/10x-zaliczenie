-- Main seed file - automatically loaded by supabase db reset
-- Contains test data for leaderboard functionality

-- Insert test auth users first
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', 'alice@test.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', 'bob@test.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', 'charlie@test.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('87e03949-57b7-41e4-8b55-a6c6caf1cd9b', 'diana@test.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('97e03949-57b7-41e4-8b55-a6c6caf1cd9c', 'eve@test.com', crypt('password', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert test profiles
INSERT INTO profiles (id, user_id, nickname, is_admin, created_at, updated_at) VALUES
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '57e03949-57b7-41e4-8b55-a6c6caf1cd98', 'Alice', false, now(), now()),
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '67e03949-57b7-41e4-8b55-a6c6caf1cd99', 'Bob', false, now(), now()),
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '77e03949-57b7-41e4-8b55-a6c6caf1cd9a', 'Charlie', false, now(), now()),
  ('87e03949-57b7-41e4-8b55-a6c6caf1cd9b', '87e03949-57b7-41e4-8b55-a6c6caf1cd9b', 'Diana', false, now(), now()),
  ('97e03949-57b7-41e4-8b55-a6c6caf1cd9c', '97e03949-57b7-41e4-8b55-a6c6caf1cd9c', 'Eve', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert test matches (finished - for leaderboard)
INSERT INTO matches (id, api_match_id, home_team_name, home_team_api_id, away_team_name, away_team_api_id, home_team_score, away_team_score, kickoff_time, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'api_match_1', 'Real Madrid', 'team_1', 'Barcelona', 'team_2', 2, 1, now() - interval '1 day', 'finished'),
  ('22222222-2222-2222-2222-222222222222', 'api_match_2', 'Bayern Munich', 'team_3', 'PSG', 'team_4', 3, 3, now() - interval '2 days', 'finished'),
  ('33333333-3333-3333-3333-333333333333', 'api_match_3', 'Liverpool', 'team_5', 'Man City', 'team_6', 1, 0, now() - interval '3 days', 'finished')
ON CONFLICT (api_match_id) DO NOTHING;

-- Insert test bets with points awarded for leaderboard
-- Alice: 8 points (4+2+2)
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '11111111-1111-1111-1111-111111111111', 2, 1, 4),  -- exact score
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '22222222-2222-2222-2222-222222222222', 3, 3, 2),  -- correct draw
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '33333333-3333-3333-3333-333333333333', 2, 0, 2)   -- correct winner + goal diff
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Bob: 5 points (2+2+1)
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '11111111-1111-1111-1111-111111111111', 3, 2, 2),  -- correct winner + goal diff
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '22222222-2222-2222-2222-222222222222', 2, 2, 2),  -- correct draw
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '33333333-3333-3333-3333-333333333333', 2, 1, 1)   -- correct winner only
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Charlie: 5 points (same as Bob to test rank ties)
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '11111111-1111-1111-1111-111111111111', 1, 0, 1),  -- correct winner only
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '22222222-2222-2222-2222-222222222222', 3, 3, 4),  -- exact score
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '33333333-3333-3333-3333-333333333333', 0, 0, 0)   -- incorrect
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Diana: 2 points
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('87e03949-57b7-41e4-8b55-a6c6caf1cd9b', '11111111-1111-1111-1111-111111111111', 1, 1, 0),  -- incorrect
  ('87e03949-57b7-41e4-8b55-a6c6caf1cd9b', '22222222-2222-2222-2222-222222222222', 1, 1, 0),  -- incorrect
  ('87e03949-57b7-41e4-8b55-a6c6caf1cd9b', '33333333-3333-3333-3333-333333333333', 2, 0, 2)   -- correct winner + goal diff
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Eve: 0 points (no bets placed)
