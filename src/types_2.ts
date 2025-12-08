import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

// ============================================================================
// Database Entity Types (Base Types from Database)
// ============================================================================

/**
 * Profile entity - User profile extending Supabase auth.users
 * Source: Tables<"profiles">
 */
export type ProfileEntity = Tables<"profiles">;

/**
 * Match entity - Champions League match information
 * Source: Tables<"matches">
 */
export type MatchEntity = Tables<"matches">;

/**
 * Bet entity - User score predictions for matches
 * Source: Tables<"bets">
 */
export type BetEntity = Tables<"bets">;

/**
 * BetLog entity - Audit trail of bet operations
 * Source: Tables<"bet_logs">
 */
export type BetLogEntity = Tables<"bet_logs">;

/**
 * Group entity - User groups
 * Source: Tables<"groups">
 */
export type GroupEntity = Tables<"groups">;

/**
 * UserGroup entity - User-group memberships
 * Source: Tables<"user_groups">
 */
export type UserGroupEntity = Tables<"user_groups">;

/**
 * Match status enum values
 * Source: Enums<"match_status">
 */
export type MatchStatus = Enums<"match_status">;

/**
 * Bet action enum values for audit logging
 * Source: Enums<"bet_action">
 */
export type BetAction = Enums<"bet_action">;

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Full profile DTO - All profile information
 * API Usage: GET /api/profiles/me, POST /api/profiles/me/nickname response
 * Derived from: ProfileEntity (complete entity)
 */
export type ProfileDTO = ProfileEntity;

/**
 * Public profile DTO - Limited profile information for public display
 * API Usage: GET /api/profiles/:id response
 * Derived from: ProfileEntity (Pick subset of fields)
 */
export type PublicProfileDTO = Pick<ProfileEntity, "id" | "nickname" | "created_at">;

/**
 * Session response DTO - Contains authenticated user profile
 * API Usage: POST /api/auth/session response
 * Derived from: ProfileDTO wrapped in user object
 */
export interface SessionResponseDTO {
  user: ProfileDTO;
}

// ============================================================================
// Profile Command Models
// ============================================================================

/**
 * Command to create or update user nickname
 * API Usage: POST /api/profiles/me/nickname request
 * Validation: 3-15 characters, alphanumeric only, unique
 */
export interface UpdateNicknameCommand {
  nickname: string;
}

// ============================================================================
// Match DTOs
// ============================================================================

/**
 * User bet summary embedded in match responses
 * API Usage: Embedded in MatchDTO
 * Derived from: BetEntity (Pick specific fields)
 */
export type UserBetSummaryDTO = Pick<BetEntity, "id" | "home_score" | "away_score" | "points_awarded">;

/**
 * Match DTO with computed betting fields
 * API Usage: GET /api/matches, GET /api/matches/:id response
 * Derived from: MatchEntity + computed fields (betting_deadline, can_bet, user_bet)
 */
export interface MatchDTO extends MatchEntity {
  betting_deadline: string; // Computed: kickoff_time - 5 minutes
  can_bet: boolean; // Computed: current time < betting_deadline && status in [scheduled, live]
  user_bet: UserBetSummaryDTO | null; // null if user not authenticated or no bet placed
}

/**
 * Match list response with pagination
 * API Usage: GET /api/matches response
 * Derived from: Array of MatchDTO + PaginationMeta
 */
export interface MatchListResponseDTO {
  matches: MatchDTO[];
  pagination: PaginationMeta;
}

/**
 * Match detail response
 * API Usage: GET /api/matches/:id response
 * Derived from: MatchDTO (same structure)
 */
export type MatchDetailResponseDTO = MatchDTO;

/**
 * Admin match DTO with bet count
 * API Usage: GET /api/admin/matches response
 * Derived from: MatchEntity + bet_count aggregation
 */
export interface AdminMatchDTO extends MatchEntity {
  bet_count: number; // Aggregated count of bets for this match
}

/**
 * Admin match list response with pagination
 * API Usage: GET /api/admin/matches response
 * Derived from: Array of AdminMatchDTO + PaginationMeta
 */
export interface AdminMatchListResponseDTO {
  matches: AdminMatchDTO[];
  pagination: PaginationMeta;
}

/**
 * Admin match score update response
 * API Usage: PATCH /api/admin/matches/:id/score response
 * Derived from: MatchEntity + operation metadata
 */
