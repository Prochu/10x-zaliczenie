<conversation_summary>
<decisions>
Use Supabase's built-in auth.users table for authentication, with a separate profiles table linked via foreign key to store application-specific user data (nickname, admin role, group membership).
Enforce nickname uniqueness at the database level using a UNIQUE constraint, with a CHECK constraint ensuring 3-15 alphanumeric characters.
Represent admin role as a BOOLEAN column is_admin (default FALSE) in the profiles table for MVP simplicity.
Store match scores in a single matches table with home_team_score and away_team_score columns (INTEGER, nullable for upcoming matches), along with team information: home_team_name, home_team_api_id, home_team_logo, away_team_name, away_team_api_id, away_team_logo.
Create a bets table with foreign keys to users.id and matches.id, storing home_score and away_score predictions, with a UNIQUE constraint on (user_id, match_id) to prevent duplicate bets per user per match.
Create a separate bet_logs table for audit trail, automatically populated via database triggers on bets table INSERT/UPDATE operations, storing timestamp, user_id, match_id, prediction values, and action type.
Store calculated points directly in the bets table as a points_awarded column (INTEGER, nullable, default NULL) to indicate unscored bets vs. zero-point bets.
Implement user-to-group relationship as a many-to-many junction table user_groups with composite primary key on (user_id, group_id), supporting future multi-group membership while MVP assigns all users to a single default group.
Implement comprehensive indexing strategy including indexes on: bets(user_id, match_id), bets(match_id), matches(kickoff_time), matches(status), bet_logs(user_id, created_at DESC), profiles(nickname), and bets(user_id, points_awarded DESC).
No Row-Level Security (RLS) policies required for MVP - access control will be handled at the application layer.
Store kickoff_time as TIMESTAMPTZ in UTC in the database, with application layer handling timezone conversion for display.
Use PostgreSQL ENUM type for match_status with values ('scheduled', 'live', 'finished', 'cancelled', 'postponed').
Store external API match ID as api_match_id column with UNIQUE constraint in the matches table for synchronization and duplicate prevention.
Calculate betting deadline (kickoff_time - 5 minutes) in application logic rather than storing as a database column.
Calculate leaderboard on-the-fly using aggregation queries rather than materialized views, given expected small user base for MVP.
Make bet_logs table independent with its own primary key, not referencing bets.id directly, to preserve complete audit trail.
Include additional columns in groups table: description (TEXT, nullable), created_by (UUID, foreign key to profiles.id, nullable), and is_default (BOOLEAN) with unique partial index to ensure only one default group exists.
</decisions>
<matched_recommendations>
Authentication Architecture: Separate Supabase auth from application data using auth.users and profiles table pattern - provides clean separation of concerns and follows Supabase best practices.
Data Integrity: Database-level constraints for nickname uniqueness and validation - prevents race conditions and ensures data consistency.
Simplified Role Management: Boolean is_admin column for MVP - keeps schema simple while allowing future extensibility to role-based system.
Match Data Structure: Single matches table with team information stored directly - balances normalization with MVP simplicity and performance needs.
Bet Management: Unique constraint on (user_id, match_id) in bets table - ensures one active prediction per user per match while allowing updates before deadline.
Audit Trail: Separate bet_logs table with trigger-based population - ensures complete auditability as required by R-023 without requiring application-level logging.
Points Storage: Nullable points_awarded in bets table - enables efficient leaderboard queries while clearly distinguishing unscored vs. zero-point bets.
Scalable Group Architecture: Many-to-many user_groups junction table - supports future multi-group functionality without schema changes.
Performance Optimization: Comprehensive indexing strategy - ensures fast queries for leaderboard, match filtering, and user bet lookups.
Timezone Handling: TIMESTAMPTZ storage in UTC - leverages PostgreSQL's timezone capabilities for accurate deadline calculations and display conversions.
Type Safety: ENUM for match status - provides better performance and type safety compared to VARCHAR with CHECK constraints.
API Synchronization: Unique api_match_id constraint - prevents duplicate matches during API sync and enables efficient lookups.
Flexible Group Management: Extended groups table structure - prepares for future features like group descriptions, creator tracking, and default group management.
</matched_recommendations>
<database_planning_summary>
Overview
Database schema planning for BetBuddy MVP, a Champions League betting application using Supabase (PostgreSQL) as the backend. The schema supports user authentication, match tracking, betting, scoring, and leaderboard functionality.
Key Entities and Relationships
Core Entities
profiles (extends Supabase auth.users)
Links to auth.users.id via foreign key
Stores: id (UUID, PK), user_id (FK to auth.users), nickname (VARCHAR, unique, 3-15 alphanumeric), is_admin (BOOLEAN, default FALSE), created_at, updated_at
All users belong to groups via user_groups junction table
groups
Stores: id (UUID, PK), name (VARCHAR), description (TEXT, nullable), created_by (UUID, FK to profiles.id, nullable), is_default (BOOLEAN), created_at
MVP: Single default group for all users
Future: Support for multiple private groups
user_groups (junction table)
Many-to-many relationship between users and groups
Composite PK on (user_id, group_id)
Stores: user_id (FK to profiles.id), group_id (FK to groups.id), joined_at (TIMESTAMPTZ)
matches
Stores Champions League match data from external API
Columns: id (UUID, PK), api_match_id (VARCHAR/BIGINT, UNIQUE), home_team_name, home_team_api_id, home_team_logo, away_team_name, away_team_api_id, away_team_logo, home_team_score (INTEGER, nullable), away_team_score (INTEGER, nullable), kickoff_time (TIMESTAMPTZ, UTC), status (ENUM: 'scheduled', 'live', 'finished', 'cancelled', 'postponed'), created_at, updated_at
Scores are nullable for upcoming matches, populated when match finishes
bets
Stores user predictions for matches
Columns: id (UUID, PK), user_id (FK to profiles.id), match_id (FK to matches.id), home_score (INTEGER), away_score (INTEGER), points_awarded (INTEGER, nullable, default NULL), created_at, updated_at
UNIQUE constraint on (user_id, match_id) ensures one active bet per user per match
points_awarded is NULL until match finishes and points are calculated (0, 1, 2, or 4)
bet_logs
Complete audit trail of all bet placements and updates (R-023 requirement)
Independent table with own PK, not referencing bets.id
Columns: id (UUID, PK), user_id (FK to profiles.id), match_id (FK to matches.id), home_score (INTEGER), away_score (INTEGER), action (ENUM: 'created', 'updated'), created_at
Populated automatically via database triggers on bets table
Key Design Decisions
Authentication & User Management
Leverages Supabase's built-in third-party authentication (Google, Facebook, Apple)
Application-specific data separated into profiles table
Admin role managed via boolean flag, manually assigned in database for MVP
Betting System
Single active bet per user per match enforced by unique constraint
Betting deadline (5 minutes before kickoff) calculated in application logic
Complete audit trail maintained in bet_logs via triggers
Scoring System
Points stored directly in bets.points_awarded column
Scoring rules: 4 points (exact score), 2 points (correct winner + goal difference or draw), 1 point (correct winner only)
Points recalculated automatically when match scores are updated (live updates or admin overrides)
Leaderboard
Calculated on-the-fly using aggregation: SUM(points_awarded) grouped by user_id
Joined with profiles table to get nicknames
Expected to perform well for MVP user base size
Match Data Management
Team information stored directly in matches table (denormalized for MVP simplicity)
External API synchronization via api_match_id with unique constraint
Match status tracked via ENUM type for type safety
Security Considerations
No Row-Level Security (RLS) policies required for MVP
Access control handled at application layer
Admin functions protected by application-level role checks
Performance & Scalability
Indexing Strategy
bets(user_id, match_id) - unique constraint and user bet lookups
bets(match_id) - match-based queries
matches(kickoff_time) - filtering upcoming matches and deadline calculations
matches(status) - filtering by match state
bet_logs(user_id, created_at DESC) - user bet history queries
profiles(nickname) - uniqueness checks and leaderboard queries
bets(user_id, points_awarded DESC) - leaderboard calculations
Consider partial index on matches(status) WHERE status IN ('scheduled', 'live') for upcoming matches
Future Scalability Considerations
Schema designed with group_id support for future multi-group functionality
Groups table structure allows for future features (descriptions, creator tracking)
User-groups junction table supports many-to-many relationships
Team data currently denormalized but can be normalized to teams table if needed
Data Integrity
Database-level constraints ensure nickname uniqueness and validation
Unique constraints prevent duplicate bets and API match synchronization issues
Foreign key relationships maintain referential integrity
ENUM types provide type safety for match status and bet log actions
Trigger-based audit logging ensures complete bet history
Timezone Handling
All timestamps stored as TIMESTAMPTZ in UTC
Application layer handles conversion to user's local timezone for display
Ensures accurate deadline calculations regardless of user location
</database_planning_summary>
<unresolved_issues>
None identified. All database design questions have been addressed through the conversation, and decisions have been made for all key aspects of the schema including entity structure, relationships, data types, constraints, indexing, and architectural patterns.
</unresolved_issues>
</conversation_summary>