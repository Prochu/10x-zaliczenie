# Supabase Seed Scripts

This directory contains scripts for seeding the database with test data.

## Files

### `seed_upcoming_matches.sql`
SQL script that adds test data for upcoming matches endpoint:
- 4 scheduled matches (1-7 days in the future)
- 2 live matches (currently in progress)
- Test bets for Alice, Bob, and Charlie

**Usage with Supabase CLI:**
```sql
-- In Supabase SQL Editor or via psql
\i supabase/seed-scripts/seed_upcoming_matches.sql
```

### `seed_leaderboard_test_data.sql`
SQL script that adds test data for leaderboard endpoint:
- 5 users (Alice, Bob, Charlie, Diana, Eve)
- 3 finished matches with final scores
- Test bets with points awarded for leaderboard ranking
- Tests various scenarios: exact scores, ties, zero points

**Usage with Supabase CLI:**
```sql
-- In Supabase SQL Editor or via psql
\i supabase/seed-scripts/seed_leaderboard_test_data.sql
```

### `load-test-data.mjs`
Node.js script that programmatically loads the same test data using the Supabase client.

**Usage:**
```bash
# Make sure Supabase is running
supabase status

# Run the script
node supabase/seed-scripts/load-test-data.mjs
```

**Prerequisites:**
- Supabase local instance running (`supabase start`)
- Node.js installed
- `@supabase/supabase-js` package available

## Test Data Overview

### Upcoming Matches Data (`seed_upcoming_matches.sql`)

#### Matches Created
1. **Arsenal vs Chelsea** (scheduled, +1 day)
2. **AC Milan vs Inter Milan** (scheduled, +2 days)
3. **Juventus vs Napoli** (scheduled, +3 days)
4. **Atletico Madrid vs Sevilla** (scheduled, +7 days)
5. **Dortmund vs Leipzig** (live, -30 min)
6. **Tottenham vs Man United** (live, -45 min)

#### Bets Created
- **Alice**: 2 bets on scheduled matches
- **Bob**: 3 bets on scheduled matches
- **Charlie**: 2 bets (1 on live match, 1 on scheduled)
- **Diana**: No bets on upcoming matches
- **Eve**: No bets on upcoming matches

### Leaderboard Data (`seed_leaderboard_test_data.sql`)

#### Matches Created
1. **Real Madrid vs Barcelona** (finished, 2-1)
2. **Bayern Munich vs PSG** (finished, 3-3)
3. **Liverpool vs Man City** (finished, 1-0)

#### Bets with Points
- **Alice**: 8 points (rank 1) - 3 bets
  - Exact score: 4 points
  - Correct draw: 2 points
  - Correct winner + goal diff: 2 points
- **Bob**: 5 points (rank 2) - 3 bets
  - Two 2-point bets, one 1-point bet
- **Charlie**: 5 points (rank 3) - 3 bets
  - Same points as Bob (tests tie-breaking by nickname)
- **Diana**: 2 points (rank 4) - 3 bets
- **Eve**: 0 points (rank 5) - no bets

## Notes

- All dates are dynamically calculated relative to "now"
- Live matches have scores, scheduled matches don't
- Some matches have team logos, some don't (to test null values)
- Bets on upcoming matches have `points_awarded = null` (not yet calculated)
- Leaderboard bets have `points_awarded` set (0, 1, 2, or 4 points)
- Users are shared between both seed scripts