export interface AdminMatchScoreUpdateResponseDTO extends MatchEntity {
  points_recalculated: boolean; // Always true on successful update
  bets_updated: number; // Count of bets that had points recalculated
}

// ============================================================================
// Match Command Models
// ============================================================================

/**
 * Command to update match score (admin only)
 * API Usage: PATCH /api/admin/matches/:id/score request
 * Validation: scores >= 0, status typically "finished"
 * Triggers: Automatic point recalculation for all bets on this match
 */
export interface UpdateMatchScoreCommand {
  home_team_score: number;
  away_team_score: number;
  status: MatchStatus;
}

// ============================================================================
// Bet DTOs
// ============================================================================

/**
 * Match summary embedded in bet responses
 * API Usage: Embedded in BetDTO
 * Derived from: MatchEntity (Pick specific fields)
 */
export type BetMatchSummaryDTO = Pick<
  MatchEntity,
  "id" | "home_team_name" | "away_team_name" | "home_team_score" | "away_team_score" | "kickoff_time" | "status"
>;

/**
 * Bet DTO with match information
 * API Usage: GET /api/bets, GET /api/bets/:id response
 * Derived from: BetEntity + embedded MatchSummary
 */
export interface BetDTO extends BetEntity {
  match: BetMatchSummaryDTO;
}

/**
 * Bet list response with pagination
 * API Usage: GET /api/bets response
 * Derived from: Array of BetDTO + PaginationMeta
 */
export interface BetListResponseDTO {
  bets: BetDTO[];
  pagination: PaginationMeta;
}

/**
 * Bet detail response
 * API Usage: GET /api/bets/:id response
 * Derived from: BetDTO (same structure)
 */
export type BetDetailResponseDTO = BetDTO;

/**
 * Bet response for create/update operations
 * API Usage: POST /api/bets response (UPSERT)
 * Derived from: BetEntity (complete entity without match info)
 */
export type BetResponseDTO = BetEntity;

// ============================================================================
// Bet Command Models
// ============================================================================

/**
 * Command to create or update a bet (UPSERT operation)
 * API Usage: POST /api/bets request
 * Validation:
 * - match_id must exist and be in scheduled/live status
 * - home_score, away_score >= 0
 * - Current time must be before betting deadline (kickoff_time - 5 minutes)
 * - One bet per user per match (UNIQUE constraint)
 * Business Logic: If bet exists, UPDATE; otherwise, INSERT
 */
export interface CreateOrUpdateBetCommand {
  match_id: string;
  home_score: number;
  away_score: number;
}

// ============================================================================
// Bet Log DTOs
// ============================================================================

/**
 * Match summary for bet log responses
 * API Usage: Embedded in BetLogDTO
 * Derived from: MatchEntity (Pick specific fields for audit trail)
 */
export type BetLogMatchSummaryDTO = Pick<MatchEntity, "id" | "home_team_name" | "away_team_name" | "kickoff_time">;

/**
 * Bet log DTO with match information
 * API Usage: GET /api/bet-logs response
 * Derived from: BetLogEntity + embedded MatchSummary
 */
export interface BetLogDTO extends BetLogEntity {
  match: BetLogMatchSummaryDTO;
}

/**
 * Bet log list response with pagination
 * API Usage: GET /api/bet-logs response
 * Derived from: Array of BetLogDTO + PaginationMeta
 * Note: Bet logs are read-only, created automatically by database triggers
 */
export interface BetLogListResponseDTO {
  logs: BetLogDTO[];
  pagination: PaginationMeta;
}

// ============================================================================
// Leaderboard DTOs
// ============================================================================

/**
 * Leaderboard entry with aggregated user statistics
 * API Usage: GET /api/leaderboard response (embedded in array)
 * Derived from: ProfileEntity + aggregated calculations from BetEntity
 * Calculation:
 * - rank: Based on total_points DESC, nickname ASC
 * - total_points: SUM(points_awarded) WHERE points_awarded IS NOT NULL
 * - matches_bet: COUNT(*) WHERE points_awarded IS NOT NULL
 * - matches_won: COUNT(*) WHERE points_awarded > 0
 * - exact_scores: COUNT(*) WHERE points_awarded = 4
 * - correct_winners: COUNT(*) WHERE points_awarded IN (1, 2, 4)
 */
