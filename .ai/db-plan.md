# BetBuddy Database Schema

## Overview

This document defines the PostgreSQL database schema for BetBuddy, a Champions League betting application built on Supabase. The schema supports user authentication, match tracking, betting, scoring, and leaderboard functionality.

**Key Design Principles:**
- Leverages Supabase's built-in `auth.users` table for authentication
- Application-specific data stored in separate `profiles` table
- Complete audit trail for all bet operations (R-023)
- Scalable group architecture supporting future multi-group functionality
- Comprehensive indexing for optimal query performance
- No Row-Level Security (RLS) policies for MVP - access control handled at application layer

---

## 1. Custom Types (ENUMs)

### match_status
PostgreSQL ENUM type for match states.

```sql
CREATE TYPE match_status AS ENUM (
  'scheduled',
  'live',
  'finished',
  'cancelled',
  'postponed'
);
```

### bet_action
PostgreSQL ENUM type for bet log actions.

```sql
CREATE TYPE bet_action AS ENUM (
  'created',
  'updated'
);
```

---

## 2. Tables

### 2.1. profiles

Extends Supabase's `auth.users` table with application-specific user data.

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Primary key for profiles table |
| `user_id` | UUID | NOT NULL, UNIQUE, REFERENCES auth.users(id) ON DELETE CASCADE | Foreign key to Supabase auth.users |
| `nickname` | VARCHAR(15) | NOT NULL, UNIQUE, CHECK (LENGTH(nickname) >= 3 AND nickname ~ '^[a-zA-Z0-9]+$') | Unique alphanumeric nickname (3-15 characters) |
| `is_admin` | BOOLEAN | NOT NULL, DEFAULT FALSE | Admin role flag (manually assigned for MVP) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Profile last update timestamp |

**Notes:**
- Each user must have exactly one profile linked to their `auth.users` record
- Nickname uniqueness enforced at database level to prevent race conditions
- Nickname validation ensures 3-15 alphanumeric characters only
- Admin role is a simple boolean for MVP simplicity

---

### 2.2. groups

Stores user groups. MVP uses a single default group; schema supports future multi-group functionality.

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Primary key |
| `name` | VARCHAR(255) | NOT NULL | Group name |
| `description` | TEXT | NULL | Optional group description |
| `created_by` | UUID | NULL, REFERENCES profiles(id) ON DELETE SET NULL | User who created the group |
| `is_default` | BOOLEAN | NOT NULL, DEFAULT FALSE | Flag indicating default group |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Group creation timestamp |

**Notes:**
- Partial unique index ensures only one default group exists
- `created_by` is nullable to support system-created default group
- Schema designed to support future private group features

---

### 2.3. user_groups

Junction table for many-to-many relationship between users and groups.

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Foreign key to profiles |
| `group_id` | UUID | NOT NULL, REFERENCES groups(id) ON DELETE CASCADE | Foreign key to groups |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when user joined group |

**Primary Key:** Composite primary key on `(user_id, group_id)`

**Notes:**
- Enforces one membership record per user per group
- Supports future multi-group membership
- MVP: All users assigned to single default group

---

### 2.4. matches

Stores Champions League match data fetched from external API (api-football.com).

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Primary key |
| `api_match_id` | VARCHAR(255) | NOT NULL, UNIQUE | External API match identifier |
| `home_team_name` | VARCHAR(255) | NOT NULL | Home team name |
| `home_team_api_id` | VARCHAR(255) | NOT NULL | Home team API identifier |
| `home_team_logo` | TEXT | NULL | URL to home team logo |
| `away_team_name` | VARCHAR(255) | NOT NULL | Away team name |
| `away_team_api_id` | VARCHAR(255) | NOT NULL | Away team API identifier |
| `away_team_logo` | TEXT | NULL | URL to away team logo |
| `home_team_score` | INTEGER | NULL, CHECK (home_team_score >= 0) | Final home team score (nullable for upcoming matches) |
| `away_team_score` | INTEGER | NULL, CHECK (away_team_score >= 0) | Final away team score (nullable for upcoming matches) |
| `kickoff_time` | TIMESTAMPTZ | NOT NULL | Match kickoff time in UTC |
| `status` | match_status | NOT NULL, DEFAULT 'scheduled' | Current match status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Match record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Match record last update timestamp |

