import type { Tables, Enums } from "./db/database.types";

// ============================================================================
// Database Entity Types (re-exported for convenience)
// ============================================================================

export type Profile = Tables<"profiles">;
export type Match = Tables<"matches">;
export type Bet = Tables<"bets">;
export type BetLog = Tables<"bet_logs">;
export type Group = Tables<"groups">;
export type UserGroup = Tables<"user_groups">;

export type MatchStatus = Enums<"match_status">;
export type BetAction = Enums<"bet_action">;

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Full profile DTO - includes all profile fields
 * Used in: GET /api/profiles/me, POST /api/profiles/me/nickname
 */
export type ProfileDTO = Profile;

/**
 * Public profile DTO - limited fields for public display
 * Used in: GET /api/profiles/:id
 */
export type PublicProfileDTO = Pick<Profile, "id" | "nickname" | "created_at">;

/**
 * Session response - wraps user profile
 * Used in: POST /api/auth/session
 */
export interface SessionResponse {
  user: ProfileDTO;
}

// ============================================================================
// Profile Command Models
// ============================================================================

/**
 * Command to create or update user nickname
 * Used in: POST /api/profiles/me/nickname
 */
export interface UpdateNicknameCommand {
  nickname: string;
}

// ============================================================================
// Match DTOs
// ============================================================================

/**
 * Base match DTO - core match fields from database
 */
export type MatchBaseDTO = Match;

/**
 * User bet information included in match responses
 * Used in: MatchDTO, MatchDetailResponse
 */
export interface UserBetDTO {
  id: string;
  home_score: number;
  away_score: number;
  points_awarded: number | null;
}

/**
 * Match DTO with computed fields for betting
 * Used in: GET /api/matches, GET /api/matches/:id
 */
export interface MatchDTO extends MatchBaseDTO {
  betting_deadline: string; // ISO 8601 timestamp (kickoff_time - 5 minutes)
  can_bet: boolean; // true if current time < betting_deadline and status is scheduled/live
  user_bet: UserBetDTO | null; // null if user not authenticated or no bet placed
}

/**
 * Match list response with pagination
 * Used in: GET /api/matches
 */
export interface MatchListResponse {
  matches: MatchDTO[];
  pagination: PaginationMeta;
}

/**
 * Match detail response
 * Used in: GET /api/matches/:id
 */
export type MatchDetailResponse = MatchDTO;

/**
 * Admin match DTO with bet count
 * Used in: GET /api/admin/matches
 */
export interface AdminMatchDTO extends MatchBaseDTO {
  bet_count: number;
}

/**
 * Admin match list response with pagination
 * Used in: GET /api/admin/matches
 */
export interface AdminMatchListResponse {
  matches: AdminMatchDTO[];
  pagination: PaginationMeta;
}

/**
 * Admin match score update response
 * Used in: PATCH /api/admin/matches/:id/score
 */
export interface AdminMatchScoreUpdateResponse extends MatchBaseDTO {
  points_recalculated: boolean;
  bets_updated: number;
}

// ============================================================================
// Match Command Models
// ============================================================================

/**
 * Command to update match score (admin only)
 * Used in: PATCH /api/admin/matches/:id/score
 */
export interface UpdateMatchScoreCommand {
  home_team_score: number;
  away_team_score: number;
  status: MatchStatus; // Typically "finished"
}

// ============================================================================
// Bet DTOs
// ============================================================================

/**
 * Base bet DTO - core bet fields from database
 */
export type BetBaseDTO = Bet;

/**
 * Match summary included in bet responses
 * Used in: BetDTO, BetDetailResponse
 */
export interface BetMatchSummaryDTO {
  id: string;
  home_team_name: string;
  away_team_name: string;
  home_team_score: number | null;
  away_team_score: number | null;
  kickoff_time: string;
  status: MatchStatus;
}

/**
 * Bet DTO with match information
 * Used in: GET /api/bets, GET /api/bets/:id
 */
export interface BetDTO extends BetBaseDTO {
  match: BetMatchSummaryDTO;
}

/**
 * Bet list response with pagination
 * Used in: GET /api/bets
 */
export interface BetListResponse {
  bets: BetDTO[];
  pagination: PaginationMeta;
}

