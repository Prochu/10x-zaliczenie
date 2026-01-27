# API Endpoint Implementation Plan: PUT `/matches/{matchId}/bet`

## 1. Endpoint Overview

Upsert the authenticated user’s bet (score prediction) for a given match before the betting deadline. Returns the persisted bet record.

## 2. Request Details

- HTTP Method: PUT
- URL Structure: `/matches/{matchId}/bet`
- Parameters:
  - Required: `matchId` (path, UUID)
  - Optional: none
- Request Body: JSON matching `BetUpsertCommand`
  - `homeScore` (int ≥ 0)
  - `awayScore` (int ≥ 0)
- Headers: `Authorization: Bearer <access_token>`
- Validation: use Zod schema for body; validate `matchId` as UUID string.

## 3. Used Types

- Command: `BetUpsertCommand` (`homeScore: number; awayScore: number`)
- DTO: `BetDto` / `BetResponse`
- Entities: `matches`, `bets` tables; implicit `bet_logs` via DB trigger.

## 4. Response Details

- Success `200 OK`: `BetResponse` with persisted values (`id`, `matchId`, `homeScore`, `awayScore`, `pointsAwarded`, `createdAt`, `updatedAt`).
- Error codes:
  - `400` invalid input (schema fail), non-positive scores, or non-UUID `matchId`.
  - `401` unauthenticated.
  - `403` betting locked (status not `scheduled|live`, or within 5 minutes of kickoff).
  - `404` match not found.
  - `500` unexpected server error.

## 5. Data Flow

1. Authenticate via Supabase auth (supabase from `context.locals`).
2. Parse and validate `matchId` UUID path param.
3. Parse and validate body with Zod → `BetUpsertCommand`.
4. Fetch match by `id` from `matches`:
   - If missing → `404`.
   - Compute `bettingDeadline = kickoff_time - 5 minutes`.
   - Guard: status must be `scheduled` or `live`.
   - Guard: `now < bettingDeadline`; otherwise `403`.
5. Upsert bet:
   - Use `bets` table unique `(user_id, match_id)`.
   - Insert on absence; update `home_score`, `away_score`, `updated_at` on conflict.
   - Return resulting row.
6. DB trigger auto-writes to `bet_logs` for audit; no app action required.
7. Shape response as `BetResponse` and return `200`.

## 6. Security Considerations

- Require authentication; reject absent/invalid token with `401`.
- Path param UUID validation to avoid injection.
- Enforce user isolation: upsert uses `user_id` from auth context; never accept userId from client.
- Betting window enforcement (status + deadline) to prevent late bets.
- Rate limiting (if middleware exists) recommended to prevent brute-force/bot abuse; otherwise note as follow-up.

## 7. Error Handling

- Validation errors → `400` with message from Zod (sanitized).
- Match not found → `404`.
- Betting locked (status not allowed or deadline passed/<= now) → `403` with reason.
- Supabase insert/update errors (constraint, DB failure) → `500` with generic message; log details server-side.
- Auth failure → `401`.
- Logging: use existing server logger/console; DB audit handled by `bet_logs` trigger.

## 8. Performance Considerations

- Single match lookup by PK (`matches_pkey`).
- Upsert uses unique index on `(user_id, match_id)`; minimal latency.
- Avoid extra round-trips: select match once; returning clause on upsert to avoid follow-up fetch.
- Ensure only necessary columns selected.

## 9. Implementation Steps

1. **Define validation**: Zod schema for path `matchId` (UUID) and body (`homeScore`, `awayScore` int ≥ 0). Place schema in handler or shared validator file under `src/lib`.
2. **Add service**: `src/lib/services/bets.ts` (new if absent) with function `upsertUserBet({ supabase, userId, matchId, homeScore, awayScore, now })` handling match fetch, deadline/status guards, and upsert. Keep DB logic out of route.
3. **Route handler**: In `src/pages/api/matches/[matchId]/bet.ts` (Astro endpoint):
   - Extract `supabase` from `context.locals`.
   - Authenticate user (e.g., `supabase.auth.getUser()`), fail `401` if missing.
   - Validate params/body; on failure return `400`.
   - Call service; map domain errors to HTTP codes (`NotFound`→404, `BetLocked`→403, `ValidationError`→400).
   - Return `BetResponse` with `200`.
4. **Error mapping**: Define lightweight error classes or discriminated error results inside service for `MatchNotFound`, `BetLocked`.
5. **Testing/validation**: Add unit/integration tests for service guards (deadline, status), upsert behavior, and route error mapping if test harness exists.
6. **Docs**: Ensure any API docs/openapi (if present) updated with constraints and responses.