export interface LeaderboardEntryDTO {
  rank: number; // Calculated rank based on points and nickname
  user_id: string; // From ProfileEntity.id
  nickname: string; // From ProfileEntity.nickname
  total_points: number; // Aggregated from BetEntity.points_awarded
  matches_bet: number; // Count of finished bets
  matches_won: number; // Count of bets with points > 0
  exact_scores: number; // Count of bets with 4 points
  correct_winners: number; // Count of bets with 1, 2, or 4 points
}

/**
 * Leaderboard response with pagination and current user rank
 * API Usage: GET /api/leaderboard response
 * Derived from: Array of LeaderboardEntryDTO + PaginationMeta + current user rank
 */
export interface LeaderboardResponseDTO {
  leaderboard: LeaderboardEntryDTO[];
  pagination: PaginationMeta;
  current_user_rank: number | null; // null if user not authenticated
}

// ============================================================================
// Group DTOs
// ============================================================================

/**
 * Group DTO with member count
 * API Usage: GET /api/groups, GET /api/groups/:id, GET /api/groups/default response
 * Derived from: GroupEntity + member_count aggregation from UserGroupEntity
 */
export interface GroupDTO extends GroupEntity {
  member_count: number; // COUNT of UserGroupEntity where group_id = this.id
}

/**
 * Group list response
 * API Usage: GET /api/groups response
 * Derived from: Array of GroupDTO (no pagination for MVP, single default group)
 */
export interface GroupListResponseDTO {
  groups: GroupDTO[];
}

/**
 * Group detail response
 * API Usage: GET /api/groups/:id, GET /api/groups/default response
 * Derived from: GroupDTO (same structure)
 */
export type GroupDetailResponseDTO = GroupDTO;

// ============================================================================
// Admin Statistics DTOs
// ============================================================================

/**
 * User statistics for admin dashboard
 * Derived from: Aggregated counts from ProfileEntity and BetEntity
 */
export interface AdminUserStatsDTO {
  total: number; // COUNT(*) from profiles
  active: number; // COUNT(DISTINCT user_id) from bets
  admins: number; // COUNT(*) from profiles WHERE is_admin = true
}

/**
 * Match statistics for admin dashboard
 * Derived from: Aggregated counts from MatchEntity
 */
export interface AdminMatchStatsDTO {
  total: number; // COUNT(*) from matches
  scheduled: number; // COUNT(*) WHERE status = 'scheduled'
  live: number; // COUNT(*) WHERE status = 'live'
  finished: number; // COUNT(*) WHERE status = 'finished'
}

/**
 * Bet statistics for admin dashboard
 * Derived from: Aggregated counts from BetEntity
 */
export interface AdminBetStatsDTO {
  total: number; // COUNT(*) from bets
  pending_scoring: number; // COUNT(*) WHERE points_awarded IS NULL
}

/**
 * API usage statistics for admin dashboard
 * Derived from: External API tracking (api-football.com)
 */
export interface AdminApiUsageStatsDTO {
  requests_today: number; // Tracked externally or in separate tracking table
  requests_limit: number; // Constant: 7000
}

/**
 * Complete admin statistics response
 * API Usage: GET /api/admin/stats response
 * Derived from: Multiple aggregations across all entities
 */
export interface AdminStatsResponseDTO {
  users: AdminUserStatsDTO;
  matches: AdminMatchStatsDTO;
  bets: AdminBetStatsDTO;
  api_usage: AdminApiUsageStatsDTO;
}

// ============================================================================
// Utility and System DTOs
// ============================================================================

/**
 * Health check response
 * API Usage: GET /api/health response
 * Purpose: Monitoring and load balancer health checks
 */
export interface HealthResponseDTO {
  status: "ok";
  timestamp: string; // ISO 8601 timestamp in UTC
  database: "connected";
}

/**
 * Time response for client-side calculations
 * API Usage: GET /api/time response
 * Purpose: Provide server time for accurate betting deadline calculations
 */
export interface TimeResponseDTO {
  utc_time: string; // ISO 8601 timestamp in UTC
  unix_timestamp: number; // Unix epoch timestamp
}

// ============================================================================
// Common/Shared DTOs
// ============================================================================

/**
 * Pagination metadata for list responses
 * Used in: All list endpoints (matches, bets, bet logs, leaderboard, etc.)
 */
export interface PaginationMeta {
  page: number; // Current page number (1-based)
  limit: number; // Items per page (max 100)
  total: number; // Total number of items
  total_pages: number; // Total number of pages (calculated: Math.ceil(total / limit))
}

