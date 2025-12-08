# DTO and Command Model Type Library Summary

## Overview

This document provides a comprehensive overview of the DTO (Data Transfer Object) and Command Model types created in `src/types_2.ts`. All types are directly derived from database entities defined in `src/db/database.types.ts` and aligned with the API plan in `.ai/api-plan.md`.

## Type Organization

The type library is organized into the following sections:

1. **Database Entity Types** - Base types from database
2. **Profile DTOs & Commands** - User profile related types
3. **Match DTOs & Commands** - Match information types
4. **Bet DTOs & Commands** - Betting related types
5. **Bet Log DTOs** - Audit trail types
6. **Leaderboard DTOs** - Rankings and statistics
7. **Group DTOs** - User group types
8. **Admin DTOs** - Administrative dashboard types
9. **Utility DTOs** - Health checks and common types
10. **Query Parameter DTOs** - Type-safe request parameters
11. **Database Operation Types** - Insert/Update types
12. **Type Guards & Utilities** - Helper functions

## Complete Type Inventory

### 1. Authentication & Profile Types (6 types)

#### DTOs:
1. **ProfileDTO** - Full profile information
   - Source: `ProfileEntity` (complete)
   - API: `GET /api/profiles/me`, `POST /api/profiles/me/nickname` response
   
2. **PublicProfileDTO** - Public profile display
   - Source: `Pick<ProfileEntity, "id" | "nickname" | "created_at">`
   - API: `GET /api/profiles/:id` response
   
3. **SessionResponseDTO** - Session validation response
   - Source: Wraps `ProfileDTO`
   - API: `POST /api/auth/session` response

#### Commands:
4. **UpdateNicknameCommand** - Create/update nickname
   - Fields: `nickname: string`
   - API: `POST /api/profiles/me/nickname` request
   - Validation: 3-15 alphanumeric characters, unique

### 2. Match Types (13 types)

#### DTOs:
5. **UserBetSummaryDTO** - User bet embedded in match
   - Source: `Pick<BetEntity, "id" | "home_score" | "away_score" | "points_awarded">`
   - API: Embedded in `MatchDTO`
   
6. **MatchDTO** - Match with betting info
   - Source: `MatchEntity` + computed fields
   - Fields: All match fields + `betting_deadline`, `can_bet`, `user_bet`
   - API: `GET /api/matches`, `GET /api/matches/:id` response
   
7. **MatchListResponseDTO** - Match list with pagination
   - Source: Array of `MatchDTO` + `PaginationMeta`
   - API: `GET /api/matches` response
   
8. **MatchDetailResponseDTO** - Single match detail
   - Source: `MatchDTO` (alias)
   - API: `GET /api/matches/:id` response
   
9. **AdminMatchDTO** - Admin match with bet count
   - Source: `MatchEntity` + `bet_count`
   - API: `GET /api/admin/matches` response item
   
10. **AdminMatchListResponseDTO** - Admin match list
    - Source: Array of `AdminMatchDTO` + `PaginationMeta`
    - API: `GET /api/admin/matches` response
    
11. **AdminMatchScoreUpdateResponseDTO** - Score update result
    - Source: `MatchEntity` + `points_recalculated`, `bets_updated`
    - API: `PATCH /api/admin/matches/:id/score` response

#### Commands:
12. **UpdateMatchScoreCommand** - Update match score
    - Fields: `home_team_score`, `away_team_score`, `status`
    - API: `PATCH /api/admin/matches/:id/score` request
    - Triggers: Automatic point recalculation

#### Query Params:
13. **MatchListQueryParams** - Match list filters
14. **AdminMatchListQueryParams** - Admin match filters

### 3. Bet Types (10 types)

#### DTOs:
15. **BetMatchSummaryDTO** - Match info in bet response
    - Source: `Pick<MatchEntity, "id" | "home_team_name" | "away_team_name" | "home_team_score" | "away_team_score" | "kickoff_time" | "status">`
    - API: Embedded in `BetDTO`
    
16. **BetDTO** - Bet with match information
    - Source: `BetEntity` + `match: BetMatchSummaryDTO`
    - API: `GET /api/bets`, `GET /api/bets/:id` response
    
17. **BetListResponseDTO** - Bet list with pagination
    - Source: Array of `BetDTO` + `PaginationMeta`
    - API: `GET /api/bets` response
    
18. **BetDetailResponseDTO** - Single bet detail
    - Source: `BetDTO` (alias)
    - API: `GET /api/bets/:id` response
    
