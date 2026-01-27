# API Endpoint Implementation Plan: GET `/matches/upcoming`

## 1. Endpoint Overview

Lists scheduled or live matches with betting deadline and the authenticated user's bet (if any). Supports pagination, status filtering, kickoff time range filtering, and sorting by kickoff time. Returns paginated metadata.

## 2. Request Details

- **HTTP Method:** GET
- **URL:** `/api/matches/upcoming`
- **Query Parameters**
  - **Required:** none
  - **Optional:**
    - `page`: integer, default 1, min 1
    - `pageSize`: integer, default 20, max 100, min 1
    - `status`: `"scheduled" | "live"` or omitted (interpreted as both)
    - `from`: ISO timestamp (UTC) inclusive lower bound on `kickoff_time`
    - `to`: ISO timestamp (UTC) inclusive upper bound on `kickoff_time`
    - `sort`: `"kickoff_time.asc" | "kickoff_time.desc"` (default asc)
- **Request Body:** none
- **Headers:** `Authorization: Bearer <token>` (Supabase JWT)

## 3. Used Types

- `MatchStatus`, `PaginatedItems<T>` from `src/types.ts`.
- Response DTO: `MatchListResponse` (`PaginatedItems<MatchListItemDto>`).
- Item DTOs: `MatchListItemDto`, `MatchSummaryDto`, `UserBetInlineDto`.
- Validation models (new): `UpcomingMatchesQuerySchema` (zod) and derived `UpcomingMatchesQuery`.

## 4. Response Details

- **Status 200 OK** with body matching `MatchListResponse`:
  - `items`: array of `MatchListItemDto` with fields: `id`, `apiMatchId`, `homeTeamName`, `awayTeamName`, `homeTeamLogo|null`, `awayTeamLogo|null`, `kickoffTime` (ISO UTC), `status` (`scheduled|live`), `bettingDeadline` (ISO UTC, computed), `homeTeamScore|null`, `awayTeamScore|null`, optional `userBet` `{ homeScore, awayScore, id?, matchId?, pointsAwarded?, updatedAt? }`.
  - `page`, `pageSize`, `total`.
- **Status 401 Unauthorized** for missing/invalid Supabase session.
- **Status 400 Bad Request** for invalid query params.
- **Status 500 Internal Server Error** for unhandled/DB errors.

## 5. Data Flow

1. **Auth**: Use Supabase client from `context.locals` to get current user; return 401 if missing.
2. **Validate Query**: Parse `page`, `pageSize`, `status`, `from`, `to`, `sort` via zod; enforce bounds and allowed values.
3. **Compute Pagination**: `offset = (page-1)*pageSize`, `limit = pageSize`.
4. **Build Filters**:
   - `status` filter: if omitted, use `["scheduled","live"]`; otherwise single value.
   - `kickoff_time` between `from`/`to` when provided.
5. **Query DB (Supabase)**:
   - From `matches`, select fields needed plus left join on `bets` filtered by `bets.user_id = currentUserId` to fetch the user's bet.
   - Apply `in("status", statuses)`, `gte/lte` for `kickoff_time`, `order` by `kickoff_time` asc/desc, `range(offset, offset+limit-1)`.
   - Request exact `count` for pagination.
6. **Shape Response**:
   - Map rows to `MatchListItemDto`; compute `bettingDeadline = kickoffTime - 5 minutes` in code (UTC).
   - `userBet` present only if join returned a row.
7. **Return** `200` with `items`, `page`, `pageSize`, `total`.
8. **Errors**: On validation → 400; auth → 401; Supabase errors → 500 with generic message and logged details.

## 6. Security Considerations

- Require Supabase-authenticated user; reject if no session.
- Validate and whitelist `sort` to prevent injection / arbitrary ordering.
- Enforce `pageSize` cap (<=100) to avoid resource abuse.
- Use prepared Supabase queries; no string interpolation.
- Ensure only current user's bet is joined (filter by `user_id`).
- Avoid leaking internal errors; log full error server-side, return generic 500 message.

## 7. Error Handling

- **400**: invalid `page/pageSize` bounds, invalid `status`/`sort`, malformed dates (`from`/`to` not ISO). Return `{ error: "invalid_request", message }`.
- **401**: missing/invalid auth token. `{ error: "unauthorized", message: "Auth required" }`.
- **500**: Supabase query failures or unexpected exceptions. `{ error: "server_error", message: "Unexpected error" }`. Log with request id/user id and input params.
- Supabase errors: capture `error.message`/`code` in logs; never echo raw SQL.

## 8. Performance Considerations

- Use existing DB indexes: `idx_matches_status_kickoff_time`, `idx_matches_kickoff_time`; plus unique constraints for IDs.
- Limit `pageSize` to 100; paginate with `range`.
- Select only required columns; avoid `*`.
- Single query with left join avoids N+1 for user bets.
- Consider caching layer later; for now rely on DB indexes since data changes frequently (live matches).

## 9. Implementation Steps

1. **Add validation schema** in `src/lib/validation/matches.ts` (or similar) using zod for `UpcomingMatchesQuerySchema` with defaults/bounds and sort/status enums.
2. **Create service** `src/lib/services/matches.ts` (or extend existing) with `getUpcomingMatches(params, supabase, userId)` implementing the DB query, mapping to DTOs, and computing `bettingDeadline`.
3. **Implement API route** `src/pages/api/matches/upcoming.ts`:
   - Export `GET` handler (Astro server endpoint) with `export const prerender = false`.
   - Extract Supabase client/user from `context.locals`; 401 if absent.
   - Parse/validate query via schema; on failure return 400.
   - Call service; on success return 200 JSON.
   - Catch errors; log with context; return 500 generic JSON.
4. **DTO mapping**: Ensure mapping keys align with `MatchListItemDto` naming (camelCase). Compute `bettingDeadline` in UTC using `kickoffTime - 5 minutes`.
5. **Testing**:
   - Unit-test validation schema edge cases (page/pageSize bounds, invalid status/sort, date parsing).
   - Integration test authenticated request with/without bets, status filter, from/to filter, sort desc.
   - Auth failure test (no token → 401).
6. **Docs**: Ensure route documented in API docs if applicable.