/**
 * Standard error response format
 * API Usage: All error responses (4xx, 5xx)
 * Purpose: Consistent error handling across all endpoints
 */
export interface ErrorResponseDTO {
  error: {
    code: string; // Error code (e.g., "VALIDATION_ERROR", "UNAUTHORIZED")
    message: string; // Human-readable error message
    details: Record<string, unknown> | null; // Additional error details (e.g., field-specific validation errors)
  };
}

// ============================================================================
// Query Parameter DTOs (for type-safe request handling)
// ============================================================================

/**
 * Query parameters for GET /api/matches
 */
export interface MatchListQueryParams {
  status?: MatchStatus;
  upcoming?: boolean;
  finished?: boolean;
  page?: number;
  limit?: number;
  sort?: "kickoff_time" | "created_at";
  order?: "asc" | "desc";
}

/**
 * Query parameters for GET /api/bets
 */
export interface BetListQueryParams {
  match_id?: string;
  status?: MatchStatus;
  page?: number;
  limit?: number;
  sort?: "created_at" | "updated_at";
  order?: "asc" | "desc";
}

/**
 * Query parameters for GET /api/bet-logs
 */
export interface BetLogListQueryParams {
  match_id?: string;
  action?: BetAction;
  page?: number;
  limit?: number;
  sort?: "created_at";
  order?: "asc" | "desc";
}

/**
 * Query parameters for GET /api/leaderboard
 */
export interface LeaderboardQueryParams {
  group_id?: string;
  page?: number;
  limit?: number;
}

/**
 * Query parameters for GET /api/groups
 */
export interface GroupListQueryParams {
  default?: boolean;
}

/**
 * Query parameters for GET /api/admin/matches
 */
export interface AdminMatchListQueryParams {
  status?: MatchStatus;
  page?: number;
  limit?: number;
}

// ============================================================================
// Type Guards and Utilities
// ============================================================================

/**
 * Type guard to check if a value is a valid MatchStatus
 */
export function isMatchStatus(value: unknown): value is MatchStatus {
  return typeof value === "string" && ["scheduled", "live", "finished", "cancelled", "postponed"].includes(value);
}

/**
 * Type guard to check if a value is a valid BetAction
 */
export function isBetAction(value: unknown): value is BetAction {
  return typeof value === "string" && ["created", "updated"].includes(value);
}

/**
 * Utility type to extract keys from an entity that are nullable
 */
export type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

/**
 * Utility type to extract keys from an entity that are required
 */
export type RequiredKeys<T> = {
  [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

// ============================================================================
// Database Operation Types (for internal use in API handlers)
// ============================================================================

/**
 * Insert type for Profile entity
 * Source: TablesInsert<"profiles">
 */
export type ProfileInsert = TablesInsert<"profiles">;

/**
 * Update type for Profile entity
 * Source: TablesUpdate<"profiles">
 */
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * Insert type for Match entity
 * Source: TablesInsert<"matches">
 */
export type MatchInsert = TablesInsert<"matches">;

/**
 * Update type for Match entity
 * Source: TablesUpdate<"matches">
 */
export type MatchUpdate = TablesUpdate<"matches">;

/**
 * Insert type for Bet entity
 * Source: TablesInsert<"bets">
 */
export type BetInsert = TablesInsert<"bets">;

/**
 * Update type for Bet entity
 * Source: TablesUpdate<"bets">
 */
export type BetUpdate = TablesUpdate<"bets">;

/**
 * Insert type for BetLog entity
 * Source: TablesInsert<"bet_logs">
 * Note: Typically created by database triggers, not directly via API
 */
export type BetLogInsert = TablesInsert<"bet_logs">;

/**
 * Insert type for Group entity
 * Source: TablesInsert<"groups">
 */
export type GroupInsert = TablesInsert<"groups">;

/**
 * Update type for Group entity
 * Source: TablesUpdate<"groups">
 */
export type GroupUpdate = TablesUpdate<"groups">;

/**
 * Insert type for UserGroup entity
 * Source: TablesInsert<"user_groups">
 */
export type UserGroupInsert = TablesInsert<"user_groups">;

// ============================================================================
// Re-exports for convenience
// ============================================================================

/**
 * Re-export entity types with shorter names for convenience
 */
export type {
  ProfileEntity as Profile,
  MatchEntity as Match,
  BetEntity as Bet,
  BetLogEntity as BetLog,
  GroupEntity as Group,
  UserGroupEntity as UserGroup,
};
