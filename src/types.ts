import type { Enums, Tables } from "./db/database.types";

type IsoDateString = string;
type ProfileRow = Tables<"profiles">;
type GroupRow = Tables<"groups">;
type MatchRow = Tables<"matches">;
type BetRow = Tables<"bets">;
type BetLogRow = Tables<"bet_logs">;

export type MatchStatus = Enums<"match_status">;
export type BetAction = Enums<"bet_action">;
type ScoreValue = NonNullable<BetRow["home_score"]>;

export interface PaginatedItems<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

// Profiles & Groups
export interface ProfileDto {
  id: ProfileRow["id"];
  nickname: ProfileRow["nickname"];
  isAdmin: ProfileRow["is_admin"];
}

export interface GroupDto {
  id: GroupRow["id"];
  name: GroupRow["name"];
  isDefault: GroupRow["is_default"];
}

export interface MeDto extends ProfileDto {
  groups: GroupDto[];
}

export interface CreateProfileCommand {
  nickname: ProfileRow["nickname"];
}

// Auth
export interface AuthStartCommand {
  provider: "google" | "facebook" | "apple";
  redirectUrl: string;
}

export interface AuthStartResponse {
  url: string;
}

export interface AuthExchangeCommand {
  code: string;
}

export interface AuthExchangeResponse {
  hasProfile: boolean;
}

// Matches & Bets
export interface UserBetInlineDto {
  id?: BetRow["id"];
  matchId?: BetRow["match_id"];
  homeScore: ScoreValue;
  awayScore: ScoreValue;
  pointsAwarded?: BetRow["points_awarded"];
  updatedAt?: BetRow["updated_at"];
}

export interface MatchSummaryDto {
  id: MatchRow["id"];
  apiMatchId: MatchRow["api_match_id"];
  homeTeamName: MatchRow["home_team_name"];
  awayTeamName: MatchRow["away_team_name"];
  homeTeamLogo: MatchRow["home_team_logo"];
  awayTeamLogo: MatchRow["away_team_logo"];
  homeTeamScore: MatchRow["home_team_score"];
  awayTeamScore: MatchRow["away_team_score"];
  kickoffTime: MatchRow["kickoff_time"];
  status: MatchRow["status"];
  // Derived server-side as kickoff_time - 5 minutes
  bettingDeadline: IsoDateString;
}

export interface MatchListItemDto extends MatchSummaryDto {
  userBet?: UserBetInlineDto;
}

export type MatchListResponse = PaginatedItems<MatchListItemDto>;

export interface MatchDetailDto extends MatchSummaryDto {
  userBet?: BetDto;
}

export interface MatchDetailResponse {
  match: MatchDetailDto;
  bet?: BetDto | null;
  bettingDeadline: IsoDateString;
}

export interface MatchMetadataPatchCommand {
  kickoffTime?: MatchRow["kickoff_time"];
  status?: MatchStatus;
  homeTeamLogo?: MatchRow["home_team_logo"];
  awayTeamLogo?: MatchRow["away_team_logo"];
}

export interface BetUpsertCommand {
  homeScore: ScoreValue;
  awayScore: ScoreValue;
}

export interface BetDto {
  id: BetRow["id"];
  matchId: BetRow["match_id"];
  homeScore: BetRow["home_score"];
  awayScore: BetRow["away_score"];
  pointsAwarded: BetRow["points_awarded"];
  createdAt: BetRow["created_at"];
  updatedAt: BetRow["updated_at"];
}

export type BetResponse = BetDto;

export interface BetsListItemDto {
  bet: BetDto;
  match: MatchSummaryDto;
}

export type BetsListResponse = PaginatedData<BetsListItemDto>;

// Bet logs
export interface BetLogDto {
  id: BetLogRow["id"];
  matchId: BetLogRow["match_id"];
  action: BetAction;
  homeScore: BetLogRow["home_score"];
  awayScore: BetLogRow["away_score"];
  createdAt: BetLogRow["created_at"];
}

export type BetLogsPage = PaginatedItems<BetLogDto>;

// Leaderboard & History
export interface LeaderboardEntryDto {
  rank: number;
  userId: ProfileRow["id"];
  nickname: ProfileRow["nickname"];
  totalPoints: number;
  matchesBet: number;
}

export type LeaderboardResponse = PaginatedItems<LeaderboardEntryDto> & {
  data?: LeaderboardEntryDto[];
};

export interface MatchHistoryItemDto {
  match: MatchSummaryDto;
  bet?: UserBetInlineDto;
  pointsAwarded?: BetRow["points_awarded"];
}

export type MatchHistoryResponse = PaginatedItems<MatchHistoryItemDto>;

// Admin
export type AdminMatchListItemDto = MatchSummaryDto;
export type AdminMatchesResponse = PaginatedItems<AdminMatchListItemDto>;

export interface AdminScoreUpdateCommand {
  homeScore: ScoreValue;
  awayScore: ScoreValue;
  status?: Extract<MatchStatus, "finished" | "cancelled" | "postponed"> | null;
}

export interface AdminScoreUpdateResult {
  match: MatchSummaryDto;
  recalculatedBets?: number;
}

export interface AdminMatchUpdateResult {
  match: MatchSummaryDto;
}

export interface AdminSyncMatchesCommand {
  from?: IsoDateString;
  to?: IsoDateString;
}

export interface AdminSyncMatchesResult {
  synced: number;
  updated: number;
  skipped: number;
}
