-- ============================================================================
-- Migration: Initial BetBuddy Database Schema
-- ============================================================================
-- Purpose: Creates the complete database schema for BetBuddy Champions League
--          betting application
-- 
-- Affected Tables:
--   - profiles: User profiles extending Supabase auth.users
--   - groups: User groups (MVP uses single default group)
--   - user_groups: Junction table for user-group relationships
--   - matches: Champions League match data from external API
--   - bets: User score predictions for matches
--   - bet_logs: Complete audit trail of all bet operations
--
-- Custom Types:
--   - match_status: ENUM for match states
--   - bet_action: ENUM for bet log actions
--
-- Special Considerations:
--   - RLS enabled on all tables with public access policies
--   - Trigger-based audit logging for bet operations
--   - Automatic updated_at timestamp management
--   - Default group creation for MVP
-- ============================================================================

-- ============================================================================
-- 1. CREATE CUSTOM TYPES (ENUMs)
-- ============================================================================

-- match_status: enum type for match states
create type match_status as enum (
  'scheduled',
  'live',
  'finished',
  'cancelled',
  'postponed'
);

-- bet_action: enum type for bet log actions
create type bet_action as enum (
  'created',
  'updated'
);

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- profiles: extends Supabase auth.users with application-specific user data
-- each user must have exactly one profile linked to their auth.users record
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nickname varchar(15) not null unique check (length(nickname) >= 3 and nickname ~ '^[a-zA-Z0-9]+$'),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'user profiles extending Supabase auth.users with application-specific data';
comment on column profiles.user_id is 'foreign key to Supabase auth.users table';
comment on column profiles.nickname is 'unique alphanumeric nickname (3-15 characters)';
comment on column profiles.is_admin is 'admin role flag (manually assigned for MVP)';

