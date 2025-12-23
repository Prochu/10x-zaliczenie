# REST API Plan

## 1. Resources
- `profiles` (table: `profiles`) — user profile, nickname, admin flag linked to Supabase `auth.users`.
- `groups` (table: `groups`) — group metadata; MVP uses single default group.
- `user_groups` (table: `user_groups`) — membership mapping; implicitly managed for default group.
- `matches` (table: `matches`) — Champions League matches synced from external API.
- `bets` (table: `bets`) — user score predictions per match with awarded points.
- `bet_logs` (table: `bet_logs`) — audit log of bet create/update actions.

## 2. Endpoints

### Profiles
- **POST `/profiles/nickname`**
  - Description: Set initial nickname for authenticated user; validates uniqueness and format.
  - Request JSON: `{ "nickname": "string (3-15 alphanumeric)" }`
  - Response JSON: `{ "id": "uuid", "nickname": "string", "is_admin": false }`
  - Success: `201 Created`
  - Errors: `400` invalid format; `409` nickname taken; `401` unauthenticated; `409` if nickname already set.

- **GET `/me`**
  - Description: Return current user profile with membership info.
  - Response JSON: `{ "id": "uuid", "nickname": "string", "is_admin": bool, "groups": [{ "id": "uuid", "name": "string", "is_default": true }] }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated.

### Matches
- **GET `/matches/upcoming`**
  - Description: List scheduled or live matches with betting deadline and user bet (if any).
  - Query: `page` (int, default 1), `pageSize` (int, default 20, max 100), `status` (`scheduled|live`, default both), `from`/`to` (ISO timestamps for kickoff range), `sort` (`kickoff_time` asc/desc).
  - Response JSON: `{ "items": [ { "id": "uuid", "api_match_id": "string", "home_team_name": "string", "away_team_name": "string", "home_team_logo": "url|null", "away_team_logo": "url|null", "kickoff_time": "ISO8601 UTC", "status": "scheduled|live", "betting_deadline": "ISO8601 UTC", "home_team_score": int|null, "away_team_score": int|null, "user_bet": { "home_score": int, "away_score": int }|null } ], "page": 1, "pageSize": 20, "total": int }`
  - Success: `200 OK`; empty `items` allowed (display friendly message).
  - Errors: `401` unauthenticated.

- **GET `/matches/{matchId}`**
  - Description: Fetch single match with user bet and deadline info.
  - Response JSON: `{ "id": "uuid", "api_match_id": "string", "home_team_name": "string", "away_team_name": "string", "kickoff_time": "ISO8601 UTC", "status": "match_status", "home_team_score": int|null, "away_team_score": int|null, "betting_deadline": "ISO8601 UTC", "user_bet": { "home_score": int, "away_score": int, "points_awarded": int|null }|null }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated; `404` not found.

### Bets
- **PUT `/matches/{matchId}/bet`**
  - Description: Create or update the authenticated user’s bet (upsert) before deadline; logs to `bet_logs`.
  - Request JSON: `{ "home_score": int>=0, "away_score": int>=0 }`
  - Response JSON: `{ "id": "uuid", "match_id": "uuid", "home_score": int, "away_score": int, "points_awarded": int|null, "created_at": "ISO", "updated_at": "ISO" }`
  - Success: `200 OK` (upsert)
  - Errors: `400` invalid scores; `403` betting locked (<=5 minutes to kickoff or status not `scheduled`/`live`); `404` match not found; `401` unauthenticated.

- **GET `/matches/{matchId}/bet`**
  - Description: Get current user’s bet for the match.
  - Response JSON: `{ "id": "uuid", "home_score": int, "away_score": int, "points_awarded": int|null }`
  - Success: `200 OK`; `204` if no bet yet.
  - Errors: `401` unauthenticated; `404` match not found.

- **GET `/me/bet-logs`**
  - Description: Paginated audit history of current user’s bet actions.
  - Query: `page`, `pageSize` (default 20), `matchId` (optional filter).
  - Response JSON: `{ "items": [ { "id": "uuid", "match_id": "uuid", "action": "created|updated", "home_score": int, "away_score": int, "created_at": "ISO" } ], "page": 1, "pageSize": 20, "total": int }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated.

### Leaderboard and History
- **GET `/leaderboard`**
  - Description: Aggregated rankings across users; recalculated from `bets.points_awarded`.
  - Query: `page` (default 1), `pageSize` (default 50), `sort` (`points_desc` default, secondary nickname asc).
  - Response JSON: `{ "items": [ { "rank": int, "user_id": "uuid", "nickname": "string", "total_points": int, "matches_bet": int } ], "page": 1, "pageSize": 50, "total": int }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated.