**Notes:**
- Team information denormalized for MVP simplicity and performance
- `api_match_id` unique constraint prevents duplicate matches during API synchronization
- Scores are nullable for upcoming matches, populated when match finishes
- `kickoff_time` stored in UTC; application layer handles timezone conversion for display
- Betting deadline (5 minutes before kickoff) calculated in application logic
- Status tracked via ENUM for type safety and performance

---

### 2.5. bets

Stores user score predictions for matches.

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Primary key |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Foreign key to profiles |
| `match_id` | UUID | NOT NULL, REFERENCES matches(id) ON DELETE CASCADE | Foreign key to matches |
| `home_score` | INTEGER | NOT NULL, CHECK (home_score >= 0) | Predicted home team score |
| `away_score` | INTEGER | NOT NULL, CHECK (away_score >= 0) | Predicted away team score |
| `points_awarded` | INTEGER | NULL, CHECK (points_awarded IN (0, 1, 2, 4)) | Calculated points (NULL = not scored yet) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Bet creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Bet last update timestamp |

**Unique Constraint:** `UNIQUE (user_id, match_id)`

**Notes:**
- Unique constraint ensures one active bet per user per match
- Allows bet updates before deadline (handled via UPSERT)
- `points_awarded` is NULL until match finishes and points are calculated
- Points values: 4 (exact score), 2 (correct winner + goal difference or draw), 1 (correct winner only), 0 (incorrect)
- Points recalculated automatically when match scores are updated

---

### 2.6. bet_logs

Complete audit trail of all bet placements and updates (R-023 requirement).

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Primary key |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Foreign key to profiles |
| `match_id` | UUID | NOT NULL, REFERENCES matches(id) ON DELETE CASCADE | Foreign key to matches |
| `home_score` | INTEGER | NOT NULL, CHECK (home_score >= 0) | Predicted home team score at time of action |
| `away_score` | INTEGER | NOT NULL, CHECK (away_score >= 0) | Predicted away team score at time of action |
| `action` | bet_action | NOT NULL | Type of action ('created' or 'updated') |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Log entry timestamp |

**Notes:**
- Independent table with own primary key (not referencing `bets.id`) to preserve complete audit trail
- Automatically populated via database triggers on `bets` table INSERT/UPDATE operations
- Ensures complete auditability without requiring application-level logging
- Stores historical prediction values even if bet is updated multiple times

---

## 3. Relationships

### 3.1. Entity Relationship Diagram

```
auth.users (Supabase)
    │
    │ 1:1
    │
profiles
    │
    │ 1:N
    ├──> bets
    │
    │ N:M
    └──> user_groups <──> groups

matches
    │
    │ 1:N
    └──> bets
         │
         │ 1:N (via triggers)
         └──> bet_logs
```

### 3.2. Relationship Details

**profiles ↔ auth.users (One-to-One)**
- Each profile links to exactly one `auth.users` record via `user_id`
- Cascade delete: Deleting auth user deletes profile

**profiles ↔ groups (Many-to-Many via user_groups)**
- Users can belong to multiple groups (future feature)
- MVP: All users in single default group
- Junction table: `user_groups` with composite primary key

**profiles ↔ bets (One-to-Many)**
- Each user can place multiple bets (one per match)
- Cascade delete: Deleting user deletes all their bets

**matches ↔ bets (One-to-Many)**
- Each match can have multiple bets (one per user)
- Cascade delete: Deleting match deletes all related bets

**bets ↔ bet_logs (One-to-Many via triggers)**
- Each bet operation (INSERT/UPDATE) creates log entry
- Logs are independent and preserve complete history

**profiles ↔ bet_logs (One-to-Many)**
- Each user can have multiple log entries
- Cascade delete: Deleting user deletes all their log entries