-- groups: stores user groups (MVP uses single default group, schema supports future multi-group functionality)
create table groups (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  description text,
  created_by uuid references profiles(id) on delete set null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table groups is 'user groups (MVP uses single default group)';
comment on column groups.is_default is 'flag indicating default group (only one default group allowed)';
comment on column groups.created_by is 'user who created the group (nullable for system-created default group)';

-- user_groups: junction table for many-to-many relationship between users and groups
create table user_groups (
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

comment on table user_groups is 'junction table for many-to-many relationship between users and groups';
comment on column user_groups.joined_at is 'timestamp when user joined group';

-- matches: stores Champions League match data fetched from external API (api-football.com)
create table matches (
  id uuid primary key default gen_random_uuid(),
  api_match_id varchar(255) not null unique,
  home_team_name varchar(255) not null,
  home_team_api_id varchar(255) not null,
  home_team_logo text,
  away_team_name varchar(255) not null,
  away_team_api_id varchar(255) not null,
  away_team_logo text,
  home_team_score integer check (home_team_score >= 0),
  away_team_score integer check (away_team_score >= 0),
  kickoff_time timestamptz not null,
  status match_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table matches is 'Champions League match data from external API';
comment on column matches.api_match_id is 'external API match identifier (unique constraint prevents duplicates)';
comment on column matches.home_team_score is 'final home team score (nullable for upcoming matches)';
comment on column matches.away_team_score is 'final away team score (nullable for upcoming matches)';
comment on column matches.kickoff_time is 'match kickoff time in UTC (application layer handles timezone conversion)';
comment on column matches.status is 'current match status (betting deadline calculated in application logic)';

-- bets: stores user score predictions for matches
create table bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points_awarded integer check (points_awarded in (0, 1, 2, 4)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

comment on table bets is 'user score predictions for matches';
comment on column bets.home_score is 'predicted home team score';
comment on column bets.away_score is 'predicted away team score';
comment on column bets.points_awarded is 'calculated points (NULL = not scored yet). values: 4 (exact), 2 (winner+gd or draw), 1 (winner only), 0 (incorrect)';
comment on constraint bets_user_id_match_id_key on bets is 'unique constraint ensures one active bet per user per match (allows updates before deadline)';

-- bet_logs: complete audit trail of all bet placements and updates (R-023 requirement)
create table bet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  action bet_action not null,
  created_at timestamptz not null default now()
);

comment on table bet_logs is 'complete audit trail of all bet operations (automatically populated via triggers)';
comment on column bet_logs.action is 'type of action: created or updated';
comment on column bet_logs.home_score is 'predicted home team score at time of action';
comment on column bet_logs.away_score is 'predicted away team score at time of action';

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- bets table indexes
-- covered by unique constraint, but explicit for clarity
create index idx_bets_user_id_match_id on bets(user_id, match_id);

-- for queries filtering bets by match
create index idx_bets_match_id on bets(match_id);

-- for leaderboard calculations and user point queries
create index idx_bets_user_id_points_awarded on bets(user_id, points_awarded desc);

-- matches table indexes
-- for filtering upcoming matches and deadline calculations
create index idx_matches_kickoff_time on matches(kickoff_time);

-- for filtering matches by status
create index idx_matches_status on matches(status);

-- partial index for upcoming matches (scheduled or live)
create index idx_matches_status_kickoff_time on matches(status, kickoff_time)
where status in ('scheduled', 'live');

-- bet_logs table indexes
-- for user bet history queries
create index idx_bet_logs_user_id_created_at on bet_logs(user_id, created_at desc);

-- profiles table indexes
-- covered by unique constraint, but explicit for clarity
create index idx_profiles_nickname on profiles(nickname);

-- groups table indexes
-- partial unique index ensuring only one default group exists
create unique index idx_groups_is_default_unique on groups(is_default)
where is_default = true;

-- ============================================================================
-- 4. CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- update_updated_at_column: automatically updates updated_at timestamp on row modification
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function update_updated_at_column() is 'automatically updates updated_at timestamp on row modification';

-- log_bet_action: automatically logs all bet INSERT and UPDATE operations to bet_logs table
create or replace function log_bet_action()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into bet_logs (user_id, match_id, home_score, away_score, action)
    values (new.user_id, new.match_id, new.home_score, new.away_score, 'created');
    return new;
  elsif tg_op = 'UPDATE' then
    insert into bet_logs (user_id, match_id, home_score, away_score, action)
    values (new.user_id, new.match_id, new.home_score, new.away_score, 'updated');
    return new;
  end if;
  return null;
end;
$$ language plpgsql;

comment on function log_bet_action() is 'automatically logs all bet INSERT and UPDATE operations to bet_logs table for complete audit trail';

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- profiles table: automatically update updated_at on row modification
create trigger trigger_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- matches table: automatically update updated_at on row modification
create trigger trigger_matches_updated_at
  before update on matches
  for each row
  execute function update_updated_at_column();

-- bets table: automatically update updated_at on row modification
create trigger trigger_bets_updated_at
  before update on bets
  for each row
  execute function update_updated_at_column();

-- bets table: automatically log all bet operations to bet_logs
create trigger trigger_log_bet_action
  after insert or update on bets
  for each row
  execute function log_bet_action();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- enable RLS on all tables (required even for public access in MVP)
alter table profiles enable row level security;
alter table groups enable row level security;
alter table user_groups enable row level security;
alter table matches enable row level security;
alter table bets enable row level security;
alter table bet_logs enable row level security;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- profiles table policies
-- select policy for anon: public read access
create policy "profiles_select_anon" on profiles
  for select
  to anon
  using (true);

comment on policy "profiles_select_anon" on profiles is 'allows anonymous users to read profiles (public access for MVP)';

-- select policy for authenticated: public read access
create policy "profiles_select_authenticated" on profiles
  for select
  to authenticated
  using (true);

comment on policy "profiles_select_authenticated" on profiles is 'allows authenticated users to read profiles (public access for MVP)';

-- insert policy for anon: allow profile creation
create policy "profiles_insert_anon" on profiles
  for insert
  to anon
  with check (true);

comment on policy "profiles_insert_anon" on profiles is 'allows anonymous users to create profiles (public access for MVP)';

-- insert policy for authenticated: allow profile creation
create policy "profiles_insert_authenticated" on profiles
  for insert
  to authenticated
  with check (true);

comment on policy "profiles_insert_authenticated" on profiles is 'allows authenticated users to create profiles (public access for MVP)';

-- update policy for anon: allow profile updates
create policy "profiles_update_anon" on profiles
  for update
  to anon
  using (true)
  with check (true);

comment on policy "profiles_update_anon" on profiles is 'allows anonymous users to update profiles (public access for MVP)';

-- update policy for authenticated: allow profile updates
create policy "profiles_update_authenticated" on profiles
  for update
  to authenticated
  using (true)
  with check (true);

comment on policy "profiles_update_authenticated" on profiles is 'allows authenticated users to update profiles (public access for MVP)';

-- delete policy for anon: allow profile deletion
create policy "profiles_delete_anon" on profiles
  for delete
  to anon
  using (true);

comment on policy "profiles_delete_anon" on profiles is 'allows anonymous users to delete profiles (public access for MVP)';

-- delete policy for authenticated: allow profile deletion
create policy "profiles_delete_authenticated" on profiles
  for delete
  to authenticated
  using (true);

comment on policy "profiles_delete_authenticated" on profiles is 'allows authenticated users to delete profiles (public access for MVP)';

-- groups table policies
-- select policy for anon: public read access
create policy "groups_select_anon" on groups
  for select
  to anon
  using (true);

comment on policy "groups_select_anon" on groups is 'allows anonymous users to read groups (public access for MVP)';

-- select policy for authenticated: public read access
create policy "groups_select_authenticated" on groups
  for select
  to authenticated
  using (true);

comment on policy "groups_select_authenticated" on groups is 'allows authenticated users to read groups (public access for MVP)';

-- insert policy for anon: allow group creation
create policy "groups_insert_anon" on groups
  for insert
  to anon
  with check (true);

comment on policy "groups_insert_anon" on groups is 'allows anonymous users to create groups (public access for MVP)';

-- insert policy for authenticated: allow group creation
create policy "groups_insert_authenticated" on groups
  for insert
  to authenticated
  with check (true);

comment on policy "groups_insert_authenticated" on groups is 'allows authenticated users to create groups (public access for MVP)';

-- update policy for anon: allow group updates
create policy "groups_update_anon" on groups
  for update
  to anon
  using (true)
  with check (true);

comment on policy "groups_update_anon" on groups is 'allows anonymous users to update groups (public access for MVP)';

-- update policy for authenticated: allow group updates
create policy "groups_update_authenticated" on groups
  for update
  to authenticated
  using (true)
  with check (true);

comment on policy "groups_update_authenticated" on groups is 'allows authenticated users to update groups (public access for MVP)';

-- delete policy for anon: allow group deletion
create policy "groups_delete_anon" on groups
  for delete
  to anon
  using (true);

comment on policy "groups_delete_anon" on groups is 'allows anonymous users to delete groups (public access for MVP)';

-- delete policy for authenticated: allow group deletion
create policy "groups_delete_authenticated" on groups
  for delete
  to authenticated
  using (true);

comment on policy "groups_delete_authenticated" on groups is 'allows authenticated users to delete groups (public access for MVP)';

-- user_groups table policies
-- select policy for anon: public read access
create policy "user_groups_select_anon" on user_groups
  for select
  to anon
  using (true);

comment on policy "user_groups_select_anon" on user_groups is 'allows anonymous users to read user-group relationships (public access for MVP)';

-- select policy for authenticated: public read access
create policy "user_groups_select_authenticated" on user_groups
  for select
  to authenticated
  using (true);

comment on policy "user_groups_select_authenticated" on user_groups is 'allows authenticated users to read user-group relationships (public access for MVP)';

-- insert policy for anon: allow user-group assignment
create policy "user_groups_insert_anon" on user_groups
  for insert
  to anon
  with check (true);

comment on policy "user_groups_insert_anon" on user_groups is 'allows anonymous users to assign users to groups (public access for MVP)';

-- insert policy for authenticated: allow user-group assignment
create policy "user_groups_insert_authenticated" on user_groups
  for insert
  to authenticated
  with check (true);

comment on policy "user_groups_insert_authenticated" on user_groups is 'allows authenticated users to assign users to groups (public access for MVP)';

-- update policy for anon: allow user-group updates
create policy "user_groups_update_anon" on user_groups
  for update
  to anon
  using (true)
  with check (true);

comment on policy "user_groups_update_anon" on user_groups is 'allows anonymous users to update user-group relationships (public access for MVP)';

-- update policy for authenticated: allow user-group updates
create policy "user_groups_update_authenticated" on user_groups
  for update
  to authenticated
  using (true)
  with check (true);

comment on policy "user_groups_update_authenticated" on user_groups is 'allows authenticated users to update user-group relationships (public access for MVP)';

-- delete policy for anon: allow user-group removal
create policy "user_groups_delete_anon" on user_groups
  for delete
  to anon
  using (true);

comment on policy "user_groups_delete_anon" on user_groups is 'allows anonymous users to remove users from groups (public access for MVP)';

-- delete policy for authenticated: allow user-group removal
create policy "user_groups_delete_authenticated" on user_groups
  for delete
  to authenticated
  using (true);

comment on policy "user_groups_delete_authenticated" on user_groups is 'allows authenticated users to remove users from groups (public access for MVP)';

-- matches table policies
-- select policy for anon: public read access
create policy "matches_select_anon" on matches
  for select
  to anon
  using (true);

comment on policy "matches_select_anon" on matches is 'allows anonymous users to read matches (public access for MVP)';

-- select policy for authenticated: public read access
create policy "matches_select_authenticated" on matches
  for select
  to authenticated
  using (true);

comment on policy "matches_select_authenticated" on matches is 'allows authenticated users to read matches (public access for MVP)';

-- insert policy for anon: allow match creation
create policy "matches_insert_anon" on matches
  for insert
  to anon
  with check (true);

comment on policy "matches_insert_anon" on matches is 'allows anonymous users to create matches (public access for MVP)';

-- insert policy for authenticated: allow match creation
create policy "matches_insert_authenticated" on matches
  for insert
  to authenticated
  with check (true);

comment on policy "matches_insert_authenticated" on matches is 'allows authenticated users to create matches (public access for MVP)';

-- update policy for anon: allow match updates
create policy "matches_update_anon" on matches
  for update
  to anon
  using (true)
  with check (true);

comment on policy "matches_update_anon" on matches is 'allows anonymous users to update matches (public access for MVP)';

-- update policy for authenticated: allow match updates
create policy "matches_update_authenticated" on matches
  for update
  to authenticated
  using (true)
  with check (true);

comment on policy "matches_update_authenticated" on matches is 'allows authenticated users to update matches (public access for MVP)';

-- delete policy for anon: allow match deletion
create policy "matches_delete_anon" on matches
  for delete
  to anon
  using (true);

comment on policy "matches_delete_anon" on matches is 'allows anonymous users to delete matches (public access for MVP)';

-- delete policy for authenticated: allow match deletion
create policy "matches_delete_authenticated" on matches
  for delete
  to authenticated
  using (true);

comment on policy "matches_delete_authenticated" on matches is 'allows authenticated users to delete matches (public access for MVP)';

-- bets table policies
-- select policy for anon: public read access
create policy "bets_select_anon" on bets
  for select
  to anon
  using (true);

comment on policy "bets_select_anon" on bets is 'allows anonymous users to read bets (public access for MVP)';

-- select policy for authenticated: public read access
create policy "bets_select_authenticated" on bets
  for select
  to authenticated
  using (true);

comment on policy "bets_select_authenticated" on bets is 'allows authenticated users to read bets (public access for MVP)';

-- insert policy for anon: allow bet creation
create policy "bets_insert_anon" on bets
  for insert
  to anon
  with check (true);

comment on policy "bets_insert_anon" on bets is 'allows anonymous users to create bets (public access for MVP)';

-- insert policy for authenticated: allow bet creation
create policy "bets_insert_authenticated" on bets
  for insert
  to authenticated
  with check (true);

comment on policy "bets_insert_authenticated" on bets is 'allows authenticated users to create bets (public access for MVP)';

-- update policy for anon: allow bet updates
create policy "bets_update_anon" on bets
  for update
  to anon
  using (true)
  with check (true);

comment on policy "bets_update_anon" on bets is 'allows anonymous users to update bets (public access for MVP)';

-- update policy for authenticated: allow bet updates
create policy "bets_update_authenticated" on bets
  for update
  to authenticated
  using (true)
  with check (true);

comment on policy "bets_update_authenticated" on bets is 'allows authenticated users to update bets (public access for MVP)';

-- delete policy for anon: allow bet deletion
create policy "bets_delete_anon" on bets
  for delete
  to anon
  using (true);

comment on policy "bets_delete_anon" on bets is 'allows anonymous users to delete bets (public access for MVP)';

-- delete policy for authenticated: allow bet deletion
create policy "bets_delete_authenticated" on bets
  for delete
  to authenticated
  using (true);

comment on policy "bets_delete_authenticated" on bets is 'allows authenticated users to delete bets (public access for MVP)';

-- bet_logs table policies
-- select policy for anon: public read access
create policy "bet_logs_select_anon" on bet_logs
  for select
  to anon
  using (true);

comment on policy "bet_logs_select_anon" on bet_logs is 'allows anonymous users to read bet logs (public access for MVP)';

-- select policy for authenticated: public read access
create policy "bet_logs_select_authenticated" on bet_logs
  for select
  to authenticated
  using (true);

comment on policy "bet_logs_select_authenticated" on bet_logs is 'allows authenticated users to read bet logs (public access for MVP)';

-- insert policy for anon: allow bet log creation (typically via triggers, but policy required)
create policy "bet_logs_insert_anon" on bet_logs
  for insert
  to anon
  with check (true);

comment on policy "bet_logs_insert_anon" on bet_logs is 'allows anonymous users to create bet logs (typically via triggers, but policy required for RLS)';

-- insert policy for authenticated: allow bet log creation (typically via triggers, but policy required)
create policy "bet_logs_insert_authenticated" on bet_logs
  for insert
  to authenticated
  with check (true);

comment on policy "bet_logs_insert_authenticated" on bet_logs is 'allows authenticated users to create bet logs (typically via triggers, but policy required for RLS)';

-- update policy for anon: bet logs are append-only (no updates allowed)
-- no update policy needed as bet_logs should not be updated

-- update policy for authenticated: bet logs are append-only (no updates allowed)
-- no update policy needed as bet_logs should not be updated

-- delete policy for anon: bet logs are append-only (no deletes allowed)
-- no delete policy needed as bet_logs should not be deleted

-- delete policy for authenticated: bet logs are append-only (no deletes allowed)
-- no delete policy needed as bet_logs should not be deleted

-- ============================================================================
-- 8. INSERT DEFAULT DATA
-- ============================================================================

-- create default group for MVP (all users will be assigned to this group)
insert into groups (name, description, is_default)
values (
  'Default Group',
  'Default group for all BetBuddy users',
  true
);

comment on table groups is 'default group created for MVP - all users should be assigned to this group via user_groups table';

