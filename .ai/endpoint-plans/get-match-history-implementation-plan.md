# API Endpoint Implementation Plan: GET /matches/history

## 1. Endpoint Overview
- Returns paginated list of completed matches (`status = finished`) including the authenticated user’s bet (if any) and awarded points.
- Read-only endpoint; requires authentication (`401` if unauthenticated).
- Supports kickoff date range filtering and sorting by kickoff time (default desc).

## 2. Request Details
- HTTP Method: GET
- URL Structure: `/matches/history`
- Parameters:
  - Required: none (auth required).
  - Optional query:
    - `page`: integer >= 1, default 1.
    - `pageSize`: integer >= 1, default 20, cap at 100.
    - `sort`: enum `kickoff_time`; companion `order`: `desc` (default) | `asc` (optional).
    - `from`: ISO8601 timestamp (kickoff_time lower bound).
    - `to`: ISO8601 timestamp (kickoff_time upper bound).
- Request Body: none

## 3. Used Types
- DTOs: `MatchHistoryResponse`, `MatchHistoryItemDto`, `MatchSummaryDto`, `UserBetInlineDto`.
- Pagination: `PaginatedItems<T>`.
- Service-level command: introduce `MatchHistoryQuery` carrying validated pagination, sort, range, and `userId`.

## 4. Response Details
- Success 200: `MatchHistoryResponse`
  - `items`: array where each item has `match` (summary) and optional `bet` + `pointsAwarded`.
  - `page`, `pageSize`, `total`.
- Errors: 400 (invalid query), 401 (unauthenticated), 500 (unexpected server/db failure).
- Empty result returns 200 with empty `items` and `total` 0.

## 5. Data Flow
- Auth: use `locals.supabase` to verify session; return 401 if absent.
- Handler (`src/pages/api/matches/history.ts`):
  1) `export const prerender = false;`
  2) Parse/validate query with Zod schema (page, pageSize, sort/order, from/to ISO).
  3) Build `MatchHistoryQuery` with `userId` from session.
  4) Call service `matchHistoryService.getHistory(query, supabase)`.
  5) Map to `MatchHistoryResponse` and return 200 JSON.
- Service (`src/lib/services/matchHistoryService.ts`):
  - Filters: `matches.status = 'finished'`, optional kickoff range, userId join on bets.
  - Join: left join bets on `(bets.match_id = matches.id AND bets.user_id = query.userId)` to fetch user bet + points.
  - Projection: match summary fields + bet scores + `points_awarded`.
  - Sorting: `kickoff_time` with order (default desc).
  - Pagination: `limit pageSize offset (page-1)*pageSize`.
  - Total: count of finished matches matching filters (independent count or window `COUNT(*) OVER ()`).

## 6. Security Considerations
- Authentication required; reject missing/invalid session (401).
- Validate all query params with Zod; coerce numbers and clamp limits to prevent abuse.
- Validate `from`/`to` ISO strings; ensure `from <= to` when both provided.
- Use parameterized Supabase/PostgREST queries to avoid injection.
- Do not expose other users’ bets—join scoped to current user only.

## 7. Error Handling
- 400: Zod validation errors (bad ints, invalid enum/order, malformed dates, from>to).
- 401: No session/user.
- 404: Not applicable (collection endpoint); avoid using.
- 500: Supabase/PostgREST error or unexpected exception; log server-side with context (userId, query). No error-table defined; rely on server logs.
- Error response shape: `{ "error": "code", "message": "description" }` per API plan.

## 8. Performance Considerations
- Use DB indexes: `idx_matches_status`, `idx_matches_kickoff_time`, `idx_matches_status_kickoff_time` aid status/time filter; `idx_bets_user_id_match_id` for join.
- Keep `pageSize` capped (<=100) and use offset/limit.
- Single SQL to fetch items + total via window `COUNT(*) OVER ()` to avoid double query if supported; otherwise run count separately with same filters.
- Select only needed columns to minimize payload.

## 9. Implementation Steps
1) Define Zod schema `matchHistoryQuerySchema` in the route (or shared validators): page (default 1, min 1), pageSize (default 20, max 100), sort fixed to `kickoff_time`, order `desc|asc` (default desc), from/to as optional ISO strings with refinement `from <= to`.
2) Create/extend `src/lib/services/matchHistoryService.ts` with `getHistory(query, supabase)`; define `MatchHistoryQuery` type.
3) Implement service query using Supabase/PostgREST or RPC:
   - Filter `status = 'finished'`.
   - Apply from/to filters on `kickoff_time`.
   - Left join bets for current user to get bet + points.
   - Apply order and pagination; compute total.
   - Map DB rows to `MatchHistoryItemDto`.
4) Add API route `src/pages/api/matches/history.ts`:
   - `prerender = false`; GET handler only.
   - Obtain supabase from `locals`; guard 401.
   - Parse query with schema; on failure return 400 with error detail.
   - Call service; on success return 200 `MatchHistoryResponse`.
   - Catch errors, log, return 500 with generic message.
5) Update `src/types.ts` only if new helper types are needed (e.g., `MatchHistoryQuery` stays internal to service, DTOs already exist).
6) Add minimal tests (if harness exists) or document manual checks: defaults, from/to filtering, ordering, empty result.
7) Run lint/format.