**matches ↔ bet_logs (One-to-Many)**
- Each match can have multiple log entries
- Cascade delete: Deleting match deletes all related log entries

**groups ↔ profiles (Many-to-Many via user_groups)**
- Each group can have multiple members
- Cascade delete: Deleting group removes all memberships

---

## 4. Indexes

### 4.1. Primary Key Indexes
Automatically created by PostgreSQL for all PRIMARY KEY constraints:
- `profiles_pkey` on `profiles(id)`
- `groups_pkey` on `groups(id)`
- `user_groups_pkey` on `user_groups(user_id, group_id)`
- `matches_pkey` on `matches(id)`
- `bets_pkey` on `bets(id)`
- `bet_logs_pkey` on `bet_logs(id)`

### 4.2. Unique Indexes
Automatically created for UNIQUE constraints:
- `profiles_user_id_key` on `profiles(user_id)`
- `profiles_nickname_key` on `profiles(nickname)`
- `matches_api_match_id_key` on `matches(api_match_id)`
- `bets_user_id_match_id_key` on `bets(user_id, match_id)`

### 4.3. Performance Indexes

**bets table:**
```sql
CREATE INDEX idx_bets_user_id_match_id ON bets(user_id, match_id);
-- Covered by unique constraint, but explicit for clarity

CREATE INDEX idx_bets_match_id ON bets(match_id);
-- For queries filtering bets by match

CREATE INDEX idx_bets_user_id_points_awarded ON bets(user_id, points_awarded DESC);
-- For leaderboard calculations and user point queries
```

**matches table:**
```sql
CREATE INDEX idx_matches_kickoff_time ON matches(kickoff_time);
-- For filtering upcoming matches and deadline calculations

CREATE INDEX idx_matches_status ON matches(status);
-- For filtering matches by status

CREATE INDEX idx_matches_status_kickoff_time ON matches(status, kickoff_time)
WHERE status IN ('scheduled', 'live');
-- Partial index for upcoming matches (scheduled or live)
```

**bet_logs table:**
```sql
CREATE INDEX idx_bet_logs_user_id_created_at ON bet_logs(user_id, created_at DESC);
-- For user bet history queries
```

**profiles table:**
```sql
CREATE INDEX idx_profiles_nickname ON profiles(nickname);
-- Covered by unique constraint, but explicit for clarity
```

**groups table:**
```sql
CREATE UNIQUE INDEX idx_groups_is_default_unique ON groups(is_default)
WHERE is_default = TRUE;
-- Partial unique index ensuring only one default group exists
```

---

## 5. Database Triggers

### 5.1. bet_logs Trigger Function

Automatically logs all bet INSERT and UPDATE operations to `bet_logs` table.

```sql
CREATE OR REPLACE FUNCTION log_bet_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO bet_logs (user_id, match_id, home_score, away_score, action)
    VALUES (NEW.user_id, NEW.match_id, NEW.home_score, NEW.away_score, 'created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO bet_logs (user_id, match_id, home_score, away_score, action)
    VALUES (NEW.user_id, NEW.match_id, NEW.home_score, NEW.away_score, 'updated');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 5.2. bet_logs Trigger

Attaches trigger function to `bets` table.

```sql
CREATE TRIGGER trigger_log_bet_action
  AFTER INSERT OR UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION log_bet_action();