- **GET `/matches/history`**
  - Description: Completed matches with user’s prediction and awarded points.
  - Query: `page`, `pageSize`, `sort` (`kickoff_time` desc default), `from`/`to` (kickoff range).
  - Response JSON: `{ "items": [ { "match_id": "uuid", "home_team_name": "string", "away_team_name": "string", "home_team_score": int, "away_team_score": int, "kickoff_time": "ISO8601 UTC", "user_bet": { "home_score": int, "away_score": int }, "points_awarded": int|null } ], "page": 1, "pageSize": 20, "total": int }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated.

### Admin
- **GET `/admin/matches`**
  - Description: List matches (finished or any status) for admin review/edit.
  - Query: `status` (any `match_status`), `page`, `pageSize`, `sort` (`kickoff_time` desc default).
  - Response JSON: `{ "items": [ { "id": "uuid", "home_team_name": "string", "away_team_name": "string", "home_team_score": int|null, "away_team_score": int|null, "status": "match_status", "kickoff_time": "ISO8601 UTC" } ], "page": 1, "pageSize": 20, "total": int }`
  - Success: `200 OK`
  - Errors: `401` unauthenticated; `403` not admin.

- **PATCH `/admin/matches/{matchId}/score`**
  - Description: Admin updates final score; triggers points recalculation and leaderboard refresh.
  - Request JSON: `{ "home_team_score": int>=0, "away_team_score": int>=0, "status": "finished" }`
  - Response JSON: `{ "id": "uuid", "home_team_score": int, "away_team_score": int, "status": "finished", "updated_at": "ISO" }`
  - Success: `200 OK`
  - Errors: `400` invalid scores; `401` unauthenticated; `403` not admin; `404` match not found.

- **POST `/admin/sync-matches`**
  - Description: Admin-triggered sync from external API; idempotent via `api_match_id` uniqueness.
  - Request JSON: `{ "from": "ISO date", "to": "ISO date" }` (optional range)
  - Response JSON: `{ "synced": int, "updated": int, "skipped": int }`
  - Success: `202 Accepted` (async) or `200 OK` (sync)
  - Errors: `401` unauthenticated; `403` not admin; `429` if sync throttled.

## 3. Authentication and Authorization
- Auth via Supabase JWT (access token) sent as `Authorization: Bearer <token>`; server verifies via Supabase client.
- Profiles are linked to `auth.users`; nickname creation required after first login.
- Admin determined by `profiles.is_admin`; admin-only routes enforce server-side check.
- No RLS in DB for MVP; all access control enforced in API layer.
- Session management handled client-side with Supabase SDK; API rejects missing/expired tokens with `401`.

## 4. Validation and Business Logic
- Nickname: required, unique, 3-15 chars, alphanumeric only; reject duplicates.
- Betting: allowed only while `now < kickoff_time - 5 minutes` and match status in `scheduled|live`; scores must be integers ≥0; one bet per user per match (upsert enforces unique constraint).
- Scoring: Points computed server-side only (0/1/2/4) per rules; stored in `bets.points_awarded`; recalculated when match scores change.
- Match updates: Only admins may set final scores; scores non-negative; status uses `match_status` enum; updating to `finished` triggers recalculation of all related bets and leaderboard aggregation.
- Leaderboard: Aggregate `SUM(points_awarded)` grouped by user; ordered descending; ties by nickname.
- Time: All timestamps UTC ISO8601; responses include `betting_deadline` computed as `kickoff_time - 5 minutes`.
- Rate limiting: External API sync capped to stay under 7000 requests/day; cache match data in `matches`; live updates every 5 minutes; consider internal rate limiting on `/admin/sync-matches` and per-IP throttling on public endpoints.
- Audit: `bet_logs` automatically populated on bet create/update; exposed to user via `/me/bet-logs` for transparency; available for admin investigations via DB access or future endpoint.
- Groups: For MVP all users assigned to default group; no group selection input; future-proof schema already supports multi-group.
- Error handling: Use consistent JSON errors `{ "error": "code", "message": "description" }`; prefer `400` for validation, `401/403` for auth, `404` for missing, `409` for uniqueness conflicts, `429` for rate limits.
# REST API Plan

## 1. Resources
- `auth` → Supabase `auth.users` (managed by Supabase SDK)
- `profiles` → `profiles` table (nickname, is_admin)
- `groups` → `groups` table (single default group for MVP)
- `userGroups` → `user_groups` table (membership)
- `matches` → `matches` table (Champions League fixtures)
- `bets` → `bets` table (user predictions)
- `betLogs` → `bet_logs` table (audit trail)
- `leaderboard` → aggregation over `bets` + `profiles`

## 2. Endpoints

### Auth (handled by Supabase)
- `POST /api/auth/start`  
  - Desc: Start OAuth sign-in (Google/Facebook/Apple) via Supabase; returns redirect URL.  
  - Body: `{ "provider": "google" | "facebook" | "apple", "redirectUrl": "string" }`  
  - Success: `200 { "url": "string" }`  
  - Errors: `400 invalid provider`, `500 auth_init_failed`

- `POST /api/auth/exchange`  
  - Desc: Exchange Supabase auth code for session; sets httpOnly cookie with access token + returns profile existence.  
  - Body: `{ "code": "string" }`  
  - Success: `200 { "hasProfile": boolean }`  
  - Errors: `400 missing_code`, `401 invalid_code`, `500 auth_exchange_failed`

- `POST /api/auth/logout`  
  - Desc: Revokes session and clears cookies.  
  - Success: `204`  
  - Errors: `401 not_authenticated`, `500 logout_failed`

### Profiles
- `POST /api/profiles`  
  - Desc: Create nickname on first login; assigns to default group. Requires authenticated user without profile.  
  - Body: `{ "nickname": "string(3-15 alphanumeric)" }`  
  - Success: `201 { "id": "uuid", "nickname": "string", "isAdmin": false }`  
  - Errors: `400 invalid_nickname`, `409 nickname_taken`, `409 profile_exists`, `500 create_failed`

- `GET /api/me`  
  - Desc: Get current user profile with group membership.  
  - Success: `200 { "id": "uuid", "nickname": "string", "isAdmin": boolean, "groups": [ { "id": "uuid", "name": "string", "isDefault": true } ] }`  
  - Errors: `401 not_authenticated`, `404 profile_missing`, `500 fetch_failed`

### Matches
- `GET /api/matches`  
  - Desc: List matches with optional filters. If authenticated and the user has a bet on a match, include it inline.  
  - Query: `status=scheduled|live|finished|cancelled|postponed`, `from=ISO8601`, `to=ISO8601`, `page`, `pageSize(1-100)`, `sort=kickoff_time|status`, `order=asc|desc`.  
  - Success: `200 { "data": [match], "page": n, "pageSize": n, "total": n }`  
  - `match`: `{ "id":"uuid","homeTeam":"string","awayTeam":"string","homeScore":int|null,"awayScore":int|null,"kickoffTime":"ISO8601","status":"enum","homeLogo": "string|null","awayLogo": "string|null", "bet": bet|null }`  
  - `bet` (when present): `{ "id":"uuid","homeScore":int,"awayScore":int,"pointsAwarded":int|null,"updatedAt":"ISO8601" }`  
  - Errors: `400 invalid_filter`, `500 fetch_failed`

- `GET /api/matches/:id`  
  - Desc: Match detail with user's bet (if authenticated).  
  - Success: `200 { "match": match, "bet": bet|null, "bettingDeadline": "ISO8601" }`  
  - Errors: `404 not_found`, `500 fetch_failed`

- `PATCH /api/matches/:id` (admin)  
  - Desc: Update match metadata/status (e.g., kickoff time, status, team logos); does not assign points—use score override endpoint for final scores.  
  - Body: `{ "kickoffTime"?: "ISO8601", "status"?: "scheduled" | "live" | "finished" | "cancelled" | "postponed", "homeTeamLogo"?: "string|null", "awayTeamLogo"?: "string|null" }`  
  - Success: `200 { "match": match }`  
  - Errors: `401 not_authenticated`, `403 forbidden`, `404 match_not_found`, `400 invalid_payload`, `500 update_failed`

### Bets
- `PUT /api/matches/:id/bet`  
  - Desc: Create or update authenticated user bet before deadline (kickoff - 5m).  
  - Body: `{ "homeScore": int>=0, "awayScore": int>=0 }`  
  - Success: `200 { "id":"uuid","matchId":"uuid","homeScore":int,"awayScore":int,"pointsAwarded":int|null,"updatedAt":"ISO8601" }`  
  - Errors: `400 invalid_scores`, `403 betting_closed`, `404 match_not_found`, `409 duplicate_bet` (if unique constraint hit unexpectedly), `500 upsert_failed`

- `GET /api/bets`  
  - Desc: List current user bets with match info; filter by status.  
  - Query: `status=scheduled|live|finished`, `page`, `pageSize`, `sort=kickoff_time|updated_at`, `order=asc|desc`.  
  - Success: `200 { "data": [ { "bet": bet, "match": match } ], "page": n, "pageSize": n, "total": n }`  
  - Errors: `401 not_authenticated`, `400 invalid_filter`, `500 fetch_failed`

### Leaderboard
- `GET /api/leaderboard`  
  - Desc: Ranked totals across all users (default group).  
  - Query: `page`, `pageSize`, `sort=points|nickname`, `order=asc|desc`.  
  - Success: `200 { "data": [ { "rank": int, "nickname": "string", "totalPoints": int, "betsCount": int } ], "page": n, "pageSize": n, "total": n }`  
  - Errors: `500 fetch_failed`

### Match History
- `GET /api/history`  
  - Desc: Completed matches with user bet and awarded points.  
  - Query: `page`, `pageSize`, `sort=kickoff_time|points_awarded`, `order=asc|desc`.  
  - Success: `200 { "data": [ { "match": match, "bet": bet|null } ], "page": n, "pageSize": n, "total": n }`  
  - Errors: `401 not_authenticated`, `500 fetch_failed`

### Admin (requires `is_admin=true`)
- `PATCH /api/matches/:id/score`  
  - Desc: Manually override final score; recalculates points and leaderboard.  
  - Body: `{ "homeScore": int>=0, "awayScore": int>=0, "status": "finished" | "cancelled" | "postponed" | null }`  
  - Success: `200 { "match": match, "recalculatedBets": int }`  
  - Errors: `401 not_authenticated`, `403 forbidden`, `404 match_not_found`, `400 invalid_scores`, `500 update_failed`

- `GET /api/bet-logs`  
  - Desc: Audit log listing for admins.  
  - Query: `userId`, `matchId`, `page`, `pageSize`, `order=desc|asc`.  
  - Success: `200 { "data": [ { "id":"uuid","userId":"uuid","matchId":"uuid","homeScore":int,"awayScore":int,"action":"created|updated","createdAt":"ISO8601" } ], "page": n, "pageSize": n, "total": n }`  
  - Errors: `401 not_authenticated`, `403 forbidden`, `500 fetch_failed`

## 3. Authentication and Authorization
- Use Supabase auth JWT (access token in httpOnly cookie). Every API route validates token via Supabase server SDK and loads `auth.user`.  
- Authorization:  
  - Any authenticated user: `POST /api/profiles`, `GET /api/me`, bets endpoints, history.  
  - Admin-only (`profiles.is_admin = true`): score override, bet logs.  
- CSRF: rely on same-site `lax` cookies or double-submit token for PUT/PATCH/POST.  
- Rate limiting: per-IP + per-user (e.g., 60 req/min) with stricter limits on write endpoints; additional guard on external API sync to respect 7000 req/day.

## 4. Validation and Business Logic
- Profiles: nickname required, 3–15 chars, alphanumeric only; uniqueness enforced; one profile per user; auto-assign to default group.  
- Matches: `status` in `scheduled|live|finished|cancelled|postponed`; scores are integers ≥0; kickoffTime required ISO date.  
- Bets: integers ≥0; unique `(user_id, match_id)`; cannot upsert after `kickoff_time - 5 minutes`; pointsAwarded ∈ {0,1,2,4} when present.  
- Leaderboard: computed `SUM(points_awarded)` grouped by user; ties resolved by nickname ascending.  
- History: only `finished` matches; include bet if exists.  
- Matches list: when authenticated, include the caller’s bet inline per match to avoid separate bet listing.  
- Admin score override: updates match scores and status, triggers recalculation of bet points and leaderboard refresh.  
- Admin match update: PATCH allows non-score metadata/status updates; still validates status enum and kickoff time format.  
- Error handling: use consistent error codes/messages; return validation errors with field details.  
- Pagination defaults: `page=1`, `pageSize=20`, max `pageSize=100`. Sorting defaults to `kickoff_time asc` where applicable.  
- Security: validate UUIDs, enforce ownership on bets (user can only modify own bet), log admin actions.  
- Performance: use indexes from schema (`matches.status`, `matches.kickoff_time`, `bets.user_id,match_id`, `bet_logs.user_id`) to back filters; eager-load match data for bets; cache leaderboard for short intervals during live play.  