19. **BetResponseDTO** - Create/update bet response
    - Source: `BetEntity` (complete)
    - API: `POST /api/bets` response

#### Commands:
20. **CreateOrUpdateBetCommand** - UPSERT bet
    - Fields: `match_id`, `home_score`, `away_score`
    - API: `POST /api/bets` request
    - Logic: INSERT if not exists, UPDATE if exists

#### Query Params:
21. **BetListQueryParams** - Bet list filters

### 4. Bet Log Types (5 types)

#### DTOs:
22. **BetLogMatchSummaryDTO** - Match info in bet log
    - Source: `Pick<MatchEntity, "id" | "home_team_name" | "away_team_name" | "kickoff_time">`
    - API: Embedded in `BetLogDTO`
    
23. **BetLogDTO** - Bet log with match info
    - Source: `BetLogEntity` + `match: BetLogMatchSummaryDTO`
    - API: `GET /api/bet-logs` response item
    
24. **BetLogListResponseDTO** - Bet log list
    - Source: Array of `BetLogDTO` + `PaginationMeta`
    - API: `GET /api/bet-logs` response

#### Query Params:
25. **BetLogListQueryParams** - Bet log filters

### 5. Leaderboard Types (3 types)

#### DTOs:
26. **LeaderboardEntryDTO** - User ranking entry
    - Source: `ProfileEntity` + aggregated `BetEntity` statistics
    - Fields: `rank`, `user_id`, `nickname`, `total_points`, `matches_bet`, `matches_won`, `exact_scores`, `correct_winners`
    - API: `GET /api/leaderboard` response item
    - Calculation:
      - `rank`: Based on total_points DESC, nickname ASC
      - `total_points`: SUM(points_awarded) WHERE NOT NULL
      - `matches_bet`: COUNT(*) WHERE points_awarded NOT NULL
      - `matches_won`: COUNT(*) WHERE points_awarded > 0
      - `exact_scores`: COUNT(*) WHERE points_awarded = 4
      - `correct_winners`: COUNT(*) WHERE points_awarded IN (1,2,4)
    
27. **LeaderboardResponseDTO** - Complete leaderboard
    - Source: Array of `LeaderboardEntryDTO` + `PaginationMeta` + `current_user_rank`
    - API: `GET /api/leaderboard` response

#### Query Params:
28. **LeaderboardQueryParams** - Leaderboard filters

### 6. Group Types (5 types)

#### DTOs:
29. **GroupDTO** - Group with member count
    - Source: `GroupEntity` + `member_count` (COUNT from `UserGroupEntity`)
    - API: `GET /api/groups`, `GET /api/groups/:id`, `GET /api/groups/default` response
    
30. **GroupListResponseDTO** - Group list
    - Source: Array of `GroupDTO`
    - API: `GET /api/groups` response
    
31. **GroupDetailResponseDTO** - Single group detail
    - Source: `GroupDTO` (alias)
    - API: `GET /api/groups/:id`, `GET /api/groups/default` response

#### Query Params:
32. **GroupListQueryParams** - Group list filters

### 7. Admin Statistics Types (6 types)

#### DTOs:
33. **AdminUserStatsDTO** - User statistics
    - Source: Aggregated from `ProfileEntity` and `BetEntity`
    - Fields: `total`, `active`, `admins`
    
34. **AdminMatchStatsDTO** - Match statistics
    - Source: Aggregated from `MatchEntity`
    - Fields: `total`, `scheduled`, `live`, `finished`
    
35. **AdminBetStatsDTO** - Bet statistics
    - Source: Aggregated from `BetEntity`
    - Fields: `total`, `pending_scoring`
    
36. **AdminApiUsageStatsDTO** - External API usage
    - Source: External tracking system
    - Fields: `requests_today`, `requests_limit`
    
37. **AdminStatsResponseDTO** - Complete admin stats
    - Source: Combines all admin stat DTOs
    - API: `GET /api/admin/stats` response

### 8. Utility Types (3 types)

#### DTOs:
38. **HealthResponseDTO** - Health check
    - API: `GET /api/health` response
    
39. **TimeResponseDTO** - Server time
    - API: `GET /api/time` response
    
40. **ErrorResponseDTO** - Standard error format
    - API: All error responses (4xx, 5xx)

### 9. Common Types (1 type)

41. **PaginationMeta** - Pagination metadata
    - Used in: All list responses
    - Fields: `page`, `limit`, `total`, `total_pages`

