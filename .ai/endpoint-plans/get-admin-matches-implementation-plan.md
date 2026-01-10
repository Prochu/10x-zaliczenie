# API Endpoint Implementation Plan: GET /admin/matches

## 1. Endpoint Overview
Admin-only listing of matches (any `match_status`) for review/edit screens. Returns paginated matches with scores, status, kickoff time (and existing summary fields) sorted by kickoff time descending by default.

## 2. Request Details
- HTTP Method: GET
- URL Structure: `/admin/matches`
- Parameters:
  - Required: none (auth required)
  - Optional query:
    - `status`: enum `match_status` (`scheduled|live|finished|cancelled|postponed`)
    - `page`: int >= 1, default 1
    - `pageSize`: int 1-100, default 20
    - `sort`: `kickoff_time_desc` (default) or `kickoff_time_asc`
- Request Body: none

## 3. Used Types
- Existing DTOs: `AdminMatchListItemDto`, `AdminMatchesResponse`, `MatchStatus`, `PaginatedItems`.
- New helper/command: `AdminMatchesQuery` (parsed query params) to type the service input.
- Validation schema: `adminMatchesQuerySchema` (Zod) enforcing the params above with defaults/max page size.

## 4. Response Details
- Success `200`: `AdminMatchesResponse` (`{ items: AdminMatchListItemDto[], page, pageSize, total }`).
- Fields per item: `id`, `apiMatchId`, `homeTeamName`, `awayTeamName`, `homeTeamLogo`, `awayTeamLogo`, `homeTeamScore|null`, `awayTeamScore|null`, `status`, `kickoffTime`, derived `bettingDeadline`.
- Empty list allowed when no matches.

## 5. Data Flow
1) Parse query via `adminMatchesQuerySchema` (defaults applied).  
2) Authenticate via `locals.supabase` (`supabase.auth.getUser()` or existing middleware-provided user); reject missing user (`401`).  
3) Load profile (e.g., `profiles` table) and enforce `is_admin` (`403`).  
4) Call `adminMatchesService.listMatches(supabase, query)`:
   - Build base query on `matches` selecting required columns only.
   - Optional `status` filter.
   - Ordering by `kickoff_time` asc/desc.
   - Pagination using `range` with `page/pageSize`.
   - Count via `select("*", { count: "exact", head: true })` or `select("id", { count: "exact", head: true })`.
5) Map rows to `AdminMatchListItemDto` adding `bettingDeadline = kickoff_time - 5 minutes`.
6) Return `AdminMatchesResponse`.

## 6. Security Considerations
- Auth: require valid Supabase JWT from `Authorization` header/cookie; fail `401` if absent/expired.
- Authorization: fetch profile and assert `is_admin === true`; else `403`.
- Validation: strict Zod schema for query params (enum for status, bounded pagination, whitelisted sort) to prevent injection/unbounded queries.
- Data minimization: return only necessary columns; avoid PII.
- Rate limiting: reuse existing middleware if present; otherwise note future per-IP guard (admin surface).
- Logging: log validation/auth failures (without secrets); log Supabase errors with request id for tracing.

## 7. Error Handling
- `400` for invalid query params (Zod errors -> normalized `{ error, message }`).
- `401` when unauthenticated.
- `403` when authenticated but not admin.
- `500` for unexpected Supabase/database failures (include generic message; avoid leaking internals).
- No `404` for the list endpoint; empty list is valid.

## 8. Performance Considerations
- Use DB indexes `idx_matches_status`, `idx_matches_kickoff_time`.
- Select only needed columns; avoid joins (single table scan).
- Use `range` pagination and `count: "exact"` with head query to keep payload small.
- Default pageSize 20; enforce max 100 to cap load.
- Consider response caching headers disabled (admin-only, dynamic).

## 9. Implementation Steps
1. Add Zod schema `adminMatchesQuerySchema` (e.g., `src/lib/validation/admin.ts`) with defaults and bounds; export `AdminMatchesQuery` type from `z.infer`.
2. Implement service `src/lib/services/admin-matches.service.ts` with `listMatches(supabase, query)` performing filtered select, count, pagination, sort, and DTO mapping (including `bettingDeadline` helper).
3. Create API route `src/pages/api/admin/matches.ts`:
   - Export `GET`.
   - Parse query via schema; return `400` on failure.
   - Use `locals.supabase` to get user; load profile (reuse helper if exists) and enforce admin (`403`).
   - Call service; on success return `200` JSON `AdminMatchesResponse`.
   - Wrap Supabase errors into `500` with consistent error envelope.
4. Add unit/integration tests if test harness exists (service logic and validator).
5. Document defaults and sample call if API docs need updates.

