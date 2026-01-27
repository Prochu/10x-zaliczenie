## API Endpoint Implementation Plan: PATCH `/admin/matches/{matchId}/score`

### 1) Endpoint Overview

- Purpose: Allow admins to set final (or corrected) match scores and status, then trigger bet points recalculation and leaderboard refresh.
- Consumers: Admin UI only (protected). No public caching; executes immediate recalculation.

### 2) Request Details

- HTTP Method: `PATCH`
- URL: `/admin/matches/{matchId}/score`
- Path params (required):
  - `matchId` (UUID)
- Body (JSON) required fields:
  - `home_team_score`: int >= 0
  - `away_team_score`: int >= 0
  - `status`: must be `"finished"` (per spec); allow nullable/enum extension via types to reuse shared command.
- Headers: `Authorization: Bearer <token>` (Supabase JWT)
- Validation:
  - Use Zod schema in route file.
  - Ensure integers, non-negative, `status === "finished"`.
  - Reject NaN/float/strings.
  - Require body fields present.
  - Validate `matchId` as UUID via zod regex/uuid.

### 3) Used Types

- DTOs / Commands from `src/types.ts`:
  - `MatchStatus`, `MatchSummaryDto`
  - `AdminScoreUpdateCommand` (homeScore, awayScore, status)
  - `AdminScoreUpdateResult` (match, recalculatedBets?)
- New/Adjusted (if missing in code):
  - Zod schema for request body mapping to `AdminScoreUpdateCommand`.
  - Error response shape `{ error: string; message: string }`.

### 4) Response Details

- Success 200:
  - Body: `{ "id": "uuid", "home_team_score": int, "away_team_score": int, "status": "finished", "updated_at": "ISO" }`
  - Can reuse `MatchSummaryDto` -> map `match` result to API shape.
- Errors:
  - 400 invalid scores / status / malformed UUID / match not in updatable state.
  - 401 missing/invalid token.
  - 403 user not admin.
  - 404 match not found.
  - 500 unexpected DB or recalculation failure.

### 5) Data Flow

1. Authenticate request via Supabase JWT; get `profile` from locals (must exist).
2. Authorize: check `profiles.is_admin` true; else 403.
3. Parse `matchId` path; validate UUID.
4. Parse and validate body with Zod into `AdminScoreUpdateCommand`.
5. Fetch match by id:
   - If not found -> 404.
6. Update match scores and status in single transaction:
   - Set `home_team_score`, `away_team_score`, `status = 'finished'`, update `updated_at` handled by trigger.
7. Recalculate points for all related bets:
   - For each bet on match, compute points (0/1/2/4) per scoring rules; update `bets.points_awarded`.
8. Refresh leaderboard aggregation (if materialized/denormalized; else on-demand).
9. Return updated match fields (and optional `recalculatedBets` count).

### 6) Security Considerations

- Authentication: require valid Supabase JWT; reject missing/expired -> 401.
- Authorization: enforce `is_admin` from `profiles`; no RLS, so must guard explicitly.
- Input validation: strict Zod schemas to prevent injection, negative scores, wrong status.
- Avoid over-posting: only accept required fields; ignore extras via schema `strip`.
- Prevent race updates: optional optimistic check (e.g., only allow if status != finished) or allow corrections; clarify by allowing overwrite.
- Ensure logging of admin action (app log) for audit; DB already has triggers only for bets, not matches.

### 7) Error Handling

- Standard error JSON `{ error, message }`.
- Map scenarios:
  - Validation failure -> 400 (`invalid_payload`).
  - Auth missing/invalid -> 401 (`not_authenticated`).
  - Not admin -> 403 (`forbidden`).
  - Match missing -> 404 (`match_not_found`).
  - Recalc failure -> 500 (`recalc_failed`), but ensure partial writes avoided via transaction.
- Log server errors with context (matchId, userId) to app logger; no dedicated error table specified.

### 8) Performance Considerations

- Use single DB transaction for update + bet recalculation to avoid inconsistent leaderboard.
- Batch update bets via SQL set-based update; avoid per-row loops.
- Consider background job if bets volume large; for MVP, inline recalculation acceptable.
- Index usage: `bets.match_id`, `matches.id` already indexed.

### 9) Implementation Steps

1. Add route file `src/pages/api/admin/matches/[matchId]/score.ts` (or adjust existing) with `export const prerender = false`.
2. Define Zod schemas:
   - `paramsSchema` for `matchId` UUID.
   - `bodySchema` for `home_team_score`, `away_team_score`, `status` (literal "finished").
3. In handler:
   - Get `supabase` and `user` from `context.locals`.
   - Reject unauthenticated (401).
   - Fetch profile by user.id; enforce `is_admin` (403).
   - Parse params/body; on failure return 400.
4. Service extraction (`src/lib/services/adminScoreService.ts`):
   - `updateScoreAndRecalculate(matchId, command): Promise<AdminScoreUpdateResult>`
   - Internals:
     - Start transaction (Supabase RPC or using `supabaseClient.rpc`? If not available, sequential with error handling).
     - Update match scores/status (`finished`).
     - Recompute points for bets of the match using server-side logic (reuse scoring util if exists; otherwise implement helper).
     - Count updated bets; optionally recompute leaderboard aggregate (if stored).
     - Return updated match summary.
5. Implement scoring helper (reuse existing rules: exact=4, winner+gd/draw=2, winner only=1, else 0).
6. Map service result to response payload per spec (id, scores, status, updated_at).
7. Add error mapping to status codes; ensure messages consistent with API plan.
8. Add tests (unit for scoring helper; integration/e2e for endpoint if harness exists).
9. Verify with manual call (e.g., curl) and ensure 200 + bet recalculations reflected.