```

### 5.3. Updated At Triggers

Automatically update `updated_at` timestamp on row modification.

**profiles table:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**matches table:**
```sql
CREATE TRIGGER trigger_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**bets table:**
```sql
CREATE TRIGGER trigger_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Row-Level Security (RLS)

**Status:** No RLS policies required for MVP.

**Rationale:**
- Access control handled at application layer
- Admin functions protected by application-level role checks
- MVP user base is small and trusted (closed group of friends)
- Future consideration: Implement RLS for multi-group privacy when private groups feature is added

---

## 7. Additional Design Notes

### 7.1. Authentication Architecture
- Leverages Supabase's built-in third-party authentication (Google, Facebook, Apple)
- Application-specific data cleanly separated into `profiles` table
- Follows Supabase best practices for auth integration

### 7.2. Scoring System
- Points calculated in application logic based on rules:
  - 4 points: Exact score match
  - 2 points: Correct winner + goal difference OR correct draw prediction
  - 1 point: Correct winner only
  - 0 points: Incorrect prediction
- Points stored in `bets.points_awarded` column
- Points recalculated automatically when match scores are updated (live updates or admin overrides)

### 7.3. Leaderboard Calculation
- Calculated on-the-fly using aggregation: `SUM(points_awarded) GROUP BY user_id`
- Joined with `profiles` table to get nicknames
- Expected to perform well for MVP user base size
- Future consideration: Materialized view if user base grows significantly

### 7.4. Timezone Handling
- All timestamps stored as `TIMESTAMPTZ` in UTC
- Application layer handles conversion to user's local timezone for display
- Ensures accurate deadline calculations regardless of user location
- Betting deadline (5 minutes before kickoff) calculated in application logic

### 7.5. API Synchronization
- `api_match_id` with UNIQUE constraint prevents duplicate matches
- Enables efficient lookups during API sync operations
- Supports idempotent match updates

### 7.6. Data Integrity
- Database-level constraints ensure nickname uniqueness and validation
- Unique constraints prevent duplicate bets and API match synchronization issues
- Foreign key relationships maintain referential integrity
- ENUM types provide type safety for match status and bet log actions
- Trigger-based audit logging ensures complete bet history

### 7.7. Future Scalability Considerations
- Schema designed with group support for future multi-group functionality
- Groups table structure allows for future features (descriptions, creator tracking)
- User-groups junction table supports many-to-many relationships
- Team data currently denormalized but can be normalized to `teams` table if needed
- Leaderboard calculation can be optimized with materialized views if required

### 7.8. MVP Setup Requirements
1. Create default group with `is_default = TRUE`
2. Assign all new users to default group via `user_groups` table
3. Manually assign admin role by setting `is_admin = TRUE` in `profiles` table
4. Ensure Supabase authentication is configured for third-party providers

---

## 8. Migration Order

When creating database migrations, follow this order:

1. Create custom types (ENUMs)
2. Create tables (profiles, groups, user_groups, matches, bets, bet_logs)
3. Create indexes
4. Create trigger functions
5. Create triggers
6. Insert default group data
7. Create initial admin user (if needed)

---

## 9. Example Queries

### 9.1. Leaderboard Query
```sql
SELECT 
  p.nickname,
  COALESCE(SUM(b.points_awarded), 0) AS total_points,
  COUNT(b.id) FILTER (WHERE b.points_awarded IS NOT NULL) AS matches_bet
FROM profiles p
LEFT JOIN bets b ON p.id = b.user_id
GROUP BY p.id, p.nickname
ORDER BY total_points DESC, p.nickname ASC;
```

### 9.2. Upcoming Matches Query
```sql
SELECT 
  m.*,
  (m.kickoff_time - INTERVAL '5 minutes') AS betting_deadline
FROM matches m
WHERE m.status IN ('scheduled', 'live')
  AND m.kickoff_time > NOW()
ORDER BY m.kickoff_time ASC;
```

### 9.3. User Bet History Query
```sql
SELECT 
  m.home_team_name,
  m.away_team_name,
  m.home_team_score,
  m.away_team_score,
  b.home_score AS predicted_home,
  b.away_score AS predicted_away,
  b.points_awarded
FROM bets b
JOIN matches m ON b.match_id = m.id
WHERE b.user_id = $1
  AND m.status = 'finished'
ORDER BY m.kickoff_time DESC;
```

---

## 10. Version History

- **v1.0** - Initial schema design for MVP
  - Core tables: profiles, groups, user_groups, matches, bets, bet_logs
  - Comprehensive indexing strategy
  - Trigger-based audit logging
  - Support for future multi-group functionality