/**
 * Bet detail response
 * Used in: GET /api/bets/:id
 */
export type BetDetailResponse = BetDTO;

/**
 * Bet response for create/update operations
 * Used in: POST /api/bets
 */
export type BetResponse = BetBaseDTO;

// ============================================================================
// Bet Command Models
// ============================================================================

/**
 * Command to create or update a bet (UPSERT)
 * Used in: POST /api/bets
 */
export interface CreateBetCommand {
  match_id: string;
  home_score: number;
  away_score: number;
}

// ============================================================================
// Bet Log DTOs
// ============================================================================

/**
 * Match summary for bet log responses
 * Used in: BetLogDTO
 */
export interface BetLogMatchSummaryDTO {
  id: string;
  home_team_name: string;
  away_team_name: string;
  kickoff_time: string;
}

/**
 * Bet log DTO with match information
 * Used in: GET /api/bet-logs
 */
export interface BetLogDTO extends BetLogBaseDTO {
  match: BetLogMatchSummaryDTO;
}

/**
 * Base bet log DTO - core bet log fields from database
 */
export type BetLogBaseDTO = BetLog;

/**
 * Bet log list response with pagination
 * Used in: GET /api/bet-logs
 */
export interface BetLogListResponse {
  logs: BetLogDTO[];
  pagination: PaginationMeta;
}

// ============================================================================
// Leaderboard DTOs
// ============================================================================

/**
 * Leaderboard entry with aggregated statistics
 * Used in: GET /api/leaderboard
 */
export interface LeaderboardEntryDTO {
  rank: number;
  user_id: string;
  nickname: string;
  total_points: number;
  matches_bet: number; // Count of bets where points_awarded IS NOT NULL
  matches_won: number; // Count of bets where points_awarded > 0
  exact_scores: number; // Count of bets where points_awarded = 4
  correct_winners: number; // Count of bets where points_awarded IN (1, 2, 4)
}

/**
 * Leaderboard response with pagination and current user rank
 * Used in: GET /api/leaderboard
 */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntryDTO[];
  pagination: PaginationMeta;
  current_user_rank: number | null; // null if user not authenticated
}

// ============================================================================
// Group DTOs
// ============================================================================

/**
 * Base group DTO - core group fields from database
 */
export type GroupBaseDTO = Group;

/**
 * Group DTO with member count
 * Used in: GET /api/groups, GET /api/groups/:id, GET /api/groups/default
 */
export interface GroupDTO extends GroupBaseDTO {
  member_count: number;
}

/**
 * Group list response
 * Used in: GET /api/groups
 */
export interface GroupListResponse {
  groups: GroupDTO[];
}

/**
 * Group detail response
 * Used in: GET /api/groups/:id, GET /api/groups/default
 */
export type GroupDetailResponse = GroupDTO;

// ============================================================================
// Admin Statistics DTOs
// ============================================================================

/**
 * Admin statistics response
 * Used in: GET /api/admin/stats
 */
export interface AdminStatsResponse {
  users: {
    total: number;
    active: number; // Users who have placed at least one bet
    admins: number;
  };
  matches: {
    total: number;
    scheduled: number;
    live: number;
    finished: number;
  };
  bets: {
    total: number;
    pending_scoring: number; // Bets where points_awarded IS NULL
  };
  api_usage: {
    requests_today: number;
    requests_limit: number; // 7000
  };
}

// ============================================================================
// Utility DTOs
// ============================================================================

/**
 * Health check response
 * Used in: GET /api/health
 */
export interface HealthResponse {
  status: "ok";
  timestamp: string; // ISO 8601 timestamp
  database: "connected";
}

/**
 * Time response for client-side deadline calculations
 * Used in: GET /api/time
 */
export interface TimeResponse {
  utc_time: string; // ISO 8601 timestamp
  unix_timestamp: number;
}

// ============================================================================
// Common DTOs
// ============================================================================

/**
 * Pagination metadata included in list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
  };
}

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Utility type to extract match status enum values
 */
export type MatchStatusType = MatchStatus;

/**
 * Utility type to extract bet action enum values
 */
export type BetActionType = BetAction;
