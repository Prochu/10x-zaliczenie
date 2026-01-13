-- Additional seed data for testing upcoming matches endpoint

-- Insert upcoming test matches (scheduled and live)
INSERT INTO matches (id, api_match_id, home_team_name, home_team_api_id, away_team_name, away_team_api_id, home_team_score, away_team_score, kickoff_time, status, home_team_logo, away_team_logo) VALUES
  -- Scheduled matches (future)
  ('44444444-4444-4444-4444-444444444444', 'api_match_4', 'Arsenal', 'team_7', 'Chelsea', 'team_8', null, null, now() + interval '1 day', 'scheduled', 'https://example.com/arsenal.png', 'https://example.com/chelsea.png'),
  ('55555555-5555-5555-5555-555555555555', 'api_match_5', 'AC Milan', 'team_9', 'Inter Milan', 'team_10', null, null, now() + interval '2 days', 'scheduled', 'https://example.com/acmilan.png', 'https://example.com/inter.png'),
  ('66666666-6666-6666-6666-666666666666', 'api_match_6', 'Juventus', 'team_11', 'Napoli', 'team_12', null, null, now() + interval '3 days', 'scheduled', null, null),
  ('77777777-7777-7777-7777-777777777777', 'api_match_7', 'Atletico Madrid', 'team_13', 'Sevilla', 'team_14', null, null, now() + interval '7 days', 'scheduled', 'https://example.com/atletico.png', 'https://example.com/sevilla.png'),
  
  -- Live matches (happening now)
  ('88888888-8888-8888-8888-888888888888', 'api_match_8', 'Dortmund', 'team_15', 'Leipzig', 'team_16', 1, 1, now() - interval '30 minutes', 'live', 'https://example.com/dortmund.png', 'https://example.com/leipzig.png'),
  ('99999999-9999-9999-9999-999999999999', 'api_match_9', 'Tottenham', 'team_17', 'Man United', 'team_18', 2, 0, now() - interval '45 minutes', 'live', 'https://example.com/tottenham.png', 'https://example.com/manutd.png')
ON CONFLICT (api_match_id) DO NOTHING;

-- Insert test bets for upcoming matches (only for scheduled matches - live matches are past betting deadline)
-- Alice bets on 2 scheduled matches
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '44444444-4444-4444-4444-444444444444', 2, 1, null),
  ('57e03949-57b7-41e4-8b55-a6c6caf1cd98', '55555555-5555-5555-5555-555555555555', 1, 1, null)
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Bob bets on different scheduled matches
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '44444444-4444-4444-4444-444444444444', 3, 0, null),
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '66666666-6666-6666-6666-666666666666', 2, 2, null),
  ('67e03949-57b7-41e4-8b55-a6c6caf1cd99', '77777777-7777-7777-7777-777777777777', 1, 0, null)
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Charlie bets on live match (placed before deadline)
INSERT INTO bets (user_id, match_id, home_score, away_score, points_awarded) VALUES
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '88888888-8888-8888-8888-888888888888', 2, 2, null),
  ('77e03949-57b7-41e4-8b55-a6c6caf1cd9a', '55555555-5555-5555-5555-555555555555', 0, 2, null)
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Diana has no bets on upcoming matches
-- Eve has no bets on upcoming matches

