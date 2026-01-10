# API Endpoint Implementation Plan: GET /leaderboard

## 1. Endpoint Overview
- Provide paginated leaderboard of all users, aggregated from `bets.points_awarded`, ordered primarily by total points (desc) and secondarily by nickname (asc).
- Accessible only to authenticated users (per spec 401 on unauthenticated).
- Supports sorting strategy via `sort` query parameter; default `points_desc`.

## 2. Request Details
- HTTP Method: GET
- URL Structure: `/leaderboard`
- Parameters:
  - Required: none (authentication required via session).
  - Optional (query):
    - `page`: integer >= 1, default 1.
    - `pageSize`: integer >= 1, default 50, cap (e.g., 100) to avoid abuse.
    - `sort`: enum `points_desc` (default). (Extendable later if more sort modes added.)
- Request Body: none

## 3. Used Types
- DTOs: `LeaderboardEntryDto`, `LeaderboardResponse`, `PaginatedItems<T>`.
- No command model (read-only endpoint). Introduce `LeaderboardQuery` (service-level) to carry validated pagination/sort.

## 4. Response Details
- Success 200: `LeaderboardResponse` shape
  - `items`: array of `LeaderboardEntryDto` ({ rank, userId, nickname, totalPoints, matchesBet })
  - `page`, `pageSize`, `total`
- Error status codes: 400 (invalid query), 401 (unauthorized), 500 (unexpected server/db failure).
- Empty result returns 200 with empty `items` and totals = 0.

## 5. Data Flow
- Middleware/Auth: ensure supabase auth (use `locals.supabase`) and current session present; otherwise 401.
- Handler (Astro API route `src/pages/api/leaderboard.ts`):
  1) Parse and validate query via Zod schema (page, pageSize, sort).
  2) Invoke service `leaderboardService.getLeaderboard(query, supabase)`.
  3) Map service result to `LeaderboardResponse` and return JSON 200.
- Service (`src/lib/services/leaderboardService.ts`):
  - Accepts validated `LeaderboardQuery`.
  - Executes aggregation against Supabase/PostgREST:
    - Source: `profiles` left join `bets`.
    - Aggregations: `SUM(COALESCE(points_awarded,0)) AS total_points`, `COUNT(bets.id) FILTER (WHERE points_awarded IS NOT NULL) AS matches_bet`.
    - Rank: compute in SQL via window function `DENSE_RANK() OVER (ORDER BY total_points DESC, nickname ASC)`; add offset/limit pagination.
    - Sorting: currently only `points_desc`; keep nickname asc as secondary.
    - Total count: separate count query on profiles (or window `COUNT(*) OVER ()`).
  - Return typed result array + total for pagination.

## 6. Security Considerations
- Authentication required; reject missing/invalid session with 401.
- Do not leak PII beyond nickname and ids.
- Input hardening: clamp `pageSize` to max (e.g., 100) to avoid large scans; coerce page to >=1.
- Use parameterized queries / PostgREST filters; avoid string interpolation to prevent SQL injection.
- Consider rate limiting at middleware if available (not required now but note risk).

## 7. Error Handling
- 400: Zod validation failure for query params (non-integer page/pageSize, invalid sort).
- 401: No authenticated user/session.
- 404: Not applicable (no single resource); do not use.
- 500: Supabase errors, unexpected exceptions; return generic message, log details server-side.
- Logging: log error message and `requestId`/user id if available; if error table exists later, insert there (none defined now).

## 8. Performance Considerations
- Use SQL aggregation with window functions to avoid N+1 and app-side aggregation.
- Leverage existing indexes: `idx_bets_user_id_points_awarded`, `profiles` PK.
- Limit `pageSize` (<=100) and compute `offset = (page-1)*pageSize`.
- Future: materialized view if user base grows; caching layer (short TTL) possible for leaderboard.

## 9. Implementation Steps
1) Create Zod schema `leaderboardQuerySchema` in the route or shared validator module (page>=1, pageSize default 50 max 100, sort enum).
2) Add service file `src/lib/services/leaderboardService.ts` (if absent) with `getLeaderboard(query, supabase)` performing SQL aggregation + pagination + rank.
3) Implement SQL query in service using `supabase.rpc` with a SQL function or `supabase.from('profiles')` via `postgres` client abstraction if available; prefer SQL `WITH ranked AS (...) SELECT ...` including `COUNT(*) OVER () AS total`.
4) Define `LeaderboardQuery` and service return type mapping to `LeaderboardEntryDto`.
5) Implement API route `src/pages/api/leaderboard.ts`:
   - `export const prerender = false;`
   - Handler GET only; obtain supabase from `locals`; guard 401.
   - Parse query via schema; on failure return 400 with error details.
   - Call service; on success return 200 with `LeaderboardResponse`.
   - On Supabase error, log and return 500.
6) Add minimal unit/integration test (if test harness exists) for validation defaults and pagination boundaries; otherwise document manual test steps.
7) Run lint/format.