### 10. Database Entity Types (6 types)

42. **ProfileEntity** - Base profile type
    - Source: `Tables<"profiles">`
    
43. **MatchEntity** - Base match type
    - Source: `Tables<"matches">`
    
44. **BetEntity** - Base bet type
    - Source: `Tables<"bets">`
    
45. **BetLogEntity** - Base bet log type
    - Source: `Tables<"bet_logs">`
    
46. **GroupEntity** - Base group type
    - Source: `Tables<"groups">`
    
47. **UserGroupEntity** - Base user-group type
    - Source: `Tables<"user_groups">`

### 11. Enum Types (2 types)

48. **MatchStatus** - Match status enum
    - Source: `Enums<"match_status">`
    - Values: `scheduled`, `live`, `finished`, `cancelled`, `postponed`
    
49. **BetAction** - Bet action enum
    - Source: `Enums<"bet_action">`
    - Values: `created`, `updated`

### 12. Database Operation Types (12 types)

50. **ProfileInsert** - Insert type for profiles
    - Source: `TablesInsert<"profiles">`
    
51. **ProfileUpdate** - Update type for profiles
    - Source: `TablesUpdate<"profiles">`
    
52. **MatchInsert** - Insert type for matches
    - Source: `TablesInsert<"matches">`
    
53. **MatchUpdate** - Update type for matches
    - Source: `TablesUpdate<"matches">`
    
54. **BetInsert** - Insert type for bets
    - Source: `TablesInsert<"bets">`
    
55. **BetUpdate** - Update type for bets
    - Source: `TablesUpdate<"bets">`
    
56. **BetLogInsert** - Insert type for bet logs
    - Source: `TablesInsert<"bet_logs">`
    
57. **GroupInsert** - Insert type for groups
    - Source: `TablesInsert<"groups">`
    
58. **GroupUpdate** - Update type for groups
    - Source: `TablesUpdate<"groups">`
    
59. **UserGroupInsert** - Insert type for user groups
    - Source: `TablesInsert<"user_groups">`

### 13. Type Guards & Utilities (4 types/functions)

60. **isMatchStatus()** - Type guard for MatchStatus
61. **isBetAction()** - Type guard for BetAction
62. **NullableKeys<T>** - Extract nullable keys utility
63. **RequiredKeys<T>** - Extract required keys utility

### 14. Convenience Re-exports (6 aliases)

64-69. Re-exported entity types with shorter names: `Profile`, `Match`, `Bet`, `BetLog`, `Group`, `UserGroup`

## Total Count: 69 Types/Functions

## Type Derivation Map

### Direct Entity Mappings
- `ProfileDTO` ← `ProfileEntity` (complete)
- `BetResponseDTO` ← `BetEntity` (complete)
- `GroupBaseDTO` ← `GroupEntity` (complete)

### Partial Entity Mappings (Pick)
- `PublicProfileDTO` ← `Pick<ProfileEntity, ...>`
- `UserBetSummaryDTO` ← `Pick<BetEntity, ...>`
- `BetMatchSummaryDTO` ← `Pick<MatchEntity, ...>`
- `BetLogMatchSummaryDTO` ← `Pick<MatchEntity, ...>`

### Extended Entity Mappings
- `MatchDTO` ← `MatchEntity` + computed fields
- `AdminMatchDTO` ← `MatchEntity` + aggregation
- `BetDTO` ← `BetEntity` + related data
- `BetLogDTO` ← `BetLogEntity` + related data
- `GroupDTO` ← `GroupEntity` + aggregation

### Aggregated/Computed Types
- `LeaderboardEntryDTO` ← Aggregated from `ProfileEntity` + `BetEntity`
- `AdminStatsResponseDTO` ← Multiple aggregations

### Wrapper Types
- `SessionResponseDTO` ← Wraps `ProfileDTO`
- All `*ListResponseDTO` types ← Array + `PaginationMeta`

## Key Design Principles

1. **Entity-First Approach**: All DTOs derive from database entities using TypeScript's type system
2. **Type Safety**: Use `Pick`, `Omit`, `Partial`, and intersection types instead of redefining structures
3. **Clear Naming**: DTOs end with `DTO`, Commands end with `Command`, Entities end with `Entity`
4. **Documentation**: Every type includes JSDoc comments explaining source, usage, and derivation
5. **Traceability**: Each DTO explicitly documents its relationship to database entities
6. **Separation of Concerns**: Request DTOs, Response DTOs, and Command Models are clearly distinguished
7. **Query Type Safety**: Query parameter types for type-safe request handling
8. **Database Operations**: Include Insert/Update types for internal API handler use

## Validation & Business Logic

### Nickname Validation
- Length: 3-15 characters
- Format: Alphanumeric only (regex: `^[a-zA-Z0-9]+$`)
- Uniqueness: Enforced at database level

### Betting Rules
- Scores must be >= 0
- Betting deadline: kickoff_time - 5 minutes
- One bet per user per match (UNIQUE constraint)
- Bets allowed only when match status is `scheduled` or `live`

### Point Calculation
1. **4 points**: Exact score match
2. **2 points**: Correct winner + goal difference OR correct draw
3. **1 point**: Correct winner only
4. **0 points**: Incorrect prediction

### Leaderboard Ranking
1. Primary: `total_points` (descending)
2. Tie-breaker: `nickname` (ascending)

## API Endpoint Coverage

All 28 endpoints from the API plan are covered:

### Authentication (1)
- ✅ POST /api/auth/session

### Profiles (3)
- ✅ GET /api/profiles/me
- ✅ POST /api/profiles/me/nickname
- ✅ GET /api/profiles/:id

### Matches (2)
- ✅ GET /api/matches
- ✅ GET /api/matches/:id

### Bets (3)
- ✅ GET /api/bets
- ✅ GET /api/bets/:id
- ✅ POST /api/bets
- ✅ DELETE /api/bets/:id (uses standard HTTP status, no special DTO)

### Leaderboard (1)
- ✅ GET /api/leaderboard

### Groups (3)
- ✅ GET /api/groups
- ✅ GET /api/groups/:id
- ✅ GET /api/groups/default

### Bet Logs (1)
- ✅ GET /api/bet-logs

### Admin (3)
- ✅ GET /api/admin/matches
- ✅ PATCH /api/admin/matches/:id/score
- ✅ GET /api/admin/stats

### Utility (2)
- ✅ GET /api/health
- ✅ GET /api/time

## Usage Examples

### Example 1: Creating a Bet
```typescript
import type { CreateOrUpdateBetCommand, BetResponseDTO } from '@/types_2';

const command: CreateOrUpdateBetCommand = {
  match_id: "uuid",
  home_score: 2,
  away_score: 1
};

// API handler returns:
const response: BetResponseDTO = {
  id: "uuid",
  user_id: "uuid",
  match_id: "uuid",
  home_score: 2,
  away_score: 1,
  points_awarded: null,
  created_at: "2024-01-15T20:00:00Z",
  updated_at: "2024-01-15T20:00:00Z"
};
```

### Example 2: Fetching Matches
```typescript
import type { MatchListQueryParams, MatchListResponseDTO } from '@/types_2';

const params: MatchListQueryParams = {
  status: "scheduled",
  page: 1,
  limit: 20,
  sort: "kickoff_time",
  order: "asc"
};

const response: MatchListResponseDTO = {
  matches: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    total_pages: 3
  }
};
```

### Example 3: Leaderboard
```typescript
import type { LeaderboardResponseDTO, LeaderboardEntryDTO } from '@/types_2';

const response: LeaderboardResponseDTO = {
  leaderboard: [
    {
      rank: 1,
      user_id: "uuid",
      nickname: "Player1",
      total_points: 48,
      matches_bet: 12,
      matches_won: 10,
      exact_scores: 2,
      correct_winners: 10
    }
  ],
  pagination: { page: 1, limit: 50, total: 25, total_pages: 1 },
  current_user_rank: 3
};
```

## Future Enhancements

1. **Multi-Group Support**: Add types for group creation, management, and user assignment
2. **Real-Time Types**: Add WebSocket/SSE event types
3. **Analytics Types**: Add types for user performance analytics
4. **Advanced Filtering**: Expand query parameter types with more options
5. **Rate Limiting**: Add types for rate limit responses and headers

## Conclusion

This type library provides:
- ✅ Complete coverage of all API endpoints
- ✅ Strong type safety through entity derivation
- ✅ Clear documentation and traceability
- ✅ Consistent naming conventions
- ✅ Separation between DTOs, Commands, and Queries
- ✅ Type guards and utilities for runtime validation
- ✅ Database operation types for internal use

All types are directly or indirectly derived from database entities, ensuring consistency between the database schema and API contracts.

